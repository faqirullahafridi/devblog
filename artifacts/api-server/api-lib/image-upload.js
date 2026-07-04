import { randomBytes } from "node:crypto";

const UNSPLASH_IMAGE_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);

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
  const match = pathname.match(/^\/photos\/([^/?#]+)/);
  if (!match) return null;
  const segment = decodeURIComponent(match[1]);
  if (!segment) return null;
  return segment.includes("-") ? segment.split("-").pop() : segment;
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
    return parsed.toString();
  }

  if (host === "unsplash.com") {
    const photoId = unsplashPhotoIdFromPath(parsed.pathname);
    const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (photoId && key) {
      try {
        const res = await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(photoId)}`, {
          headers: { Authorization: `Client-ID ${key}` },
        });
        if (res.ok) {
          const data = await res.json();
          return data.urls?.regular || data.urls?.small || data.urls?.full || url;
        }
      } catch (err) {
        console.error("[resolveImageUrl] Unsplash API error:", err instanceof Error ? err.message : err);
      }
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
