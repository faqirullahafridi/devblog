import { randomBytes } from "node:crypto";

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
