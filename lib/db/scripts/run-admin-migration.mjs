/**
 * Apply admin auth tables (004_admin_auth.sql).
 * Usage: pnpm --filter @workspace/db run migrate:admin
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

async function main() {
  const sqlPath = path.resolve(__dirname, "../migrations/004_admin_auth.sql");
  const sql = fs.readFileSync(sqlPath, "utf8").trim();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost") ? undefined : { rejectUnauthorized: false },
  });

  try {
    await pool.query(sql);
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('admin_credentials', 'admin_otp_codes')
      ORDER BY table_name
    `);
    console.log("Admin auth migration applied successfully");
    console.log("Tables:", tables.rows.map((r) => r.table_name).join(", "));
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
