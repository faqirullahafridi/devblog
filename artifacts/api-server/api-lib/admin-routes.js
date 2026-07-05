import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { query } from "./db-pool.js";
import { hashPassword } from "./route-utils.js";
import { sendResendEmail, wrapNewsletterHtml } from "./email.js";
import { normalizeImageUrl, uploadBlogImage, resolveImageUrl, resolveMarkdownImageUrls } from "./image-upload.js";
import { invalidateRouteCache } from "./route-cache.js";

const PROFILE_JSON_FIELDS = new Set([
  "workExperience",
  "education",
  "projects",
  "technicalSkills",
  "languages",
]);

function bustPublicPostCache() {
  invalidateRouteCache("posts:");
  invalidateRouteCache("post:");
  invalidateRouteCache("categories:");
  invalidateRouteCache("feeds:");
}

async function safeQuery(text, params, fallbackRows = []) {
  try {
    return await query(text, params);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("does not exist") || message.includes("relation")) {
      return { rows: fallbackRows };
    }
    throw err;
  }
}

function serializeDbValue(key, value) {
  if (value === undefined) return value;
  if (key === "tags" || PROFILE_JSON_FIELDS.has(key)) {
    return JSON.stringify(value ?? (key === "tags" ? [] : value));
  }
  return value;
}

function pgErrorCode(err) {
  return err && typeof err === "object" && "code" in err ? err.code : null;
}

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

