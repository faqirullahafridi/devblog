import serverless from "serverless-http";
import { tryFastRoute } from "./fast-routes.js";
import { tryAdminRoute, isAdminRoutePath } from "./admin-routes.js";
import { tryAiRoute, isAiRoutePath } from "./ai-chat-routes.js";
import { tryJobsRoute, isJobsRoutePath } from "./jobs-routes.js";
import { tryPlatformRoute, isPlatformRoutePath } from "./platform-routes.js";
import { trySiteAuthRoute, isSiteAuthRoutePath } from "./site-auth-routes.js";
import { tryContentRoute, isContentRoutePath } from "./content-routes.js";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;
const BUNDLE_LOAD_MS = 8_000;

const LIGHT_ROUTE_CHECKERS = [
  isContentRoutePath,
  isJobsRoutePath,
  isPlatformRoutePath,
  isSiteAuthRoutePath,
  isAiRoutePath,
  isAdminRoutePath,
];

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

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function isKnownLightRoute(path, method) {
  if (path === "/api/healthz" || path === "/api/readyz") return true;
  return LIGHT_ROUTE_CHECKERS.some((fn) => fn(path, method));
}

async function getHandler() {
  if (!handlerPromise) {
    const started = Date.now();
    handlerPromise = withTimeout(
      import("../artifacts/api-server/dist/serverless.mjs"),
      BUNDLE_LOAD_MS,
      "Serverless bundle load",
    )
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

  if (await tryFastRoute(path, req, res)) return;
  if (await tryContentRoute(path, req, res)) return;
  if (await tryJobsRoute(path, req, res)) return;
  if (await tryPlatformRoute(path, req, res)) return;
  if (await trySiteAuthRoute(path, req, res)) return;
  if (isAdminRoutePath(path, req.method) && (await tryAdminRoute(path, req, res))) return;
  if (isAiRoutePath(path, req.method) && (await tryAiRoute(path, req, res))) return;

  if (isKnownLightRoute(path, req.method)) {
    return res.status(404).json({ error: "Route not found", path });
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
