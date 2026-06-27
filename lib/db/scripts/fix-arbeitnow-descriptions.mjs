/**
 * One-off: convert stored Arbeitnow HTML descriptions to markdown/plain text.
 * Run: pnpm --filter @workspace/db run fix:arbeitnow-descriptions
 */
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(root, ".env") });

function decodeHtmlEntities(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html) {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
      const heading = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return heading ? `\n\n${"#".repeat(Math.min(Number(level), 6))} ${heading}\n\n` : "\n\n";
    })
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
      const label = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return label ? `[${label}](${href})` : href;
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => {
      const item = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return item ? `\n- ${item}` : "";
    })
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(text)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanArbeitnowBoilerplate(html) {
  return html
    .replace(/<p>\s*Find[\s\S]*?Arbeitnow[\s\S]*?<\/p>/gi, "")
    .replace(/Find[\s\S]*?Jobs in Germany[\s\S]*?Arbeitnow/gi, "")
    .replace(/\s*on Arbeitnow\s*<\/a>?/gi, "")
    .trim();
}

function convertDescription(raw) {
  const attribution = raw.includes("Job sourced via") ? raw.slice(raw.indexOf("\n\n---")) : "";
  const body = attribution ? raw.slice(0, raw.indexOf("\n\n---")) : raw;
  if (!body.includes("<")) return raw;
  const converted = stripHtml(cleanArbeitnowBoilerplate(body));
  return attribution ? `${converted}${attribution}` : converted;
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT id, description FROM jobs WHERE source = 'arbeitnow' AND description LIKE '%<%'`,
);

let updated = 0;
for (const row of rows) {
  const next = convertDescription(row.description);
  if (next === row.description) continue;
  await client.query(`UPDATE jobs SET description = $1, updated_at = NOW() WHERE id = $2`, [next, row.id]);
  updated++;
}

await client.end();
console.log(`Updated ${updated} of ${rows.length} Arbeitnow job descriptions.`);
