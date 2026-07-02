import serverless from "serverless-http";

export const config = {
  maxDuration: 30,
};

let handler;

try {
  const mod = await import("../artifacts/api-server/dist/serverless.mjs");
  handler = serverless(mod.default);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api] Failed to load serverless bundle:", message);
  handler = serverless((_req, res) => {
    res.status(503).json({
      error: "API failed to start",
      hint: "Run pnpm run build:vercel and set DATABASE_URL (or DATABASE_POOLER_URL) on Vercel.",
      detail: message,
    });
  });
}

export default handler;
