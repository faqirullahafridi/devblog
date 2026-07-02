#!/usr/bin/env node
/**
 * Post-build: emit route-specific index.html files so non-JS crawlers see unique
 * titles, meta descriptions, a single canonical, one H1/H2, and 200+ visible words.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HUB_SEO_PAGES, SITE_ORIGIN } from "./seo-pages-data.js";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(scriptDir, "..");
const distDir = path.resolve(blogDir, "dist/public");
const templatePath = path.join(distDir, "index.html");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function canonicalFor(pathname) {
  if (!pathname || pathname === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function buildStaticMain(page) {
  const body = page.paragraphs.map((p) => `      <p>${escapeHtml(p)}</p>`).join("\n");
  return `      <main id="seo-static-content">
        <h1>${escapeHtml(page.h1)}</h1>
        <h2>${escapeHtml(page.h2)}</h2>
${body}
      </main>
`;
}

function applySeo(template, page) {
  const canonical = canonicalFor(page.path);
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
  );

  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  const ogUrlTag = `<meta property="og:url" content="${escapeHtml(canonical)}" />`;
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>\s*/g, "");
  html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>\s*/g, "");
  html = html.replace(
    "<!-- seo-head-injection -->",
    `${canonicalTag}\n    ${ogUrlTag}\n    <!-- seo-head-injection -->`,
  );

  // Remove JS canonical injector to avoid duplicate link elements after hydration.
  html = html.replace(/\s*<script>\s*\(function \(\) \{\s*var origin = "https:\/\/www\.techventry\.com";[\s\S]*?\}\)\(\);\s*<\/script>/, "");

  const main = buildStaticMain(page);
  if (html.includes('id="seo-static-content"')) {
    html = html.replace(/<main id="seo-static-content">[\s\S]*?<\/main>\s*/, main);
  } else {
    html = html.replace(/<div id="root">\s*/, `<div id="root">\n${main}`);
  }

  // Remove legacy duplicate blocks if present in an older template build.
  html = html.replace(/\s*<noscript>[\s\S]*?<\/noscript>/, "");
  html = html.replace(/\s*<article class="seo-crawl-content">[\s\S]*?<\/article>/, "");

  return html;
}

function writePageOutput(page, html) {
  if (page.path === "/") {
    fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
    return;
  }

  const segments = page.path.replace(/^\//, "").split("/");
  const outDir = path.join(distDir, ...segments);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), html, "utf8");
}

function main() {
  if (!fs.existsSync(templatePath)) {
    console.error(`Missing build output at ${templatePath}. Run vite build first.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");

  for (const page of HUB_SEO_PAGES) {
    const html = applySeo(template, page);
    writePageOutput(page, html);
  }

  console.log(`Generated ${HUB_SEO_PAGES.length} prerendered SEO HTML pages in ${distDir}`);
}

main();
