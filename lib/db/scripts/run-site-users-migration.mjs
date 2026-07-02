/**
 * Apply site user accounts table (005_site_users.sql).
 * Usage: pnpm --filter @workspace/db run migrate:site-users
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const sqlPath = path.resolve(__dirname, "../migrations/005_site_users.sql");
  const sql = fs.readFileSync(sqlPath, "utf8").trim();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    console.log("Site users migration applied successfully");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
