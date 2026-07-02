import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { query } from "./db-pool.js";

const ADMIN_SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const POST_LIST_SELECT = `
  p.id, p.title, p.slug, p.excerpt, p.featured_image AS "featuredImage",
  p.status, p.is_featured AS "isFeatured", p.tags, p.publish_at AS "publishAt",
  p.category_id AS "categoryId", p.seo_title AS "seoTitle",
  p.meta_description AS "metaDescription", p.views, p.reading_time AS "readingTime",
  p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  c.name AS "categoryName", c.slug AS "categorySlug"
`;

function sessionSecret() {
  return process.env.SESSION_SECRET?.trim() || "dev-blog-secret-key";
}

function otpSecret() {
  return process.env.SESSION_SECRET?.trim() || "dev-blog-otp-secret";
}

function signCookie(val) {
  const mac = createHmac("sha256", sessionSecret())
    .update(val)
    .digest("base64")
    .replace(/=+$/, "");
  return `${val}.${mac}`;
}

function unsignCookie(val) {
  if (!val || typeof val !== "string") return false;
  const str = val.slice(0, val.lastIndexOf("."));
  const mac = signCookie(str);
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(val);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  return str;
}

function parseCookies(req) {
  const cookies = {};
  for (const part of (req.headers?.cookie || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    cookies[trimmed.slice(0, eq)] = decodeURIComponent(trimmed.slice(eq + 1));
  }
  return cookies;
}

function parseQuery(rawUrl) {
  const q = {};
  const idx = (rawUrl ?? "").indexOf("?");
  if (idx === -1) return q;
  for (const part of rawUrl.slice(idx + 1).split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
    const v = decodeURIComponent(eq === -1 ? "" : part.slice(eq + 1));
    q[k] = v;
  }
  return q;
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function setNoCache(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function setSessionCookie(res, sid) {
  const signed = encodeURIComponent(`s:${signCookie(sid)}`);
  const maxAgeSec = Math.floor(ADMIN_SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    `connect.sid=${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`,
  );
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "connect.sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
}

async function loadSession(req) {
  const raw = parseCookies(req)["connect.sid"];
  if (!raw) return null;
  let decoded = raw;
  if (decoded.startsWith("s:")) decoded = decoded.slice(2);
  const sid = unsignCookie(decoded);
  if (!sid) return null;
  const { rows } = await query(
    `SELECT sess FROM session WHERE sid = $1 AND expire > NOW() LIMIT 1`,
    [sid],
  );
  if (!rows[0]?.sess) return null;
  const sess = typeof rows[0].sess === "string" ? JSON.parse(rows[0].sess) : rows[0].sess;
  return { sid, sess };
}

function isAdminValid(sess) {
  if (!sess?.adminAuthenticated || !sess?.adminLoginAt) return false;
  return Date.now() - sess.adminLoginAt < ADMIN_SESSION_TTL_MS;
}

function authPayload(sess) {
  const valid = sess && isAdminValid(sess);
  return {
    authenticated: Boolean(valid),
    username: valid ? (sess.adminUsername ?? null) : null,
    expiresAt: valid ? sess.adminLoginAt + ADMIN_SESSION_TTL_MS : null,
  };
}

function verifyPassword(password, stored) {
  const colon = stored.indexOf(":");
  if (colon === -1) return false;
  const salt = stored.slice(0, colon);
  const hash = stored.slice(colon + 1);
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

async function verifyAdminLogin(username, password) {
  const envUser = process.env.ADMIN_USERNAME?.trim() || "admin";
  const envPass = process.env.ADMIN_PASSWORD || "admin123";
  try {
    const { rows } = await query(`SELECT username, password_hash AS "passwordHash" FROM admin_credentials LIMIT 1`);
    const creds = rows[0];
    if (!creds) {
      if (username === envUser && password === envPass) return { ok: true, username: envUser };
      return { ok: false };
    }
    if (username !== creds.username || !verifyPassword(password, creds.passwordHash)) {
      return { ok: false };
    }
    return { ok: true, username: creds.username };
  } catch {
    if (username === envUser && password === envPass) return { ok: true, username: envUser };
    return { ok: false };
  }
}

function hashOtp(code) {
  return createHmac("sha256", otpSecret()).update(code).digest("hex");
}

async function issueOtp(username) {
  const code = String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await query(`DELETE FROM admin_otp_codes WHERE purpose = 'login' AND username = $1`, [username]);
  await query(
    `INSERT INTO admin_otp_codes (purpose, username, code_hash, attempts, expires_at)
     VALUES ('login', $1, $2, 0, $3)`,
    [username, hashOtp(code), expiresAt],
  );
  return code;
}

async function verifyOtp(username, code) {
  const normalized = code.replace(/\D/g, "").trim();
  if (normalized.length !== OTP_LENGTH) return { ok: false, error: "Invalid verification code" };
  const { rows } = await query(
    `SELECT id, code_hash AS "codeHash", attempts FROM admin_otp_codes
     WHERE purpose = 'login' AND username = $1 AND expires_at > NOW() LIMIT 1`,
    [username],
  );
  const row = rows[0];
  if (!row) return { ok: false, error: "Code expired or not found. Request a new one." };
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await query(`DELETE FROM admin_otp_codes WHERE id = $1`, [row.id]);
    return { ok: false, error: "Too many attempts. Request a new code." };
  }
  const expected = Buffer.from(row.codeHash, "hex");
  const actual = Buffer.from(hashOtp(normalized), "hex");
  const valid = expected.length === actual.length && timingSafeEqual(expected, actual);
  if (!valid) {
    await query(`UPDATE admin_otp_codes SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
    return { ok: false, error: "Invalid verification code" };
  }
  await query(`DELETE FROM admin_otp_codes WHERE id = $1`, [row.id]);
  return { ok: true };
}

async function sendLoginOtpEmail(username, code) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_EMAIL?.trim() || process.env.RESEND_FROM_EMAIL?.match(/<([^>]+)>/)?.[1];
  if (!apiKey || !to) return { ok: false };
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || `TechVentry <info@techventry.com>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      from,
      to: [to],
      subject: "TechVentry admin sign-in code",
      html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    }),
  });
  return { ok: res.ok };
}

async function saveAdminSession(res, username) {
  const sid = randomBytes(24).toString("hex");
  const maxAge = ADMIN_SESSION_TTL_MS;
  const expires = new Date(Date.now() + maxAge);
  const sess = {
    cookie: {
      originalMaxAge: maxAge,
      expires: expires.toISOString(),
      secure: true,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    },
    adminAuthenticated: true,
    adminUsername: username,
    adminLoginAt: Date.now(),
  };
  await query(`INSERT INTO session (sid, sess, expire) VALUES ($1, $2, $3)`, [
    sid,
    JSON.stringify(sess),
    expires,
  ]);
  setSessionCookie(res, sid);
}

async function destroySession(req, res) {
  const loaded = await loadSession(req);
  if (loaded?.sid) {
    await query(`DELETE FROM session WHERE sid = $1`, [loaded.sid]);
  }
  clearSessionCookie(res);
}

function formatPost(row) {
  return {
    ...row,
    tags: row.tags ?? [],
    publishAt: row.publishAt ? new Date(row.publishAt).toISOString() : null,
    categoryName: row.categoryName ?? null,
    categorySlug: row.categorySlug ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export function isAdminRoutePath(path) {
  if (path === "/api/auth/me") return true;
  if (path === "/api/auth/login") return true;
  if (path === "/api/auth/verify-otp") return true;
  if (path === "/api/auth/logout") return true;
  if (path === "/api/stats/overview") return true;
  if (path === "/api/stats/posts") return true;
  if (path === "/api/posts") return true;
  return false;
}

export async function tryAdminRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();

  try {
    if (method === "GET" && path === "/api/auth/me") {
      setNoCache(res);
      const loaded = await loadSession(req);
      sendJson(res, 200, authPayload(loaded?.sess));
      return true;
    }

    if (method === "POST" && path === "/api/auth/login") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const { username, password } = body;
      if (!username || !password) {
        sendJson(res, 401, { authenticated: false, username: null, otpRequired: false });
        return true;
      }
      const result = await verifyAdminLogin(String(username).trim(), String(password));
      if (!result.ok) {
        sendJson(res, 401, { authenticated: false, username: null, otpRequired: false });
        return true;
      }
      const code = await issueOtp(result.username);
      const sent = await sendLoginOtpEmail(result.username, code);
      if (!sent.ok && process.env.NODE_ENV !== "development") {
        sendJson(res, 503, {
          authenticated: false,
          username: null,
          otpRequired: false,
          error: "Could not send verification email. Check RESEND_API_KEY and ADMIN_EMAIL.",
        });
        return true;
      }
      sendJson(res, 200, {
        authenticated: false,
        username: result.username,
        otpRequired: true,
        message: sent.ok
          ? "Verification code sent to your admin email."
          : "Email could not be sent. Check server logs in development.",
      });
      return true;
    }

    if (method === "POST" && path === "/api/auth/verify-otp") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const username = body.username?.trim();
      const otp = body.otp;
      if (!username || !otp) {
        sendJson(res, 400, { authenticated: false, username: null, error: "Username and code are required" });
        return true;
      }
      const verified = await verifyOtp(username, String(otp));
      if (!verified.ok) {
        sendJson(res, 401, { authenticated: false, username: null, error: verified.error });
        return true;
      }
      await saveAdminSession(res, username);
      sendJson(res, 200, {
        authenticated: true,
        username,
        expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
      });
      return true;
    }

    if (method === "POST" && path === "/api/auth/logout") {
      setNoCache(res);
      await destroySession(req, res);
      sendJson(res, 200, { authenticated: false, username: null, expiresAt: null });
      return true;
    }

    const loaded = await loadSession(req);
    if (!isAdminValid(loaded?.sess)) {
      return false;
    }

    if (method === "GET" && path === "/api/stats/overview") {
      setNoCache(res);
      const [postStats, categoryStats, subscriberStats, commentStats] = await Promise.all([
        query(`
          SELECT COUNT(*)::int AS total,
                 COUNT(*) FILTER (WHERE status = 'published')::int AS published,
                 COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
                 COALESCE(SUM(views), 0)::int AS views FROM posts`),
        query(`SELECT COUNT(*)::int AS count FROM categories`),
        query(`SELECT COUNT(*)::int AS count FROM newsletter_subscribers`),
        query(`SELECT COUNT(*)::int AS count FROM comments`),
      ]);
      const ps = postStats.rows[0] ?? {};
      sendJson(res, 200, {
        totalPosts: ps.total ?? 0,
        publishedPosts: ps.published ?? 0,
        draftPosts: ps.draft ?? 0,
        totalViews: ps.views ?? 0,
        totalCategories: categoryStats.rows[0]?.count ?? 0,
        totalSubscribers: subscriberStats.rows[0]?.count ?? 0,
        totalComments: commentStats.rows[0]?.count ?? 0,
      });
      return true;
    }

    if (method === "GET" && path === "/api/stats/posts") {
      setNoCache(res);
      const q = parseQuery(req.url);
      const limitNum = Math.min(50, parseInt(q.limit || "20", 10) || 20);
      const { rows } = await query(
        `SELECT p.id, p.title, p.slug, p.views, p.status, c.name AS "categoryName", p.created_at AS "createdAt"
         FROM posts p LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.views DESC LIMIT $1`,
        [limitNum],
      );
      sendJson(
        res,
        200,
        rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() })),
      );
      return true;
    }

    if (method === "GET" && path === "/api/posts") {
      const q = parseQuery(req.url);
      if (q.status !== "all") return false;
      setNoCache(res);
      const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
      const limitNum = Math.min(50, parseInt(q.limit || "10", 10) || 10);
      const offset = (pageNum - 1) * limitNum;
      const [rows, countRows] = await Promise.all([
        query(
          `SELECT ${POST_LIST_SELECT} FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id
           ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
          [limitNum, offset],
        ),
        query(`SELECT COUNT(*)::int AS count FROM posts`),
      ]);
      sendJson(res, 200, {
        posts: rows.rows.map((r) => formatPost(r)),
        total: countRows.rows[0]?.count ?? 0,
        page: pageNum,
        limit: limitNum,
      });
      return true;
    }

    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[admin-routes]", method, path, message);
    sendJson(res, 503, { error: "Admin service temporarily unavailable", detail: message });
    return true;
  }
}
