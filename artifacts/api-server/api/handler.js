import serverless from "serverless-http";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;
let publicHandlerPromise = null;

/**
 * Vercel rewrites /api/* → /api (index.js). The function receives a stripped path
 * like /posts/home-feed — normalize back to /api/posts/home-feed for routing.
 */
function requestPath(req) {
  const raw = req.url ?? "/";
  const pathOnly = raw.split("?")[0] || "/";

  if (pathOnly === "/api" || pathOnly.startsWith("/api/")) {
    return pathOnly;
  }

  if (pathOnly.startsWith("/")) {
    return `/api${pathOnly}`;
  }

  return `/api/${pathOnly}`;
}

function querySuffix(req) {
  return req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
}

/** Full Express app mounts routes at /api — keep the /api prefix. */
function applyFullAppPath(req, path) {
  req.url = path + querySuffix(req);
}

/** Public mini-app registers routes without /api prefix. */
function applyPublicAppPath(req, path) {
  const stripped = path === "/api" ? "/" : path.startsWith("/api/") ? path.slice(4) : path;
  req.url = stripped + querySuffix(req);
}

function isPublicApiPath(path, req) {
  if (path === "/api/auth/user/me") {
    return !String(req.headers?.cookie || "").includes("connect.sid");
  }
  return (
    path === "/api/categories" ||
    path === "/api/posts/home-feed" ||
    path.startsWith("/api/feeds/dev-headlines")
  );
}

function buildUnavailableHandler(message) {
  return serverless((_req, res) => {
    res.status(503).json({
      error: "API failed to start",
      hint: "Set DATABASE_URL (or DATABASE_POOLER_URL) on Vercel.",
      detail: message,
    });
  });
}

async function getPublicHandler() {
  if (!publicHandlerPromise) {
    const started = Date.now();
    publicHandlerPromise = import("../dist/public-api.mjs")
      .then((mod) => {
        console.log(`[api] public bundle loaded in ${Date.now() - started}ms`);
        return serverless(mod.default);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[api] Failed to load public bundle:", message);
        return null;
      });
  }
  return publicHandlerPromise;
}

async function getHandler() {
  if (!handlerPromise) {
    const started = Date.now();
    handlerPromise = import("../dist/serverless.mjs")
      .then((mod) => {
        console.log(`[api] serverless bundle loaded in ${Date.now() - started}ms`);
        return serverless(mod.default);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[api] Failed to load serverless bundle:", message);
        return buildUnavailableHandler(message);
      });
  }
  return handlerPromise;
}

export default async function handler(req, res) {
  const path = requestPath(req);

  if (path === "/api/healthz") {
    return res.status(200).json({ status: "ok" });
  }
  if (path === "/api/readyz") {
    return res.status(200).json({
      status: "ok",
      env: {
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
        hasPoolerUrl: Boolean(process.env.DATABASE_POOLER_URL?.trim()),
        hasSessionSecret: Boolean(process.env.SESSION_SECRET?.trim()),
        hasSiteUrl: Boolean(process.env.SITE_URL?.trim()),
        vercel: Boolean(process.env.VERCEL),
      },
    });
  }

  try {
    if (isPublicApiPath(path, req)) {
      const publicEntry = await getPublicHandler();
      if (publicEntry) {
        applyPublicAppPath(req, path);
        return await publicEntry(req, res);
      }
    }
    const entry = await getHandler();
    applyFullAppPath(req, path);
    return await entry(req, res);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api] Unhandled handler error:", message);
    if (!res.headersSent) {
      return res.status(503).json({
        error: "API request failed",
        detail: message,
      });
    }
  }
}
