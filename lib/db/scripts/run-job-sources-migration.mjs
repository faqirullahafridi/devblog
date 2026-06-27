/**
 * Apply job source columns (003_job_sources.sql).
 * Usage: pnpm --filter @workspace/db run migrate:jobs
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const sqlPath = path.resolve(__dirname, "../migrations/003_job_sources.sql");
  const sql = fs.readFileSync(sqlPath, "utf8").trim();

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("Job sources migration applied successfully");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
