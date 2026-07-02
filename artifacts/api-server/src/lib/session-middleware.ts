import type { Request, Response, NextFunction, RequestHandler } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import { ADMIN_SESSION_TTL_MS } from "./admin-session";
import { isServerlessRuntime } from "./runtime";

const SESSION_PATH_PREFIXES = ["/api/auth"];

export function shouldUseSession(req: Request): boolean {
  if (req.cookies?.["connect.sid"]) return true;
  const path = req.path || req.url?.split("?")[0] || "";
  return SESSION_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

let sessionHandler: RequestHandler | null = null;

function buildSessionHandler(): RequestHandler {
  const PgSession = connectPgSimple(session);
  return session({
    store: new PgSession({
      pool,
      createTableIfMissing: !isServerlessRuntime(),
    }),
    secret: process.env.SESSION_SECRET || "dev-blog-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: ADMIN_SESSION_TTL_MS,
      sameSite: "lax",
    },
  });
}

export function lazySession(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!shouldUseSession(req)) return next();
    if (!sessionHandler) sessionHandler = buildSessionHandler();
    return sessionHandler(req, res, next);
  };
}
