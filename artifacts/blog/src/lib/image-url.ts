/** Resize remote image URLs where the CDN supports width params (Unsplash, etc.). */
export function normalizeImageUrl(src: string | null | undefined): string {
  if (!src) return "";
  let s = src.trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return `https://${s}`;
  return s;
}

export function optimizeImageUrl(src: string | null | undefined, width: number, quality = 75): string {
  const normalized = normalizeImageUrl(src);
  if (!normalized) return "";
  if (width <= 0) return normalized;

  try {
    const url = new URL(normalized);

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(Math.round(width)));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", String(quality));
      return url.toString();
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
