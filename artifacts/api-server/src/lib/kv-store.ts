/** Optional Upstash Redis REST — falls back to in-memory when not configured. */

type MemoryEntry = { value: string; expiresAt: number };
const memory = new Map<string, MemoryEntry>();

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

async function upstashCommand<T>(command: unknown[]): Promise<T | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL!.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!.trim();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: T };
    return data.result ?? null;
  } catch {
    return null;
  }
}

export function isKvConfigured(): boolean {
  return upstashConfigured();
}

export async function kvGet(key: string): Promise<string | null> {
  if (upstashConfigured()) {
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
  if (upstashConfigured()) {
    await upstashCommand(["SET", key, value, "EX", ttlSec]);
    return;
  }

  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

export async function kvIncr(key: string, ttlSec: number): Promise<number> {
  if (upstashConfigured()) {
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
