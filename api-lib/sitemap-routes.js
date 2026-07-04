import learnSitemapRoutes from "./learn-sitemap-routes.json" with { type: "json" };
import templatesSitemapRoutes from "./templates-sitemap-routes.json" with { type: "json" };

const TOOL_PAGES = [
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

const REF_PAGES = [
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

const SNIPPET_SLUGS = [
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

const INTERVIEW_PAGES = [
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

const IDE_SLUGS = [
  "vscode", "cursor", "zed", "sublime-text", "visual-studio",
  "intellij-idea", "pycharm", "webstorm", "neovim", "android-studio", "xcode",
];

const PLATFORM_PAGES = [
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
  "/api-sources",
];

/** All indexable static paths (deduplicated). Matches artifacts/api-server/src/routes/seo.ts */
export function getStaticSitemapPaths() {
  const snippetPages = ["/snippets", ...SNIPPET_SLUGS.map((s) => `/snippets/${s}`)];
  const idePages = ["/ides", ...IDE_SLUGS.map((s) => `/ides/${s}`)];
  const hubPages = [
    "/resources",
    ...idePages,
    ...REF_PAGES,
    ...snippetPages,
    ...learnSitemapRoutes,
    ...templatesSitemapRoutes,
    ...INTERVIEW_PAGES,
    ...PLATFORM_PAGES,
  ];
  const staticPages = [
    "",
    "/about",
    "/developer",
    "/contact",
    "/privacy",
    "/terms",
    "/search",
    ...TOOL_PAGES,
    ...hubPages,
  ];

  return [...new Set(staticPages)];
}

export function slugifyTag(tag) {
  return tag.trim().toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

export function buildTagLastmodMap(tagRows) {
  const tagLastmod = new Map();
  for (const row of tagRows) {
    const lastmod = new Date(row.updatedAt).toISOString().split("T")[0];
    for (const t of row.tags ?? []) {
      const slug = slugifyTag(String(t));
      if (!slug) continue;
      const prev = tagLastmod.get(slug);
      if (!prev || lastmod > prev) tagLastmod.set(slug, lastmod);
    }
  }
  return tagLastmod;
}
