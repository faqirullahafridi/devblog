/** Resize remote image URLs where the CDN supports width params (Unsplash, etc.). */
export function optimizeImageUrl(src: string | null | undefined, width: number, quality = 75): string {
  if (!src) return "";
  if (width <= 0) return src;

  try {
    const url = new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");

    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("w", String(Math.round(width)));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("q", String(quality));
      return url.toString();
    }
  } catch {
    return src;
  }

  return src;
}

export const IMAGE_WIDTHS = {
  thumb: 256,
  card: 480,
  hero: 960,
  article: 800,
} as const;
