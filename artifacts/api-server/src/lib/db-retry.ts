const CONNECTION_ERROR_RE =
  /connection terminated|connection timeout|ECONNRESET|ECONNREFUSED|ETIMEDOUT|socket hang up|Client has encountered a connection error/i;

export function isDbConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const msg = "message" in err && typeof err.message === "string" ? err.message : String(err);
  if (CONNECTION_ERROR_RE.test(msg)) return true;
  if ("cause" in err && err.cause) return isDbConnectionError(err.cause);
  return false;
}

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries && isDbConnectionError(err)) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
