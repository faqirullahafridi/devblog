/** Short-lived cache for Vercel warm lambdas — optional Upstash for cross-instance sharing. */

import { isKvConfigured, kvGet, kvSet } from "./kv-store.js";

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
  const memHit = getRouteCache(key);
  if (memHit !== null) return memHit;

  const kvKey = `route:${key}`;
  if (isKvConfigured()) {
    try {
      const raw = await kvGet(kvKey);
      if (raw) {
        const value = JSON.parse(raw);
        setRouteCache(key, value, ttlMs);
        return value;
      }
    } catch {
      /* fall through to loader */
    }
  }

  const value = await loader();
  if (value !== undefined) {
    setRouteCache(key, value, ttlMs);
    if (isKvConfigured()) {
      const ttlSec = Math.max(30, Math.ceil(ttlMs / 1000));
      void kvSet(kvKey, JSON.stringify(value), ttlSec);
    }
  }
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
