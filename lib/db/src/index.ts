import "./load-env";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY ||
    process.env.FUNCTIONS_WORKER_RUNTIME,
);

const connectionString =
  process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (or DATABASE_POOLER_URL) must be set. Did you forget to provision a database?",
  );
}

const poolMax = Number(process.env.DATABASE_POOL_MAX ?? (isServerless ? 2 : 10));
const idleTimeoutMillis = Number(
  process.env.DATABASE_IDLE_TIMEOUT_MS ?? (isServerless ? 10_000 : 30_000),
);

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: poolMax,
  idleTimeoutMillis,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: isServerless,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
