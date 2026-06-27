/**
 * Sync developer_profile row with developer-profile-data.json.
 * Run: pnpm --filter @workspace/db run sync:developer-profile
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(root, ".env") });

const dataPath = path.join(
  root,
  "artifacts/api-server/src/lib/developer-profile-data.json",
);

async function main() {
  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL or DATABASE_POOLER_URL must be set");
  }

  const profile = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    const { rows } = await pool.query(`SELECT id FROM developer_profile LIMIT 1`);

    const values = [
      profile.name,
      profile.headline,
      profile.phone,
      profile.email,
      profile.location,
      profile.portfolioUrl,
      profile.aboutMe,
      JSON.stringify(profile.workExperience),
      JSON.stringify(profile.education),
      JSON.stringify(profile.projects),
      JSON.stringify(profile.technicalSkills),
      JSON.stringify(profile.languages),
      "published",
    ];

    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO developer_profile (
          name, headline, phone, email, location, portfolio_url, about_me,
          work_experience, education, projects, technical_skills, languages, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13)`,
        values,
      );
      console.log("Inserted developer profile.");
    } else {
      await pool.query(
        `UPDATE developer_profile SET
          name = $1,
          headline = $2,
          phone = $3,
          email = $4,
          location = $5,
          portfolio_url = $6,
          about_me = $7,
          work_experience = $8::jsonb,
          education = $9::jsonb,
          projects = $10::jsonb,
          technical_skills = $11::jsonb,
          languages = $12::jsonb,
          status = $13,
          updated_at = NOW()
        WHERE id = $14`,
        [...values, rows[0].id],
      );
      console.log(`Updated developer profile (id=${rows[0].id}).`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
