import serverless from "serverless-http";

export const config = {
  maxDuration: 30,
};

let handler: ReturnType<typeof serverless>;

try {
  const app = (await import("../dist/serverless.mjs")).default;
  handler = serverless(app);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[api] Failed to load serverless bundle:", message);
  handler = serverless((_req, res) => {
    res.status(503).json({
      error: "API failed to start",
      hint: "Run the api-server build and set DATABASE_URL (or DATABASE_POOLER_URL) on Vercel.",
      detail: message,
    });
  });
}

export default handler;
