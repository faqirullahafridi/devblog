import { Router } from "express";
import { db, postsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { getSiteUrl } from "../lib/resend";
import { publishedVisibleCondition } from "../lib/post-filters";
import { renderFeedHtml, wantsFeedHtml } from "../lib/feed-html";
import { cachePublic } from "../lib/cache";
import { cached } from "../lib/memory-cache";
import learnSitemapRoutes from "../lib/learn-sitemap-routes.json" with { type: "json" };
import { SITE_NAME } from "../lib/site-config";

const router = Router();

function isoDate(d: Date = new Date()) {
  return d.toISOString().split("T")[0];
}

router.get("/robots.txt", cachePublic(86400), (_req, res) => {
  const site = getSiteUrl();
  res.type("text/plain").send(
    `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`,
  );
});

router.get("/sitemap.xml", cachePublic(3600), async (req, res) => {
  try {
    const xml = await cached("seo:sitemap", 60 * 60_000, async () => {
      const site = getSiteUrl();
      const today = isoDate();
      const [posts, categories, tagRows] = await Promise.all([
      db
        .select({ slug: postsTable.slug, updatedAt: postsTable.updatedAt })
        .from(postsTable)
        .where(publishedVisibleCondition())
        .orderBy(desc(postsTable.updatedAt)),
      db.select({ slug: categoriesTable.slug }).from(categoriesTable),
      db
        .select({ tags: postsTable.tags, updatedAt: postsTable.updatedAt })
        .from(postsTable)
        .where(publishedVisibleCondition()),
    ]);

    const tagLastmod = new Map<string, string>();
    for (const row of tagRows) {
      const lastmod = isoDate(row.updatedAt as Date);
      for (const t of (row.tags as string[] | null) ?? []) {
        const trimmed = t.trim();
        if (!trimmed) continue;
        const slug = trimmed.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
        if (!slug) continue;
        const prev = tagLastmod.get(slug);
        if (!prev || lastmod > prev) tagLastmod.set(slug, lastmod);
      }
    }

    const toolPages = [
      "/tools",
      "/tools/json-formatter",
      "/tools/jwt-decoder",
      "/tools/regex-tester",
      "/tools/encode-decode",
      "/tools/timestamp",
      "/tools/uuid-generator",
      "/tools/hash-generator",
      "/tools/markdown-preview",
      "/tools/sql-formatter",
      "/tools/color-converter",
      "/tools/cron-parser",
      "/tools/text-diff",
      "/tools/json-to-typescript",
    ];
    const refPages = [
      "/refs",
      "/refs/git",
      "/refs/http-status-codes",
      "/refs/python",
      "/refs/javascript",
      "/refs/sql",
      "/refs/css",
      "/refs/regex-patterns",
      "/refs/terminal",
      "/refs/vscode-shortcuts",
      "/refs/json-syntax",
      "/refs/html",
      "/refs/typescript",
      "/refs/nodejs",
      "/refs/jwt-auth",
    ];
    const snippetSlugs = [
      "fetch-json-post", "debounce", "react-use-local-storage", "python-read-env",
      "python-requests-get", "sql-upsert-postgres", "express-rate-limit", "css-center-flex",
      "tailwind-responsive-grid", "bash-backup-db", "jwt-decode-payload", "regex-email-basic",
      "typescript-pick-omit", "react-error-boundary", "curl-json-api", "fetch-json-get",
      "throttle", "sleep-promise", "node-read-env", "express-cors-session",
      "express-auth-middleware", "jwt-verify-hs256", "regex-url-validation",
      "regex-password-strength", "sanitize-user-input", "python-post-json", "python-flask-health",
      "sql-select-join", "sql-create-index", "sql-pagination", "css-grid-autofit",
      "css-truncate-multiline", "html-semantic-layout", "html-accessible-form", "html-meta-seo",
      "tailwind-button-variants", "tailwind-dark-card", "react-use-fetch", "react-debounced-search",
      "typescript-zod-parse", "typescript-partial-required", "bash-curl-get-headers",
      "bash-curl-bearer-token", "bash-restore-postgres", "python-sleep-retry",
    ];
    const snippetPages = ["/snippets", ...snippetSlugs.map((s) => `/snippets/${s}`)];
    const learnPages = learnSitemapRoutes as string[];
    const templatePages = templatesSitemapRoutes as string[];
    const interviewPages = [
      "/interview",
      "/interview/javascript",
      "/interview/python",
      "/interview/sql",
      "/interview/react",
      "/interview/typescript",
      "/interview/nodejs",
      "/interview/system-design-basics",
      "/interview/qa-behavioral",
    ];
    const ideSlugs = [
      "vscode", "cursor", "zed", "sublime-text", "visual-studio",
      "intellij-idea", "pycharm", "webstorm", "neovim", "android-studio", "xcode",
    ];
    const idePages = ["/ides", ...ideSlugs.map((s) => `/ides/${s}`)];
    const platformPages = [
      "/ai",
      "/ai/chat",
      "/ai/debug",
      "/ai/explain",
      "/ai/convert",
      "/playground",
      "/playground/html-css-js",
      "/playground/python",
      "/playground/sql",
      "/roadmaps",
      "/roadmaps/generator",
      "/challenges",
      "/challenges/leaderboard",
      "/jobs",
      "/community",
    ];
    const hubPages = [
      "/resources",
      ...idePages,
      ...refPages,
      ...snippetPages,
      ...learnPages,
      ...templatePages,
      ...interviewPages,
      ...platformPages,
    ];
    const staticPages = [
      "",
      "/about",
      "/developer",
      "/contact",
      "/privacy",
      "/terms",
      "/disclaimer",
      "/cookie-policy",
      "/search",
      ...toolPages,
      ...hubPages,
    ];

    type UrlEntry = { loc: string; priority: string; lastmod?: string };

    const urls: UrlEntry[] = [
      ...staticPages.map((p) => ({
        loc: `${site}${p || "/"}`,
        priority: p === "" ? "1.0" : "0.7",
        lastmod: today,
      })),
      ...categories.map((c) => ({
        loc: `${site}/category/${c.slug}`,
        priority: "0.8",
        lastmod: today,
      })),
      ...posts.map((p) => ({
        loc: `${site}/post/${p.slug}`,
        priority: "0.9",
        lastmod: isoDate(p.updatedAt as Date),
      })),
      ...[...tagLastmod.entries()].map(([slug, lastmod]) => ({
        loc: `${site}/tag/${slug}`,
        priority: "0.75",
        lastmod,
      })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

      return xml;
    });

    res.type("application/xml").send(xml);
  } catch (err) {
    req.log.error({ err }, "Failed to generate sitemap.xml");
    res.status(500).send("Error");
  }
});

router.get("/feed.xml", cachePublic(1800), async (req, res) => {
  try {
    const site = getSiteUrl();
    const posts = await cached("seo:feed-posts", 30 * 60_000, async () =>
      db
        .select({
          title: postsTable.title,
          slug: postsTable.slug,
          excerpt: postsTable.excerpt,
          createdAt: postsTable.createdAt,
        })
        .from(postsTable)
        .where(publishedVisibleCondition())
        .orderBy(desc(postsTable.createdAt))
        .limit(50),
    );

    if (wantsFeedHtml(req)) {
      return res.type("text/html").send(renderFeedHtml(site, posts));
    }

    const items = posts
      .map(
        (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site}/post/${p.slug}</link>
      <guid>${site}/post/${p.slug}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt ?? ""}]]></description>
    </item>`,
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${site}</link>
    <description>${SITE_NAME} — developer knowledge hub</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

    res.type("application/xml").send(xml);
  } catch (err) {
    req.log.error({ err }, "Failed to generate feed.xml");
    res.status(500).send("Error");
  }
});

export default router;
