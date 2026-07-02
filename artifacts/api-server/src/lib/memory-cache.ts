import { kvGet, kvSet } from "./kv-store";

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));

  const kvHit = await kvGet(key);
  if (kvHit) {
    try {
      return JSON.parse(kvHit) as T;
    } catch {
      /* fall through */
    }
  }

  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;

  const value = await loader();
  const shouldCache = !(Array.isArray(value) && value.length === 0);
  if (shouldCache) {
    store.set(key, { value, expiresAt: now + ttlMs });
    try {
      await kvSet(key, JSON.stringify(value), ttlSec);
    } catch {
      /* memory-only fallback */
    }
  }

  return value;
}

export function invalidateCache(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/** Prevent unbounded growth in long-running servers. */
export function pruneExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(pruneExpiredCache, 60_000).unref?.();
}
