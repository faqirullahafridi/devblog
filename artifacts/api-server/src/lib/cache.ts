import type { RequestHandler, Response } from "express";

function edgeMaxAge(browserMaxAgeSeconds: number): number {
  const configured = Number(process.env.CDN_CACHE_SECONDS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return Math.max(browserMaxAgeSeconds * 3, 300);
}

/** Set Cache-Control with CDN-friendly s-maxage for Vercel edge caching. */
export function setPublicCache(
  res: Response,
  maxAgeSeconds = 60,
  staleWhileRevalidateSeconds = 3600,
): void {
  const edgeMax = Number(process.env.CDN_CACHE_SECONDS);
  const sMaxAge =
    Number.isFinite(edgeMax) && edgeMax > 0 ? edgeMax : Math.max(maxAgeSeconds * 3, 300);
  const swr = Number(process.env.CDN_STALE_SECONDS) || staleWhileRevalidateSeconds;
  res.set(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  );
  res.set("CDN-Cache-Control", `max-age=${sMaxAge}, stale-while-revalidate=${swr}`);
  res.set("Vary", "Accept-Encoding");
}

/** Short-lived public cache for read-heavy blog endpoints. */
export function cachePublic(
  maxAgeSeconds = 60,
  staleWhileRevalidateSeconds = 300,
): RequestHandler {
  return (_req, res, next) => {
    setPublicCache(res, maxAgeSeconds, staleWhileRevalidateSeconds);
    next();
  };
}
