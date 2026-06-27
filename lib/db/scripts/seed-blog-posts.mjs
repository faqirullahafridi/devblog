/**
 * Seed published blog posts for all non-AI categories.
 * Skips categories: ai-tools, artificial-intelligence, machine-learning
 *
 * Usage:
 *   pnpm --filter @workspace/db run seed:posts          # insert new only
 *   pnpm --filter @workspace/db run seed:posts:update   # insert + update existing
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import { BLOG_POSTS } from "./blog-posts-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const UPDATE = process.argv.includes("--update");

const SKIP_CATEGORIES = new Set([
  "ai-tools",
  "artificial-intelligence",
  "machine-learning",
]);

function calcReadingTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows: categories } = await pool.query(
      "SELECT id, slug FROM categories",
    );
    const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    const { rows: existing } = await pool.query("SELECT slug FROM posts");
    const existingSlugs = new Set(existing.map((r) => r.slug));

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const post of BLOG_POSTS) {
      if (SKIP_CATEGORIES.has(post.categorySlug)) {
        skipped++;
        continue;
      }

      const categoryId = catBySlug[post.categorySlug];
      if (!categoryId) {
        console.warn(`unknown category ${post.categorySlug} for ${post.slug}`);
        skipped++;
        continue;
      }

      const readingTime = calcReadingTime(post.content);
      const now = new Date();

      if (existingSlugs.has(post.slug)) {
        if (!UPDATE) {
          skipped++;
          continue;
        }

        await pool.query(
          `UPDATE posts SET
            title = $1,
            content = $2,
            excerpt = $3,
            featured_image = $4,
            category_id = $5,
            seo_title = $6,
            meta_description = $7,
            is_featured = $8,
            tags = $9,
            reading_time = $10,
            updated_at = $11
          WHERE slug = $12`,
          [
            post.title,
            post.content,
            post.excerpt,
            post.featuredImage,
            categoryId,
            post.seoTitle ?? post.title,
            post.metaDescription ?? post.excerpt,
            post.isFeatured ?? false,
            JSON.stringify(post.tags ?? []),
            readingTime,
            now,
            post.slug,
          ],
        );
        updated++;
        console.log(`~ ${post.categorySlug}: ${post.title}`);
        continue;
      }

      await pool.query(
        `INSERT INTO posts (
          title, slug, content, excerpt, featured_image, status,
          category_id, seo_title, meta_description, is_featured, tags,
          publish_at, reading_time, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,'published',$6,$7,$8,$9,$10,$11,$12,$11,$11)`,
        [
          post.title,
          post.slug,
          post.content,
          post.excerpt,
          post.featuredImage,
          categoryId,
          post.seoTitle ?? post.title,
          post.metaDescription ?? post.excerpt,
          post.isFeatured ?? false,
          JSON.stringify(post.tags ?? []),
          post.publishAt ? new Date(post.publishAt) : now,
          readingTime,
        ],
      );

      existingSlugs.add(post.slug);
      inserted++;
      console.log(`+ ${post.categorySlug}: ${post.title}`);
    }

    console.log(`\nDone. Inserted ${inserted}, updated ${updated}, skipped ${skipped}.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
