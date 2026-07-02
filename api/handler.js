import serverless from "serverless-http";
import { tryFastRoute, isAiBundlePath } from "./fast-routes.js";
import { tryAdminRoute, isAdminRoutePath } from "./admin-routes.js";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;
let aiHandlerPromise = null;

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

async function getAiHandler() {
  if (!aiHandlerPromise) {
    const started = Date.now();
    aiHandlerPromise = import("../artifacts/api-server/dist/ai-api.mjs")
      .then((mod) => {
        console.log(`[api] ai bundle loaded in ${Date.now() - started}ms`);
        return serverless(mod.default);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[api] Failed to load AI bundle:", message);
        return null;
      });
  }
  return aiHandlerPromise;
}

async function getHandler() {
  if (!handlerPromise) {
    const started = Date.now();
    handlerPromise = import("../artifacts/api-server/dist/serverless.mjs")
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

  if (await tryFastRoute(path, req, res)) {
    return;
  }

  if (isAdminRoutePath(path) && (await tryAdminRoute(path, req, res))) {
    return;
  }

  try {
    if (isAiBundlePath(path, req.method)) {
      const aiEntry = await getAiHandler();
      if (aiEntry) {
        applyFullAppPath(req, path);
        return await aiEntry(req, res);
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
