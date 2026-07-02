import serverless from "serverless-http";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;

function requestPath(req) {
  const raw = req.url ?? "/";
  return raw.split("?")[0] || "/";
}

function buildUnavailableHandler(message) {
  return serverless((_req, res) => {
    res.status(503).json({
      error: "API failed to start",
      hint: "Run pnpm run build:vercel and set DATABASE_URL (or DATABASE_POOLER_URL) on Vercel.",
      detail: message,
    });
  });
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
  if (path === "/api/healthz" || path === "/healthz") {
    return res.status(200).json({ status: "ok" });
  }
  const entry = await getHandler();
  return entry(req, res);
}
