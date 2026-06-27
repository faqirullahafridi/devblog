import type { Request, Response } from "express";
import { randomBytes } from "node:crypto";

const COOKIE_NAME = "visitor_id";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export function getVisitorId(req: Request, res: Response): string {
  const existing = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (existing && existing.length >= 8) return existing;

  const id = randomBytes(16).toString("hex");
  res.cookie(COOKIE_NAME, id, {
    maxAge: MAX_AGE_MS,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return id;
}

export function getVisitorIdOptional(req: Request): string | null {
  const existing = req.cookies?.[COOKIE_NAME] as string | undefined;
  return existing && existing.length >= 8 ? existing : null;
}
