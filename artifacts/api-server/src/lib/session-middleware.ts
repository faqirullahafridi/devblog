import type { Request, Response, NextFunction, RequestHandler } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { ADMIN_SESSION_TTL_MS } from "./admin-session";
import { isServerlessRuntime } from "./runtime";

/** Routes that read or write express-session (admin, site user, bookmarks, etc.). */
const SESSION_PATH_PREFIXES = [
  "/api/auth",
  "/api/ai",
  "/api/playground",
  "/api/roadmaps",
  "/api/challenges",
  "/api/jobs",
  "/api/community",
  "/api/comments",
  "/api/uploads",
];

export function shouldUseSession(req: Request): boolean {
  const path = req.path || req.url?.split("?")[0] || "";
  return SESSION_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

let sessionHandler: RequestHandler | null = null;
let sessionPool: pg.Pool | null = null;

function getSessionPool(): pg.Pool {
  if (sessionPool) return sessionPool;

  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL (or DATABASE_POOLER_URL) must be set for session store.");
  }

  sessionPool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: Number(process.env.SESSION_POOL_MAX ?? 3),
    idleTimeoutMillis: Number(process.env.SESSION_IDLE_TIMEOUT_MS ?? 10_000),
    connectionTimeoutMillis: Number(process.env.SESSION_CONNECT_TIMEOUT_MS ?? 10_000),
    keepAlive: !isServerlessRuntime(),
    allowExitOnIdle: isServerlessRuntime(),
  });

  sessionPool.on("error", (err) => {
    console.error("[session] pool client error", err.message);
  });

  return sessionPool;
}

function buildSessionHandler(): RequestHandler {
  const PgSession = connectPgSimple(session);
  return session({
    store: new PgSession({
      pool: getSessionPool(),
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