const POST_DETAIL_SELECT = `${POST_LIST_SELECT}, p.content`;

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calcReadingTime(content) {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatPostDetail(row) {
  return {
    ...formatPost(row),
    content: row.content ?? "",
  };
}

function formatJobAdmin(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    description: row.description,
    requirements: row.requirements ?? "",
    location: row.location ?? "Remote",
    remote: row.remote ?? true,
    salaryRange: row.salary_range ?? null,
    category: row.category,
    applyUrl: row.apply_url,
    isActive: row.is_active ?? true,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function sessionSecret() {
  return process.env.SESSION_SECRET?.trim() || "dev-blog-secret-key";
}

function otpSecret() {
  return process.env.SESSION_SECRET?.trim() || "dev-blog-otp-secret";
}

export function signCookie(val) {
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

export async function loadSession(req) {
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

export function isAdminValid(sess) {
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

async function issueOtp(username, purpose = "login") {
  const code = String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await query(`DELETE FROM admin_otp_codes WHERE purpose = $1 AND username = $2`, [purpose, username]);
  await query(
    `INSERT INTO admin_otp_codes (purpose, username, code_hash, attempts, expires_at)
     VALUES ($1, $2, $3, 0, $4)`,
    [purpose, username, hashOtp(code), expiresAt],
  );
  return code;
}

async function verifyOtp(purpose, username, code) {
  const normalized = code.replace(/\D/g, "").trim();
  if (normalized.length !== OTP_LENGTH) return { ok: false, error: "Invalid verification code" };
  const { rows } = await query(
    `SELECT id, code_hash AS "codeHash", attempts FROM admin_otp_codes
     WHERE purpose = $1 AND username = $2 AND expires_at > NOW() LIMIT 1`,
    [purpose, username],
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

export function isAdminRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/auth/me") return true;
  if (path === "/api/auth/login") return true;
  if (path === "/api/auth/verify-otp") return true;
  if (path === "/api/auth/logout") return true;
  if (path === "/api/stats/overview") return true;
  if (path === "/api/stats/posts") return true;
  if (path === "/api/posts") return true;
  if (path === "/api/profile/manage") return true;
  if (path === "/api/profile") return true;
  if (path === "/api/categories") return true;
  if (path === "/api/comments") return true;
  if (path === "/api/newsletter/subscribers") return true;
  if (path === "/api/uploads/image" && m === "POST") return true;
  if (path === "/api/media/resolve-image" && m === "POST") return true;
  if (path === "/api/playgrounds/stats") return true;
  if (path === "/api/roadmaps/stats") return true;
  if (path === "/api/challenges/stats") return true;
  if (path === "/api/jobs/admin") return true;
  if (path === "/api/jobs/sync/status") return true;
  if (path === "/api/jobs/sync" && m === "POST") return true;
  if (path === "/api/challenges/admin") return true;
  if (path === "/api/auth/change-password") return true;
  if (path === "/api/auth/change-username") return true;
  if (path === "/api/auth/forgot-password") return true;
  if (path === "/api/auth/reset-password") return true;
  if (path === "/api/newsletter/send") return true;
  if (path === "/api/community/moderation/reports") return true;
  if (/^\/api\/community\/moderation\/reports\/\d+$/.test(path)) return true;
  if (/^\/api\/jobs\/\d+$/.test(path)) return true;
  if (/^\/api\/challenges\/\d+$/.test(path)) return true;
  if (path === "/api/posts" && m === "POST") return true;
  if (/^\/api\/posts\/\d+$/.test(path)) return true;
  if (/^\/api\/posts\/\d+\/(feature|publish)$/.test(path) && m === "PATCH") return true;
  if (/^\/api\/categories\/\d+$/.test(path)) return true;
  if (/^\/api\/comments\/\d+(\/reply)?$/.test(path)) return true;
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
      const verified = await verifyOtp("login", username, String(otp));
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

    if (method === "POST" && path === "/api/auth/forgot-password") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const username = body.username?.trim();
      if (!username) {
        sendJson(res, 400, { error: "Username is required" });
        return true;
      }
      const envUser = process.env.ADMIN_USERNAME?.trim() || "admin";
      if (username !== envUser) {
        sendJson(res, 200, { success: true, message: "If that account exists, a reset code was sent.", otpRequired: true });
        return true;
      }
      const code = await issueOtp(username, "password_reset");
      await sendLoginOtpEmail(username, code);
      sendJson(res, 200, { success: true, message: "If that account exists, a reset code was sent.", otpRequired: true });
      return true;
    }

    if (method === "POST" && path === "/api/auth/reset-password") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const { username, otp, newPassword } = body;
      if (!username || !otp || !newPassword) {
        sendJson(res, 400, { error: "Username, code, and new password are required" });
        return true;
      }
      if (String(newPassword).length < 6) {
        sendJson(res, 400, { error: "New password must be at least 6 characters" });
        return true;
      }
      const verified = await verifyOtp("password_reset", String(username).trim(), String(otp));
      if (!verified.ok) {
        sendJson(res, 400, { error: verified.error });
        return true;
      }
      const envUser = process.env.ADMIN_USERNAME?.trim() || "admin";
      const hash = hashPassword(String(newPassword));
      const { rows } = await query(`SELECT id FROM admin_credentials LIMIT 1`);
      if (rows[0]) {
        await query(`UPDATE admin_credentials SET password_hash = $1 WHERE id = $2`, [hash, rows[0].id]);
      }
      sendJson(res, 200, { success: true, note: rows[0] ? undefined : `Set ADMIN_PASSWORD on Vercel to apply for env fallback user (${envUser})` });
      return true;
    }

    const loaded = await loadSession(req);
    if (!isAdminValid(loaded?.sess)) {
      setNoCache(res);
      sendJson(res, 401, { error: "Unauthorized", authenticated: false });
      return true;
    }

    if (method === "POST" && path === "/api/uploads/image") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const result = await uploadBlogImage(body);
      if (!result.ok) {
        sendJson(res, result.status, { error: result.error });
        return true;
      }
      sendJson(res, 200, { url: result.url });
      return true;
    }

    if (method === "POST" && path === "/api/media/resolve-image") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const raw = body.url?.trim();
      if (!raw) {
        sendJson(res, 400, { error: "url is required" });
        return true;
      }
      const resolved = await resolveImageUrl(raw);
      sendJson(res, 200, { url: resolved });
      return true;
    }

    if (method === "GET" && path === "/api/stats/overview") {
      setNoCache(res);
      const [postStats, categoryStats, subscriberStats, commentStats] = await Promise.all([
        safeQuery(`
          SELECT COUNT(*)::int AS total,
                 COUNT(*) FILTER (WHERE status = 'published')::int AS published,
                 COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
                 COALESCE(SUM(views), 0)::int AS views FROM posts`),
        safeQuery(`SELECT COUNT(*)::int AS count FROM categories`, [], [{ count: 0 }]),
        safeQuery(`SELECT COUNT(*)::int AS count FROM newsletter_subscribers`, [], [{ count: 0 }]),
        safeQuery(`SELECT COUNT(*)::int AS count FROM comments`, [], [{ count: 0 }]),
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

    const postFeatureMatch = path.match(/^\/api\/posts\/(\d+)\/feature$/);
    if (postFeatureMatch && method === "PATCH") {
      setNoCache(res);
      const postId = parseInt(postFeatureMatch[1], 10);
      const body = await readJsonBody(req);
      const { rows } = await query(
        `UPDATE posts SET is_featured = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [Boolean(body.isFeatured), postId],
      );
      if (!rows[0]) {
        sendJson(res, 404, { error: "Post not found" });
        return true;
      }
      bustPublicPostCache();
      const { rows: detail } = await query(
        `SELECT ${POST_DETAIL_SELECT} FROM posts p
         LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1 LIMIT 1`,
        [postId],
      );
      sendJson(res, 200, formatPostDetail(detail[0]));
      return true;
    }

    const postPublishMatch = path.match(/^\/api\/posts\/(\d+)\/publish$/);
    if (postPublishMatch && method === "PATCH") {
      setNoCache(res);
      const postId = parseInt(postPublishMatch[1], 10);
      const body = await readJsonBody(req);
      const status = body.status === "published" ? "published" : "draft";
      const { rows } = await query(
        `UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [status, postId],
      );
      if (!rows[0]) {
        sendJson(res, 404, { error: "Post not found" });
        return true;
      }
      bustPublicPostCache();
      const { rows: detail } = await query(
        `SELECT ${POST_DETAIL_SELECT} FROM posts p
         LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1 LIMIT 1`,
        [postId],
      );
      sendJson(res, 200, formatPostDetail(detail[0]));
      return true;
    }

    const postIdMatch = path.match(/^\/api\/posts\/(\d+)$/);
    if (postIdMatch) {
      const postId = parseInt(postIdMatch[1], 10);
      if (method === "GET") {
        setNoCache(res);
        const { rows } = await query(
          `SELECT ${POST_DETAIL_SELECT} FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1 LIMIT 1`,
          [postId],
        );
        if (!rows[0]) {
          sendJson(res, 404, { error: "Post not found" });
          return true;
        }
        sendJson(res, 200, formatPostDetail(rows[0]));
        return true;
      }
      if (method === "PATCH") {
        setNoCache(res);
        const body = await readJsonBody(req);
        if (body.content !== undefined) {
          body.content = await resolveMarkdownImageUrls(body.content);
        }
        const updates = [];
        const params = [];
        let idx = 1;
        let featuredImageValue;
        if (body.featuredImage !== undefined) {
          featuredImageValue = body.featuredImage ? await resolveImageUrl(body.featuredImage) : null;
        }
        const fields = {
          title: body.title,
          slug: body.slug,
          content: body.content,
          excerpt: body.excerpt,
          featuredImage: featuredImageValue,
          status: body.status,
          seoTitle: body.seoTitle,
          metaDescription: body.metaDescription,
          tags: body.tags,
        };
        for (const [key, val] of Object.entries(fields)) {
          if (val === undefined) continue;
          const col =
            key === "featuredImage"
              ? "featured_image"
              : key === "categoryId"
                ? "category_id"
                : key === "seoTitle"
                  ? "seo_title"
                  : key === "metaDescription"
                    ? "meta_description"
                    : key.replace(/([A-Z])/g, "_$1").toLowerCase();
          if (key === "tags") {
            updates.push(`${col} = $${idx++}::jsonb`);
            params.push(serializeDbValue("tags", Array.isArray(val) ? val : []));
          } else {
            updates.push(`${col} = $${idx++}`);
            params.push(val);
          }
        }
        if (body.categoryId !== undefined) {
          updates.push(`category_id = $${idx++}`);
          params.push(body.categoryId ? Number(body.categoryId) : null);
        }
        if (body.publishAt !== undefined) {
          updates.push(`publish_at = $${idx++}`);
          params.push(body.publishAt ? new Date(body.publishAt) : null);
        }
        if (body.content !== undefined) {
          updates.push(`reading_time = $${idx++}`);
          params.push(calcReadingTime(body.content));
        }
        if (!updates.length) {
          sendJson(res, 400, { error: "No fields to update" });
          return true;
        }
        updates.push("updated_at = NOW()");
        params.push(postId);
        await query(`UPDATE posts SET ${updates.join(", ")} WHERE id = $${idx}`, params);
        const { rows } = await query(
          `SELECT ${POST_DETAIL_SELECT} FROM posts p
           LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1 LIMIT 1`,
          [postId],
        );
        if (!rows[0]) {
          sendJson(res, 404, { error: "Post not found" });
          return true;
        }
        bustPublicPostCache();
        sendJson(res, 200, formatPostDetail(rows[0]));
        return true;
      }
      if (method === "DELETE") {
        setNoCache(res);
        await query(`DELETE FROM posts WHERE id = $1`, [postId]);
        bustPublicPostCache();
        res.statusCode = 204;
        res.end();
        return true;
      }
    }

    if (method === "POST" && path === "/api/posts") {
      setNoCache(res);
      const body = await readJsonBody(req);
      if (!body.title) {
        sendJson(res, 400, { error: "Title is required" });
        return true;
      }
      if (body.content === undefined) {
        sendJson(res, 400, { error: "Content is required" });
        return true;
      }
      const finalSlug = body.slug?.trim() || slugify(body.title);
      const content = await resolveMarkdownImageUrls(body.content ?? "");
      const readingTime = calcReadingTime(content);
      const featuredImage = body.featuredImage ? await resolveImageUrl(body.featuredImage) : null;
      let insertResult;
      try {
        insertResult = await query(
          `INSERT INTO posts (title, slug, content, excerpt, featured_image, status, category_id, seo_title, meta_description, tags, publish_at, reading_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12) RETURNING id`,
          [
            body.title,
            finalSlug,
            content,
            body.excerpt ?? null,
            featuredImage,
            body.status ?? "draft",
            body.categoryId ? Number(body.categoryId) : null,
            body.seoTitle ?? null,
            body.metaDescription ?? null,
            serializeDbValue("tags", Array.isArray(body.tags) ? body.tags : []),
            body.publishAt ? new Date(body.publishAt) : null,
            readingTime,
          ],
        );
      } catch (err) {
        if (pgErrorCode(err) === "23505") {
          sendJson(res, 409, { error: "A post with this slug already exists. Choose a different slug." });
          return true;
        }
        throw err;
      }
      const { rows } = insertResult;
      const { rows: detail } = await query(
        `SELECT ${POST_DETAIL_SELECT} FROM posts p
         LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1 LIMIT 1`,
        [rows[0].id],
      );
      bustPublicPostCache();
      sendJson(res, 201, formatPostDetail(detail[0]));
      return true;
    }

    if (method === "GET" && path === "/api/profile/manage") {
      setNoCache(res);
      const { rows } = await query(
        `SELECT id, name, headline, phone, email, location, portfolio_url AS "portfolioUrl",
                about_me AS "aboutMe", work_experience AS "workExperience", education, projects,
                technical_skills AS "technicalSkills", languages, status, updated_at AS "updatedAt"
         FROM developer_profile LIMIT 1`,
      );
      if (!rows[0]) {
        sendJson(res, 404, { error: "Profile not found" });
        return true;
      }
      const p = rows[0];
      sendJson(res, 200, {
        ...p,
        workExperience: p.workExperience ?? [],
        education: p.education ?? [],
        projects: p.projects ?? [],
        technicalSkills: p.technicalSkills ?? [],
        languages: p.languages ?? [],
        updatedAt: new Date(p.updatedAt).toISOString(),
      });
      return true;
    }

    if (method === "PATCH" && path === "/api/profile") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const { rows: existing } = await query(`SELECT id FROM developer_profile LIMIT 1`);
      if (!existing[0]) {
        sendJson(res, 404, { error: "Profile not found" });
        return true;
      }
      const updates = [];
      const params = [];
      let idx = 1;
      const map = {
        name: "name",
        headline: "headline",
        phone: "phone",
        email: "email",
        location: "location",
        portfolioUrl: "portfolio_url",
        aboutMe: "about_me",
        workExperience: "work_experience",
        education: "education",
        projects: "projects",
        technicalSkills: "technical_skills",
        languages: "languages",
        status: "status",
      };
      for (const [key, col] of Object.entries(map)) {
        if (body[key] === undefined) continue;
        if (PROFILE_JSON_FIELDS.has(key)) {
          updates.push(`${col} = $${idx++}::jsonb`);
          params.push(serializeDbValue(key, body[key]));
        } else {
          updates.push(`${col} = $${idx++}`);
          params.push(body[key]);
        }
      }
      if (!updates.length) {
        sendJson(res, 400, { error: "No fields to update" });
        return true;
      }
      updates.push("updated_at = NOW()");
      params.push(existing[0].id);
      await query(`UPDATE developer_profile SET ${updates.join(", ")} WHERE id = $${idx}`, params);
      const { rows } = await query(
        `SELECT id, name, headline, phone, email, location, portfolio_url AS "portfolioUrl",
                about_me AS "aboutMe", work_experience AS "workExperience", education, projects,
                technical_skills AS "technicalSkills", languages, status, updated_at AS "updatedAt"
         FROM developer_profile WHERE id = $1 LIMIT 1`,
        [existing[0].id],
      );
      const p = rows[0];
      sendJson(res, 200, {
        ...p,
        workExperience: p.workExperience ?? [],
        education: p.education ?? [],
        projects: p.projects ?? [],
        technicalSkills: p.technicalSkills ?? [],
        languages: p.languages ?? [],
        updatedAt: new Date(p.updatedAt).toISOString(),
      });
      return true;
    }

    if (method === "POST" && path === "/api/categories") {
      setNoCache(res);
      const body = await readJsonBody(req);
      if (!body.name?.trim()) {
        sendJson(res, 400, { error: "Name is required" });
        return true;
      }
      const finalSlug = body.slug?.trim() || slugify(body.name);
      const { rows } = await query(
        `INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)
         RETURNING id, name, slug, description, created_at AS "createdAt"`,
        [body.name.trim(), finalSlug, body.description ?? null],
      );
      sendJson(res, 201, { ...rows[0], postCount: 0, createdAt: new Date(rows[0].createdAt).toISOString() });
      return true;
    }

    const catIdMatch = path.match(/^\/api\/categories\/(\d+)$/);
    if (catIdMatch && (method === "PATCH" || method === "DELETE")) {
      setNoCache(res);
      const catId = parseInt(catIdMatch[1], 10);
      if (method === "DELETE") {
        await query(`DELETE FROM categories WHERE id = $1`, [catId]);
        res.statusCode = 204;
        res.end();
        return true;
      }
      const body = await readJsonBody(req);
      const updates = [];
      const params = [];
      let idx = 1;
      if (body.name !== undefined) {
        updates.push(`name = $${idx++}`);
        params.push(body.name);
      }
      if (body.slug !== undefined) {
        updates.push(`slug = $${idx++}`);
        params.push(body.slug);
      } else if (body.name) {
        updates.push(`slug = $${idx++}`);
        params.push(slugify(body.name));
      }
      if (body.description !== undefined) {
        updates.push(`description = $${idx++}`);
        params.push(body.description);
      }
      if (!updates.length) {
        sendJson(res, 400, { error: "No fields to update" });
        return true;
      }
      params.push(catId);
      const { rows } = await query(
        `UPDATE categories SET ${updates.join(", ")} WHERE id = $${idx}
         RETURNING id, name, slug, description, created_at AS "createdAt"`,
        params,
      );
      if (!rows[0]) {
        sendJson(res, 404, { error: "Category not found" });
        return true;
      }
      const { rows: countRows } = await query(
        `SELECT COUNT(*)::int AS count FROM posts WHERE category_id = $1`,
        [catId],
      );
      sendJson(res, 200, {
        ...rows[0],
        postCount: countRows[0]?.count ?? 0,
        createdAt: new Date(rows[0].createdAt).toISOString(),
      });
      return true;
    }

    if (method === "GET" && path === "/api/comments") {
      setNoCache(res);
      const { rows } = await query(
        `SELECT c.id, c.post_id AS "postId", c.author_name AS "authorName", c.author_email AS "authorEmail",
                c.content, c.admin_reply AS "adminReply", c.admin_replied_at AS "adminRepliedAt",
                c.created_at AS "createdAt", p.title AS "postTitle", p.slug AS "postSlug"
         FROM comments c LEFT JOIN posts p ON p.id = c.post_id
         ORDER BY c.created_at DESC`,
      );
      sendJson(
        res,
        200,
        rows.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt).toISOString(),
          adminRepliedAt: r.adminRepliedAt ? new Date(r.adminRepliedAt).toISOString() : null,
        })),
      );
      return true;
    }

    const commentReplyMatch = path.match(/^\/api\/comments\/(\d+)\/reply$/);
    if (method === "PATCH" && commentReplyMatch) {
      setNoCache(res);
      const id = parseInt(commentReplyMatch[1], 10);
      const body = await readJsonBody(req);
      if (!body.reply?.trim()) {
        sendJson(res, 400, { error: "Reply text is required" });
        return true;
      }
      const { rows } = await query(
        `UPDATE comments SET admin_reply = $1, admin_replied_at = NOW() WHERE id = $2
         RETURNING id, post_id AS "postId", author_name AS "authorName", author_email AS "authorEmail",
                   content, admin_reply AS "adminReply", admin_replied_at AS "adminRepliedAt", created_at AS "createdAt"`,
        [body.reply.trim(), id],
      );
      if (!rows[0]) {
        sendJson(res, 404, { error: "Comment not found" });
        return true;
      }
      const r = rows[0];
      sendJson(res, 200, {
        ...r,
        createdAt: new Date(r.createdAt).toISOString(),
        adminRepliedAt: r.adminRepliedAt ? new Date(r.adminRepliedAt).toISOString() : null,
      });
      return true;
    }

    const commentIdMatch = path.match(/^\/api\/comments\/(\d+)$/);
    if (method === "DELETE" && commentIdMatch) {
      setNoCache(res);
      await query(`DELETE FROM comments WHERE id = $1`, [parseInt(commentIdMatch[1], 10)]);
      res.statusCode = 204;
      res.end();
      return true;
    }

    if (method === "GET" && path === "/api/newsletter/subscribers") {
      setNoCache(res);
      const { rows } = await query(
        `SELECT id, email, name, status, created_at AS "createdAt"
         FROM newsletter_subscribers ORDER BY created_at DESC`,
      );
      sendJson(
        res,
        200,
        rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() })),
      );
      return true;
    }

    if (method === "GET" && path === "/api/playgrounds/stats") {
      setNoCache(res);
      const [totals, popular] = await Promise.all([
        safeQuery(
          `SELECT COUNT(*)::int AS playgrounds, COALESCE(SUM(views), 0)::int AS views FROM playgrounds`,
          [],
          [{ playgrounds: 0, views: 0 }],
        ),
        safeQuery(
          `SELECT slug, title, views FROM playgrounds ORDER BY views DESC NULLS LAST LIMIT 5`,
          [],
        ),
      ]);
      const count = totals.rows[0]?.playgrounds ?? 0;
      sendJson(res, 200, {
        totals: { total: count, playgrounds: count, views: totals.rows[0]?.views ?? 0 },
        popular: popular.rows,
      });
      return true;
    }

    if (method === "GET" && path === "/api/roadmaps/stats") {
      setNoCache(res);
      const [totalRoadmaps, completedSteps, topGoals] = await Promise.all([
        safeQuery(`SELECT COUNT(*)::int AS count FROM roadmaps`, [], [{ count: 0 }]),
        safeQuery(
          `SELECT COUNT(*)::int AS count FROM roadmap_progress WHERE completed = true`,
          [],
          [{ count: 0 }],
        ),
        safeQuery(
          `SELECT goal, COUNT(*)::int AS count FROM roadmaps
           GROUP BY goal ORDER BY count DESC LIMIT 5`,
          [],
        ),
      ]);
      sendJson(res, 200, {
        totalRoadmaps: totalRoadmaps.rows[0]?.count ?? 0,
        completedSteps: completedSteps.rows[0]?.count ?? 0,
        topGoals: topGoals.rows,
      });
      return true;
    }

    if (method === "GET" && path === "/api/challenges/stats") {
      setNoCache(res);
      const [challenges, submissions] = await Promise.all([
        query(`SELECT COUNT(*)::int AS count FROM challenges`),
        query(`SELECT COUNT(*)::int AS count FROM challenge_submissions`),
      ]);
      sendJson(res, 200, {
        challenges: challenges.rows[0]?.count ?? 0,
        submissions: submissions.rows[0]?.count ?? 0,
      });
      return true;
    }

    if (method === "GET" && path === "/api/jobs/admin") {
      setNoCache(res);
      const q = parseQuery(req.url);
      const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
      const limitNum = Math.min(100, parseInt(q.limit || "20", 10) || 20);
      const offset = (pageNum - 1) * limitNum;
      const params = [];
      let where = "";
      if (q.search) {
        where = `WHERE title ILIKE $1 OR company ILIKE $1`;
        params.push(`%${q.search}%`);
      }
      const limitParam = params.length + 1;
      const offsetParam = params.length + 2;
      const [listRes, countRes] = await Promise.all([
        query(`SELECT * FROM jobs ${where} ORDER BY created_at DESC LIMIT $${limitParam} OFFSET $${offsetParam}`, [
          ...params,
          limitNum,
          offset,
        ]),
        query(`SELECT COUNT(*)::int AS count FROM jobs ${where}`, params),
      ]);
      sendJson(res, 200, {
        jobs: listRes.rows.map(formatJobAdmin),
        total: countRes.rows[0]?.count ?? 0,
        page: pageNum,
        limit: limitNum,
      });
      return true;
    }

    if (method === "POST" && path === "/api/jobs") {
      setNoCache(res);
      const body = await readJsonBody(req);
      if (!body.title || !body.company || !body.description || !body.category || !body.applyUrl) {
        sendJson(res, 400, { error: "Missing required fields" });
        return true;
      }
      const slug = `${slugify(`${body.company}-${body.title}`)}-${Date.now().toString(36)}`;
      const { rows } = await query(
        `INSERT INTO jobs (slug, title, company, description, requirements, location, remote, salary_range, category, apply_url, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [
          slug,
          body.title,
          body.company,
          body.description,
          body.requirements ?? "",
          body.location ?? "Remote",
          body.remote ?? true,
          body.salaryRange ?? null,
          body.category,
          body.applyUrl,
          body.expiresAt ? new Date(body.expiresAt) : null,
        ],
      );
      sendJson(res, 201, formatJobAdmin(rows[0]));
      return true;
    }

    const jobIdMatch = path.match(/^\/api\/jobs\/(\d+)$/);
    if (jobIdMatch) {
      const jobId = parseInt(jobIdMatch[1], 10);
      if (method === "PATCH") {
        setNoCache(res);
        const body = await readJsonBody(req);
        const updates = [];
        const params = [];
        let idx = 1;
        for (const [key, col] of [
          ["title", "title"],
          ["company", "company"],
          ["description", "description"],
          ["requirements", "requirements"],
          ["location", "location"],
          ["category", "category"],
          ["applyUrl", "apply_url"],
          ["isActive", "is_active"],
        ]) {
          if (body[key] !== undefined) {
            updates.push(`${col} = $${idx++}`);
            params.push(body[key]);
          }
        }
        if (body.remote !== undefined) {
          updates.push(`remote = $${idx++}`);
          params.push(!!body.remote);
        }
        if (body.salaryRange !== undefined) {
          updates.push(`salary_range = $${idx++}`);
          params.push(body.salaryRange);
        }
        if (body.expiresAt !== undefined) {
          updates.push(`expires_at = $${idx++}`);
          params.push(body.expiresAt ? new Date(body.expiresAt) : null);
        }
        if (!updates.length) {
          sendJson(res, 400, { error: "No fields to update" });
          return true;
        }
        params.push(jobId);
        const { rows } = await query(`UPDATE jobs SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`, params);
        if (!rows[0]) {
          sendJson(res, 404, { error: "Not found" });
          return true;
        }
        sendJson(res, 200, formatJobAdmin(rows[0]));
        return true;
      }
      if (method === "DELETE") {
        setNoCache(res);
        await query(`UPDATE jobs SET is_active = false WHERE id = $1`, [jobId]);
        res.statusCode = 204;
        res.end();
        return true;
      }
    }

    if (method === "GET" && path === "/api/challenges/admin") {
      setNoCache(res);
      const q = parseQuery(req.url);
      const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
      const limitNum = Math.min(100, parseInt(q.limit || "20", 10) || 20);
      const offset = (pageNum - 1) * limitNum;
      const [listRes, countRes] = await Promise.all([
        query(`SELECT * FROM challenges ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limitNum, offset]),
        query(`SELECT COUNT(*)::int AS count FROM challenges`),
      ]);
      sendJson(res, 200, {
        challenges: listRes.rows.map((c) => ({ ...c, createdAt: new Date(c.created_at).toISOString() })),
        total: countRes.rows[0]?.count ?? 0,
        page: pageNum,
        limit: limitNum,
      });
      return true;
    }

    if (method === "POST" && path === "/api/challenges") {
      setNoCache(res);
      const body = await readJsonBody(req);
      if (!body.title || !body.description || !body.difficulty || !body.category) {
        sendJson(res, 400, { error: "title, description, difficulty, category required" });
        return true;
      }
      const slug = slugify(body.title);
      const { rows } = await query(
        `INSERT INTO challenges (slug, title, description, difficulty, category, starter_code, solution_code, test_cases, points, is_daily, daily_date)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [
          slug,
          body.title,
          body.description,
          body.difficulty,
          body.category,
          body.starterCode ?? "",
          body.solutionCode ?? null,
          JSON.stringify(body.testCases ?? []),
          body.points ?? 10,
          body.isDaily ?? false,
          body.isDaily ? new Date().toISOString().slice(0, 10) : null,
        ],
      );
      sendJson(res, 201, { ...rows.rows[0], createdAt: new Date(rows.rows[0].created_at).toISOString() });
      return true;
    }

    const challengeIdMatch = path.match(/^\/api\/challenges\/(\d+)$/);
    if (method === "PATCH" && challengeIdMatch) {
      setNoCache(res);
      const id = parseInt(challengeIdMatch[1], 10);
      const body = await readJsonBody(req);
      const updates = [];
      const params = [];
      let idx = 1;
      for (const [key, col] of [
        ["title", "title"],
        ["description", "description"],
        ["difficulty", "difficulty"],
        ["category", "category"],
        ["starterCode", "starter_code"],
        ["solutionCode", "solution_code"],
        ["points", "points"],
      ]) {
        if (body[key] !== undefined) {
          updates.push(`${col} = $${idx++}`);
          params.push(body[key]);
        }
      }
      if (body.testCases !== undefined) {
        updates.push(`test_cases = $${idx++}`);
        params.push(JSON.stringify(body.testCases));
      }
      if (!updates.length) {
        sendJson(res, 400, { error: "No fields to update" });
        return true;
      }
      params.push(id);
      const { rows } = await query(`UPDATE challenges SET ${updates.join(", ")} WHERE id = $${idx} RETURNING *`, params);
      if (!rows[0]) {
        sendJson(res, 404, { error: "Not found" });
        return true;
      }
      sendJson(res, 200, { ...rows[0], createdAt: new Date(rows[0].created_at).toISOString() });
      return true;
    }

    if (method === "GET" && path === "/api/community/moderation/reports") {
      setNoCache(res);
      const q = parseQuery(req.url);
      const status = q.status?.trim() || "pending";
      const { rows } = await safeQuery(
        `SELECT id, target_type AS "targetType", target_id AS "targetId", reason, status,
                visitor_id AS "visitorId", created_at AS "createdAt"
         FROM community_reports
         WHERE status = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [status],
      );
      sendJson(
        res,
        200,
        rows.map((r) => ({
          ...r,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
        })),
      );
      return true;
    }

    const reportIdMatch = path.match(/^\/api\/community\/moderation\/reports\/(\d+)$/);
    if (reportIdMatch && method === "PATCH") {
      setNoCache(res);
      const body = await readJsonBody(req);
      const id = parseInt(reportIdMatch[1], 10);
      const status = body.status?.trim() || "resolved";
      await safeQuery(`UPDATE community_reports SET status = $1 WHERE id = $2`, [status, id]);
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (method === "POST" && path === "/api/newsletter/send") {
      setNoCache(res);
      const body = await readJsonBody(req);
      if (!body.subject?.trim() || !body.html?.trim()) {
        sendJson(res, 400, { error: "subject and html are required" });
        return true;
      }
      const apiKey = process.env.RESEND_API_KEY?.trim();
      if (!apiKey) {
        sendJson(res, 503, { error: "RESEND_API_KEY not configured" });
        return true;
      }
      const { rows } = await query(`SELECT email FROM newsletter_subscribers WHERE status = 'confirmed'`);
      const wrappedHtml = wrapNewsletterHtml(body.subject.trim(), body.html, body.postSlug);
      let sent = 0;
      const failures = [];
      for (const row of rows) {
        const result = await sendResendEmail({
          to: row.email,
          subject: body.subject.trim(),
          html: wrappedHtml,
        });
        if (result.ok) sent++;
        else failures.push({ email: row.email, error: result.error });
      }
      sendJson(res, 200, {
        success: true,
        sent,
        total: rows.length,
        failures: failures.length ? failures.slice(0, 5) : undefined,
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
