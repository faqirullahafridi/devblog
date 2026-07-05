/** Short-lived in-memory cache for Vercel warm lambdas — cuts DB hits under burst traffic. */

const store = new Map();

const MAX_ENTRIES = 800;

function prune() {
  if (store.size <= MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) store.delete(key);
  }
  if (store.size <= MAX_ENTRIES) return;
  const drop = store.size - MAX_ENTRIES;
  let i = 0;
  for (const key of store.keys()) {
    store.delete(key);
    if (++i >= drop) break;
  }
}

export function getRouteCache(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function setRouteCache(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  prune();
}

export async function withRouteCache(key, ttlMs, loader) {
  const hit = getRouteCache(key);
  if (hit !== null) return hit;
  const value = await loader();
  if (value !== undefined) setRouteCache(key, value, ttlMs);
  return value;
}

export function invalidateRouteCache(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt <= now) store.delete(key);
    }
  }, 60_000).unref?.();
}
