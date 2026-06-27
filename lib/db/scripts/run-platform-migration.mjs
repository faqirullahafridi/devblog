/**
 * Apply platform feature tables (002_platform_features.sql).
 * Usage: pnpm --filter @workspace/db run migrate:platform
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const sqlPath = path.resolve(__dirname, "../migrations/002_platform_features.sql");
  const raw = fs.readFileSync(sqlPath, "utf8");
  const sql = raw.replace(/\/\*[\s\S]*?\*\//g, "").trim();

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("Platform migration applied successfully");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
