import type { Request, Response, NextFunction } from "express";

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  skip?: (req: Request) => boolean;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (opts.skip?.(req)) return next();

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${opts.keyPrefix ?? "rl"}:${ip}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    if (entry.count >= opts.max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

    entry.count += 1;
    next();
  };
}
