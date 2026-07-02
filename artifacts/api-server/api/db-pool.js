import pg from "pg";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (pool) return pool;
  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL (or DATABASE_POOLER_URL) is not set");
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 8_000,
    allowExitOnIdle: true,
  });
  pool.on("error", (err) => console.error("[db-pool] pool error:", err.message));
  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  const client = await Promise.race([
    pool.connect(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 8_000),
    ),
  ]);
  try {
    await client.query("SET statement_timeout = 12000");
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
