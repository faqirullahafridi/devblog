/**
 * Apply all SQL migrations in order (idempotent).
 * Usage: pnpm --filter @workspace/db run migrate:all
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const MIGRATIONS = [
  "001_blog_images_storage.sql",
  "002_platform_features.sql",
  "003_job_sources.sql",
  "004_admin_auth.sql",
  "005_site_users.sql",
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    for (const file of MIGRATIONS) {
      const sqlPath = path.resolve(__dirname, "../migrations", file);
      const raw = fs.readFileSync(sqlPath, "utf8");
      const sql = raw.replace(/\/\*[\s\S]*?\*\//g, "").trim();
      if (!sql) continue;
      await pool.query(sql);
      console.log(`Applied ${file}`);
    }
    console.log("All migrations applied successfully");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
