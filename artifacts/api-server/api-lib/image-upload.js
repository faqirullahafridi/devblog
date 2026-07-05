import { randomBytes } from "node:crypto";
import https from "node:https";
import tls from "node:tls";

const UNSPLASH_IMAGE_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);
const httpsAgent = new https.Agent({ ca: tls.rootCertificates });
const USER_AGENT = "devblog-platform/1.0 (image-resolver)";

/** Ensure image URLs work in <img src> (add https:// when missing). */
export function normalizeImageUrl(src) {
  if (!src || typeof src !== "string") return src ?? "";
  let s = src.trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`;
  return s;
}

function unsplashPhotoIdFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  const photosIdx = segments.indexOf("photos");
  if (photosIdx === -1) return null;
  const tail = segments.slice(photosIdx + 1).map((s) => decodeURIComponent(s.replace(/^@/, "")));
  if (!tail.length) return null;

  const last = tail[tail.length - 1];
  if (!last) return null;

  // /photos/AbCdEfGhIj or /photos/T-0jd8lTZsA
  if (tail.length === 1 && /^[A-Za-z0-9_-]{5,20}$/.test(last)) {
    return last;
  }

  // /photos/slug-with-id-at-end — id is the last hyphen segment (usually 11 chars)
  const slugMatch = last.match(/-([A-Za-z0-9][A-Za-z0-9_-]{4,14})$/);
  if (slugMatch) return slugMatch[1];

  return null;
}

function httpGet(url, headers = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      u,
      {
        method: "GET",
        agent: httpsAgent,
        headers: { "User-Agent": USER_AGENT, Accept: "*/*", ...headers },
      },
      (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
          const next = new URL(res.headers.location, url).toString();
          resolve(httpGet(next, headers, maxRedirects - 1));
          return;
        }
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode ?? 500, body, headers: res.headers });
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(12_000, () => req.destroy(new Error("timeout")));
    req.end();
  });
}

async function fetchJson(url, headers = {}) {
  const { status, body } = await httpGet(url, { Accept: "application/json", ...headers });
  if (status >= 400) throw new Error(`HTTP ${status} for ${url}`);
  return JSON.parse(body);
}

function applyUnsplashCdnParams(rawUrl, width = 1200, quality = 80) {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!UNSPLASH_IMAGE_HOSTS.has(host)) return rawUrl;
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("q", String(quality));
    parsed.searchParams.set("fm", "webp");
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

async function resolveUnsplashViaApi(photoId, key) {
  try {
    const data = await fetchJson(`https://api.unsplash.com/photos/${encodeURIComponent(photoId)}`, {
      Authorization: `Client-ID ${key}`,
    });
    const url = data.urls?.regular || data.urls?.small || data.urls?.full || null;
    return url ? applyUnsplashCdnParams(url) : null;
  } catch (err) {
    console.error("[resolveImageUrl] Unsplash API error:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function resolveUnsplashViaPage(pageUrl) {
  try {
    const { status, body } = await httpGet(pageUrl, { Accept: "text/html,application/xhtml+xml" });
    if (status >= 400 || !body) return null;

    const og =
      body.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      body.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (og?.[1]?.includes("images.unsplash.com")) {
      return applyUnsplashCdnParams(og[1].replace(/&amp;/g, "&"));
    }

    const cdn = body.match(/https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9_-]+[^"'\s<>]*/);
    if (cdn?.[0]) return applyUnsplashCdnParams(cdn[0].replace(/&amp;/g, "&"));
  } catch (err) {
    console.warn("[resolveImageUrl] Unsplash page scrape failed:", err instanceof Error ? err.message : err);
  }
  return null;
}

/** Resize params for display in lists/cards (server-side). */
export function optimizeDisplayImageUrl(src, width = 480, quality = 72) {
  const url = normalizeImageUrl(src);
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (UNSPLASH_IMAGE_HOSTS.has(host)) {
      return applyUnsplashCdnParams(url, width, quality);
    }

    if (host.endsWith(".supabase.co") && parsed.pathname.includes("/storage/v1/object/public/")) {
      const renderPath = parsed.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      const renderUrl = new URL(renderPath, parsed.origin);
      renderUrl.searchParams.set("width", String(width));
      renderUrl.searchParams.set("quality", String(quality));
      renderUrl.searchParams.set("resize", "cover");
      return renderUrl.toString();
    }
  } catch {
    return url;
  }

  return url;
}

/** Turn Unsplash page/share links into direct CDN URLs when possible. */
export async function resolveImageUrl(raw) {
  const url = normalizeImageUrl(raw);
  if (!url) return url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  if (UNSPLASH_IMAGE_HOSTS.has(host)) {
    return applyUnsplashCdnParams(url);
  }

  if (host === "unsplash.com") {
    const photoId = unsplashPhotoIdFromPath(parsed.pathname);
    const key = process.env.UNSPLASH_ACCESS_KEY?.trim();

    if (photoId && key) {
      const apiUrl = await resolveUnsplashViaApi(photoId, key);
      if (apiUrl) return apiUrl;
    }

    const pageUrl = await resolveUnsplashViaPage(parsed.toString());
    if (pageUrl) return pageUrl;

    if (!key) {
      console.warn(
        "[resolveImageUrl] UNSPLASH_ACCESS_KEY is not set — add it on Vercel to resolve Unsplash page URLs.",
      );
    }
  }

  return url;
}

/** Resolve Unsplash page links inside markdown image syntax. */
export async function resolveMarkdownImageUrls(content) {
  if (!content || typeof content !== "string") return content;
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let result = content;
  const matches = [...content.matchAll(regex)];
  for (const match of matches) {
    const [full, alt, rawUrl] = match;
    const trimmed = rawUrl.trim();
    const resolved = await resolveImageUrl(trimmed);
    if (resolved && resolved !== trimmed) {
      result = result.replace(full, `![${alt}](${resolved})`);
    }
  }
  return result;
}

/**
 * Upload a base64 image to Supabase Storage (public blog-images bucket).
 * Returns { ok: true, url } or { ok: false, status, error }.
 */
export async function uploadBlogImage({ filename, contentType, data }) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      status: 503,
      error:
        "Image upload is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel, run migrate:storage, or paste a direct image URL (e.g. images.unsplash.com/...).",
    };
  }

  if (!filename || !contentType || !data) {
    return { ok: false, status: 400, error: "filename, contentType, and data (base64) are required" };
  }

  const ext = filename.split(".").pop() || "jpg";
  const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(data, "base64");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "blog-images";

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${safeName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!uploadRes.ok) {
    const detail = await uploadRes.text().catch(() => "");
    console.error("[image-upload] Supabase upload failed:", uploadRes.status, detail.slice(0, 300));
    return {
      ok: false,
      status: 500,
      error:
        "Upload failed. In Supabase: Storage → create a public bucket named blog-images (or run pnpm --filter @workspace/db run migrate:storage).",
    };
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${safeName}`;
  return { ok: true, url: publicUrl };
}
