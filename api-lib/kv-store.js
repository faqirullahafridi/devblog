/** Optional Upstash Redis REST — falls back to in-memory when not configured. */

const memory = new Map();
const UPSTASH_TIMEOUT_MS = Number(process.env.UPSTASH_TIMEOUT_MS ?? 3_000);
let kvDisabledUntil = 0;

function upstashConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

function kvTemporarilyDisabled() {
  return Date.now() < kvDisabledUntil;
}

function disableKvTemporarily(ms = 60_000) {
  kvDisabledUntil = Date.now() + ms;
}

async function upstashCommand(command) {
  if (kvTemporarilyDisabled()) return null;
  const url = process.env.UPSTASH_REDIS_REST_URL.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN.trim();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/abort|timeout/i.test(message)) {
      console.warn("[kv] Upstash request timed out; using in-memory fallback");
      disableKvTemporarily();
    }
    return null;
  }
}

export function isKvConfigured() {
  return upstashConfigured() && !kvTemporarilyDisabled();
}

export async function kvGet(key) {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    const value = await upstashCommand(["GET", key]);
    if (value != null) return value;
  }
  const hit = memory.get(key);
  if (!hit || hit.expiresAt <= Date.now()) {
    if (hit) memory.delete(key);
    return null;
  }
  return hit.value;
}

export async function kvSet(key, value, ttlSec) {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    await upstashCommand(["SET", key, value, "EX", ttlSec]);
    return;
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export async function kvDel(key) {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    await upstashCommand(["DEL", key]);
  }
  memory.delete(key);
}
