import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { query } from "./db-pool.js";

export const VISITOR_COOKIE = "visitor_id";
export const VISITOR_MAX_AGE_SEC = 365 * 24 * 60 * 60;

export function parseCookies(req) {
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

export function parseQuery(rawUrl) {
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

export async function readJsonBody(req) {
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

export function setCache(res, maxAge = 120) {
  const edgeMax = Number(process.env.CDN_CACHE_SECONDS);
  const sMaxAge = Number.isFinite(edgeMax) && edgeMax > 0 ? edgeMax : Math.max(maxAge * 3, 300);
  const swr = Number(process.env.CDN_STALE_SECONDS) || 3600;
  res.setHeader(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  );
  res.setHeader("CDN-Cache-Control", `max-age=${sMaxAge}, stale-while-revalidate=${swr}`);
  res.setHeader("Vary", "Accept-Encoding");
}

export function setNoCache(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export function sendText(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.end(body);
}

export function getVisitorId(req, res) {
  const existing = parseCookies(req)[VISITOR_COOKIE];
  if (existing && existing.length >= 8) return existing;
  const id = randomBytes(16).toString("hex");
  res.setHeader(
    "Set-Cookie",
    `${VISITOR_COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${VISITOR_MAX_AGE_SEC}`,
  );
  return id;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[/\\]+/g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calcReadingTime(content) {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function toIso(val) {
  if (val == null) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function envConfigured(...keys) {
  return keys.some((k) => Boolean(process.env[k]?.trim()));
}

export function getSiteUrl() {
  return (process.env.SITE_URL?.trim() || "https://www.techventry.com").replace(/\/$/, "");
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
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

export async function loadSessionFromCookie(req) {
  const { loadSession } = await import("./admin-routes.js");
  return loadSession(req);
}

export function routeError(res, err, label) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(label, message);
  sendJson(res, 503, { error: "Service temporarily unavailable", detail: message });
}
