import serverless from "serverless-http";

export const config = {
  maxDuration: 30,
};

let handlerPromise = null;

function buildUnavailableHandler(message) {
  return serverless((_req, res) => {
    res.status(503).json({
      error: "API failed to start",
      hint: "Set DATABASE_URL (or DATABASE_POOLER_URL) on Vercel API project.",
      detail: message,
    });
  });
}

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = import("../dist/serverless.mjs")
      .then((mod) => serverless(mod.default))
      .catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[api] Failed to load serverless bundle:", message);
        return buildUnavailableHandler(message);
      });
  }
  return handlerPromise;
}

export default async function entry(req, res) {
  if (req.url === "/api/healthz" || req.url === "/healthz") {
    return res.status(200).json({ status: "ok" });
  }
  const handler = await getHandler();
  return handler(req, res);
}
