const UNSPLASH_HOSTS = new Set(["images.unsplash.com", "plus.unsplash.com"]);

/** Ensure image URLs work in <img src> (add https:// when missing). */
export function normalizeImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  let s = src.trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`;
  return s;
}

export function isUnsplashPageUrl(src: string): boolean {
  try {
    const host = new URL(normalizeImageUrl(src)).hostname.replace(/^www\./, "");
    return host === "unsplash.com";
  } catch {
    return false;
  }
}

export function isDirectImageUrl(src: string): boolean {
  const normalized = normalizeImageUrl(src);
  if (!normalized) return false;
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    if (UNSPLASH_HOSTS.has(host)) return true;
    if (host.endsWith(".supabase.co") && normalized.includes("/storage/v1/object/public/")) return true;
    if (/\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i.test(normalized)) return true;
  } catch {
    return false;
  }
  return false;
}

export function optimizeImageUrl(src: string | null | undefined, width: number, quality = 75): string {
  const normalized = normalizeImageUrl(src);
  if (!normalized) return "";
  if (width <= 0) return normalized;

  try {
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "");

    if (UNSPLASH_HOSTS.has(host)) {
      url.searchParams.set("w", String(Math.round(width)));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", String(quality));
      return url.toString();
    }

    // Supabase Storage — request a resized variant via the image renderer
    if (host.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
      const renderPath = url.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
      const renderUrl = new URL(renderPath, url.origin);
      renderUrl.searchParams.set("width", String(Math.round(width)));
      renderUrl.searchParams.set("quality", String(quality));
      renderUrl.searchParams.set("resize", "contain");
      return renderUrl.toString();
    }
  } catch {
    return normalized;
  }

  return normalized;
}

export const IMAGE_WIDTHS = {
  thumb: 256,
  card: 480,
  hero: 960,
  article: 800,
} as const;
