import { randomBytes } from "node:crypto";
import { query } from "./db-pool.js";
import {
  getVisitorId,
  readJsonBody,
  sendJson,
  setNoCache,
  hashPassword,
  verifyPassword,
  routeError,
} from "./route-utils.js";
import { loadSession, signCookie } from "./admin-routes.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

async function updateSessionSiteUser(sid, user) {
  const { rows } = await query(`SELECT sess FROM session WHERE sid = $1 LIMIT 1`, [sid]);
  if (!rows[0]?.sess) return false;
  const sess = typeof rows[0].sess === "string" ? JSON.parse(rows[0].sess) : rows[0].sess;
  sess.siteUserId = user.id;
  sess.siteUsername = user.username;
  sess.siteDisplayName = user.displayName;
  sess.siteUserEmail = user.email;
  await query(`UPDATE session SET sess = $1 WHERE sid = $2`, [JSON.stringify(sess), sid]);
  return true;
}

async function createSiteSession(res, user) {
  const sid = randomBytes(24).toString("hex");
  const maxAge = 6 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + maxAge);
  const sess = {
    cookie: { originalMaxAge: maxAge, expires: expires.toISOString(), secure: true, httpOnly: true, path: "/", sameSite: "lax" },
    siteUserId: user.id,
    siteUsername: user.username,
    siteDisplayName: user.displayName,
    siteUserEmail: user.email,
  };
  await query(`INSERT INTO session (sid, sess, expire) VALUES ($1, $2, $3)`, [sid, JSON.stringify(sess), expires]);
  const signed = encodeURIComponent(`s:${signCookie(sid)}`);
  res.setHeader("Set-Cookie", `connect.sid=${signed}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(maxAge / 1000)}`);
}

async function linkCommunityProfile(visitorId, username) {
  const { rows } = await query(`SELECT id FROM community_users WHERE visitor_id = $1 LIMIT 1`, [visitorId]);
  if (rows[0]) {
    await query(`UPDATE community_users SET username = $1 WHERE id = $2`, [username, rows[0].id]);
    return;
  }
  await query(`INSERT INTO community_users (visitor_id, username) VALUES ($1, $2)`, [visitorId, username]);
}

async function handleSignup(req, res) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const { email, username, password, displayName } = body;
  if (!email?.trim() || !username?.trim() || !password) {
    sendJson(res, 400, { error: "Email, username, and password are required" });
    return;
  }
  if (!EMAIL_RE.test(email.trim())) {
    sendJson(res, 400, { error: "Enter a valid email address" });
    return;
  }
  const uname = normalizeUsername(username);
  if (!USERNAME_RE.test(uname)) {
    sendJson(res, 400, { error: "Username must be 3–32 characters (letters, numbers, underscore)" });
    return;
  }
  if (password.length < 8) {
    sendJson(res, 400, { error: "Password must be at least 8 characters" });
    return;
  }
  const emailNorm = normalizeEmail(email);
  const name = displayName?.trim() || username.trim();
  const { rows: existing } = await query(
    `SELECT id FROM site_users WHERE email = $1 OR username = $2 LIMIT 1`,
    [emailNorm, uname],
  );
  if (existing[0]) {
    sendJson(res, 409, { error: "Email or username is already taken" });
    return;
  }
  const { rows } = await query(
    `INSERT INTO site_users (email, username, display_name, password_hash)
     VALUES ($1, $2, $3, $4) RETURNING id, username, display_name AS "displayName", email`,
    [emailNorm, uname, name, hashPassword(password)],
  );
  const user = rows[0];
  const visitorId = getVisitorId(req, res);
  await linkCommunityProfile(visitorId, user.username);
  await createSiteSession(res, user);
  sendJson(res, 201, {
    authenticated: true,
    user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email },
  });
}

async function handleUserLogin(req, res) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const { login, password } = body;
  if (!login?.trim() || !password) {
    sendJson(res, 400, { error: "Email/username and password are required" });
    return;
  }
  const isEmail = login.includes("@");
  const key = isEmail ? normalizeEmail(login) : normalizeUsername(login);
  const { rows } = await query(
    isEmail
      ? `SELECT id, username, display_name AS "displayName", email, password_hash AS "passwordHash" FROM site_users WHERE email = $1 LIMIT 1`
      : `SELECT id, username, display_name AS "displayName", email, password_hash AS "passwordHash" FROM site_users WHERE username = $1 LIMIT 1`,
    [key],
  );
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash)) {
    sendJson(res, 401, { error: "Invalid email/username or password" });
    return;
  }
  const visitorId = getVisitorId(req, res);
  await linkCommunityProfile(visitorId, user.username);
  await createSiteSession(res, user);
  sendJson(res, 200, {
    authenticated: true,
    user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email },
  });
}

async function handleUserLogout(req, res) {
  setNoCache(res);
  const loaded = await loadSession(req);
  if (loaded?.sid && loaded?.sess) {
    const sess = loaded.sess;
    delete sess.siteUserId;
    delete sess.siteUsername;
    delete sess.siteDisplayName;
    delete sess.siteUserEmail;
    await query(`UPDATE session SET sess = $1 WHERE sid = $2`, [JSON.stringify(sess), loaded.sid]);
  }
  sendJson(res, 200, { authenticated: false, user: null });
}

async function handleGithubMe(req, res) {
  setNoCache(res);
  const loaded = await loadSession(req);
  const sess = loaded?.sess;
  if (!sess?.githubLogin) {
    sendJson(res, 200, { authenticated: false, user: null });
    return;
  }
  sendJson(res, 200, {
    authenticated: true,
    user: {
      id: sess.githubId,
      login: sess.githubLogin,
      name: sess.githubName,
      avatar: sess.githubAvatar,
    },
  });
}

async function handleGithubLogout(req, res) {
  setNoCache(res);
  const loaded = await loadSession(req);
  if (loaded?.sid && loaded?.sess) {
    const sess = loaded.sess;
    delete sess.githubId;
    delete sess.githubLogin;
    delete sess.githubName;
    delete sess.githubAvatar;
    await query(`UPDATE session SET sess = $1 WHERE sid = $2`, [JSON.stringify(sess), loaded.sid]);
  }
  sendJson(res, 200, { authenticated: false, user: null });
}

export function isSiteAuthRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/auth/signup" && m === "POST") return true;
  if (path === "/api/auth/user/login" && m === "POST") return true;
  if (path === "/api/auth/user/logout" && m === "POST") return true;
  if (path === "/api/auth/github/me" && m === "GET") return true;
  if (path === "/api/auth/github/logout" && m === "POST") return true;
  return false;
}

export async function trySiteAuthRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();
  try {
    if (method === "POST" && path === "/api/auth/signup") {
      await handleSignup(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/auth/user/login") {
      await handleUserLogin(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/auth/user/logout") {
      await handleUserLogout(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/auth/github/me") {
      await handleGithubMe(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/auth/github/logout") {
      await handleGithubLogout(req, res);
      return true;
    }
    return false;
  } catch (err) {
    routeError(res, err, "[site-auth-routes]");
    return true;
  }
}
