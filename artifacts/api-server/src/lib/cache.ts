import type { RequestHandler, Response } from "express";

function edgeMaxAge(browserMaxAgeSeconds: number): number {
  const configured = Number(process.env.CDN_CACHE_SECONDS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  return Math.max(browserMaxAgeSeconds * 2, browserMaxAgeSeconds);
}

/** Set Cache-Control with CDN-friendly s-maxage for Vercel edge caching. */
export function setPublicCache(
  res: Response,
  maxAgeSeconds = 60,
  staleWhileRevalidateSeconds = 300,
): void {
  const sMaxAge = edgeMaxAge(maxAgeSeconds);
  res.set(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidateSeconds}`,
  );
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
