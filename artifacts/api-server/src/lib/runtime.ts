/** True when running as a short-lived serverless function (Vercel, Lambda, etc.). */
export function isServerlessRuntime(): boolean {
  return Boolean(
    process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.FUNCTIONS_WORKER_RUNTIME,
  );
}

/** Long-running Node process (local dev, Railway, Fly, Render, etc.). */
export function isLongRunningServer(): boolean {
  return !isServerlessRuntime();
}
