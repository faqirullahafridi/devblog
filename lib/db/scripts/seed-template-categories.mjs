/**
 * Seed blog categories for template SEO content hub.
 * Usage: pnpm --filter @workspace/db run seed:template-categories
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const CATEGORIES = [
  {
    name: "Web Design Inspiration",
    slug: "web-design-inspiration",
    description: "Layout ideas, UI patterns, and design inspiration for modern websites.",
  },
  {
    name: "Free Source Code",
    slug: "free-source-code",
    description: "Open templates, HTML projects, and downloadable front-end source code.",
  },
  {
    name: "Landing Page Design",
    slug: "landing-page-design",
    description: "High-converting landing page patterns, hero sections, and CTA layouts.",
  },
  {
    name: "React Projects",
    slug: "react-projects",
    description: "React templates, component patterns, and full-stack starter projects.",
  },
  {
    name: "HTML Templates",
    slug: "html-templates",
    description: "Free HTML and CSS website templates for landing pages and business sites.",
  },
  {
    name: "Startup Websites",
    slug: "startup-websites",
    description: "Startup landing pages, MVPs, and pitch site design for founders.",
  },
  {
    name: "SaaS Design",
    slug: "saas-design",
    description: "SaaS marketing sites, pricing pages, and product UI inspiration.",
  },
];

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    let inserted = 0;
    let skipped = 0;
    for (const cat of CATEGORIES) {
      const exists = await pool.query("SELECT id FROM categories WHERE slug = $1", [cat.slug]);
      if (exists.rows.length) {
        skipped++;
        continue;
      }
      await pool.query(
        "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)",
        [cat.name, cat.slug, cat.description],
      );
      inserted++;
      console.log("+", cat.slug);
    }
    console.log(`Done. Inserted ${inserted}, skipped ${skipped}.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
