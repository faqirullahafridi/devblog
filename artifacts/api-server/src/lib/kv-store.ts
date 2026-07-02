/** Optional Upstash Redis REST — falls back to in-memory when not configured. */

type MemoryEntry = { value: string; expiresAt: number };
const memory = new Map<string, MemoryEntry>();

const UPSTASH_TIMEOUT_MS = Number(process.env.UPSTASH_TIMEOUT_MS ?? 3_000);
let kvDisabledUntil = 0;

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

function kvTemporarilyDisabled(): boolean {
  return Date.now() < kvDisabledUntil;
}

function disableKvTemporarily(ms = 60_000): void {
  kvDisabledUntil = Date.now() + ms;
}

async function upstashCommand<T>(command: unknown[]): Promise<T | null> {
  if (kvTemporarilyDisabled()) return null;

  const url = process.env.UPSTASH_REDIS_REST_URL!.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!.trim();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(UPSTASH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: T };
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

export function isKvConfigured(): boolean {
  return upstashConfigured() && !kvTemporarilyDisabled();
}

export async function kvGet(key: string): Promise<string | null> {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    const value = await upstashCommand<string | null>(["GET", key]);
    if (value != null) return value;
  }

  const hit = memory.get(key);
  if (!hit || hit.expiresAt <= Date.now()) {
    if (hit) memory.delete(key);
    return null;
  }
  return hit.value;
}

export async function kvSet(key: string, value: string, ttlSec: number): Promise<void> {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    await upstashCommand(["SET", key, value, "EX", ttlSec]);
    return;
  }

  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export async function kvIncr(key: string, ttlSec: number): Promise<number> {
  if (upstashConfigured() && !kvTemporarilyDisabled()) {
    const count = await upstashCommand<number>(["INCR", key]);
    if (count === 1) await upstashCommand(["EXPIRE", key, ttlSec]);
    return count ?? 1;
  }

  const now = Date.now();
  const hit = memory.get(key);
  if (!hit || hit.expiresAt <= now) {
    memory.set(key, { value: "1", expiresAt: now + ttlSec * 1000 });
    return 1;
  }

  const next = Number(hit.value) + 1;
  hit.value = String(next);
  return next;
}

export function pruneKvMemory(): void {
  const now = Date.now();
  for (const [key, entry] of memory.entries()) {
    if (entry.expiresAt <= now) memory.delete(key);
  }
}

if (typeof setInterval !== "undefined") {
  setInterval(pruneKvMemory, 60_000).unref?.();
}
