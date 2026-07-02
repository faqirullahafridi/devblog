import serverless from "serverless-http";
import { tryFastRoute } from "./fast-routes.js";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;

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

function applyFullAppPath(req, path) {
  req.url = path + querySuffix(req);
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

  // Homepage + anonymous auth — raw pg/fetch, no heavy bundle (fixes 504 cold starts)
  if (await tryFastRoute(path, req, res)) {
    return;
  }

  try {
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
