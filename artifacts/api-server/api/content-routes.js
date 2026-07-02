import { query } from "./db-pool.js";
import {
  envConfigured,
  getSiteUrl,
  parseQuery,
  readJsonBody,
  sendJson,
  sendText,
  setCache,
  setNoCache,
  routeError,
} from "./route-utils.js";

const PUBLISHED = `p.status = 'published' AND (p.publish_at IS NULL OR p.publish_at <= NOW())`;

const STATIC_SITEMAP_PATHS = [
  "/",
  "/search",
  "/about",
  "/developer",
  "/contact",
  "/privacy",
  "/terms",
  "/templates",
  "/tools",
  "/learn",
  "/refs",
  "/snippets",
  "/interview",
  "/ai",
  "/playground",
  "/roadmaps",
  "/challenges",
  "/jobs",
  "/api-sources",
  "/community",
  "/resources",
];
const POST_LIST_SELECT = `
  p.id, p.title, p.slug, p.excerpt, p.featured_image AS "featuredImage",
  p.status, p.is_featured AS "isFeatured", p.tags, p.publish_at AS "publishAt",
  p.category_id AS "categoryId", p.seo_title AS "seoTitle",
  p.meta_description AS "metaDescription", p.views, p.reading_time AS "readingTime",
  p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  c.name AS "categoryName", c.slug AS "categorySlug"
`;

function formatPost(row) {
  return {
    ...row,
    tags: row.tags ?? [],
    publishAt: row.publishAt ? new Date(row.publishAt).toISOString() : null,
    categoryName: row.categoryName ?? null,
    categorySlug: row.categorySlug ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

async function handleFeaturedPosts(req, res) {
  setCache(res, 120);
  const q = parseQuery(req.url);
  const limitNum = Math.min(20, parseInt(q.limit || "6", 10) || 6);
  let { rows } = await query(
    `SELECT ${POST_LIST_SELECT} FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${PUBLISHED} AND p.is_featured = true ORDER BY p.created_at DESC LIMIT $1`,
    [limitNum],
  );
  if (rows.length === 0) {
    ({ rows } = await query(
      `SELECT ${POST_LIST_SELECT} FROM posts p LEFT JOIN categories c ON c.id = p.category_id
       WHERE ${PUBLISHED} ORDER BY p.created_at DESC LIMIT $1`,
      [limitNum],
    ));
  }
  sendJson(res, 200, rows.map(formatPost));
}

async function handleTags(res) {
  setCache(res, 300);
  const { rows } = await query(`SELECT tags FROM posts p WHERE ${PUBLISHED}`);
  const tagSet = new Map();
  for (const row of rows) {
    for (const t of row.tags ?? []) {
      const trimmed = String(t).trim();
      if (!trimmed) continue;
      const slug = trimmed.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
      if (slug) tagSet.set(slug, trimmed);
    }
  }
  sendJson(
    res,
    200,
    [...tagSet.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name)),
  );
}

async function handlePostView(req, res, idStr) {
  setNoCache(res);
  const id = parseInt(idStr, 10);
  const { rows } = await query(`UPDATE posts SET views = views + 1 WHERE id = $1 RETURNING views`, [id]);
  sendJson(res, 200, { views: rows[0]?.views ?? 0 });
}

async function handleCategoryBySlug(res, slug) {
  setCache(res, 300);
  const { rows } = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.created_at AS "createdAt",
            COUNT(p.id)::int AS "postCount"
     FROM categories c LEFT JOIN posts p ON p.category_id = c.id
     WHERE c.slug = $1 GROUP BY c.id, c.name, c.slug, c.description, c.created_at LIMIT 1`,
    [slug],
  );
  if (!rows[0]) {
    sendJson(res, 404, { error: "Category not found" });
    return;
  }
  sendJson(res, 200, { ...rows[0], createdAt: new Date(rows[0].createdAt).toISOString() });
}

async function handleCategoryById(res, idStr) {
  setCache(res, 300);
  const id = parseInt(idStr, 10);
  const { rows } = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.created_at AS "createdAt",
            COUNT(p.id)::int AS "postCount"
     FROM categories c LEFT JOIN posts p ON p.category_id = c.id
     WHERE c.id = $1 GROUP BY c.id, c.name, c.slug, c.description, c.created_at LIMIT 1`,
    [id],
  );
  if (!rows[0]) {
    sendJson(res, 404, { error: "Category not found" });
    return;
  }
  sendJson(res, 200, { ...rows[0], createdAt: new Date(rows[0].createdAt).toISOString() });
}

async function handleCommentsList(req, res) {
  setNoCache(res);
  const q = parseQuery(req.url);
  if (q.postId === undefined) return false;
  const postId = parseInt(q.postId, 10);
  if (!Number.isFinite(postId)) {
    sendJson(res, 400, { error: "Invalid postId" });
    return true;
  }
  const { rows } = await query(
    `SELECT id, post_id AS "postId", author_name AS "authorName", author_email AS "authorEmail",
            content, admin_reply AS "adminReply", admin_replied_at AS "adminRepliedAt", created_at AS "createdAt"
     FROM comments WHERE post_id = $1 ORDER BY created_at ASC`,
    [postId],
  );
  sendJson(
    res,
    200,
    rows.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt).toISOString(),
      adminRepliedAt: r.adminRepliedAt ? new Date(r.adminRepliedAt).toISOString() : null,
    })),
  );
  return true;
}

async function handleCreateComment(req, res) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const { postId, authorName, authorEmail, content } = body;
  if (!postId || !authorName || !content) {
    sendJson(res, 400, { error: "Missing required fields" });
    return;
  }
  const { rows } = await query(
    `INSERT INTO comments (post_id, author_name, author_email, content)
     VALUES ($1, $2, $3, $4)
     RETURNING id, post_id AS "postId", author_name AS "authorName", author_email AS "authorEmail",
               content, admin_reply AS "adminReply", admin_replied_at AS "adminRepliedAt", created_at AS "createdAt"`,
    [postId, authorName, authorEmail ?? null, content],
  );
  const r = rows[0];
  sendJson(res, 201, {
    ...r,
    createdAt: new Date(r.createdAt).toISOString(),
    adminRepliedAt: null,
  });
}

async function handleNewsletterConfirm(req, res) {
  setNoCache(res);
  const q = parseQuery(req.url);
  const token = q.token?.trim();
  if (!token) {
    sendJson(res, 400, { error: "Token required" });
    return;
  }
  const { rows } = await query(
    `UPDATE newsletter_subscribers SET status = 'confirmed', confirmed_at = NOW()
     WHERE confirm_token = $1 RETURNING email`,
    [token],
  );
  if (!rows[0]) {
    sendJson(res, 400, { error: "Invalid or expired confirmation link" });
    return;
  }
  sendJson(res, 200, { message: "Subscription confirmed!", email: rows[0].email });
}

async function handleNewsletterUnsubscribe(req, res) {
  setNoCache(res);
  const q = parseQuery(req.url);
  const token = q.token?.trim();
  if (!token) {
    sendJson(res, 400, { error: "Token required" });
    return;
  }
  await query(`UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = $1`, [token]);
  sendJson(res, 200, { message: "You have been unsubscribed." });
}

async function handleContact(req, res) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const { name, email, message } = body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    sendJson(res, 400, { error: "Name, email, and message are required" });
    return;
  }
  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)
     RETURNING id, created_at AS "createdAt"`,
    [name.trim(), email.trim(), message.trim()],
  );
  sendJson(res, 201, { id: rows[0].id, success: true, createdAt: new Date(rows[0].createdAt).toISOString() });
}

function handleIntegrationsStatus(res) {
  setCache(res, 300);
  const items = [
    { id: "groq", name: "Groq", configured: envConfigured("GROQ_API_KEY") },
    { id: "gemini", name: "Google Gemini", configured: envConfigured("GEMINI_API_KEY") },
    { id: "openai", name: "OpenAI", configured: envConfigured("OPENAI_API_KEY") },
    { id: "zai", name: "Z.ai GLM", configured: envConfigured("ZAI_API_KEY", "ZAI_GLM_47_FLASH_KEY") },
    { id: "nvidia", name: "NVIDIA NIM", configured: envConfigured("NVIDIA_API_KEY", "NVIDIA_CHAT_KEY") },
    { id: "resend", name: "Resend", configured: envConfigured("RESEND_API_KEY") },
    { id: "github-oauth", name: "GitHub OAuth", configured: envConfigured("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET") },
    { id: "mymemory", name: "MyMemory", configured: true },
    { id: "hackernews", name: "Hacker News", configured: true },
    { id: "devto", name: "Dev.to", configured: true },
  ];
  sendJson(res, 200, {
    total: items.length,
    configured: items.filter((i) => i.configured).length,
    aiProvider: items.find((i) => i.configured && ["groq", "gemini", "openai", "zai"].includes(i.id))?.id ?? "none",
    kv: envConfigured("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL") ? "upstash" : "memory",
    items,
  });
}

async function handleRobots(res) {
  setCache(res, 86400);
  const site = getSiteUrl();
  sendText(res, 200, `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`);
}

async function handleSitemap(res) {
  setCache(res, 3600);
  const site = getSiteUrl();
  const today = new Date().toISOString().split("T")[0];
  const [posts, categories] = await Promise.all([
    query(
      `SELECT slug, updated_at AS "updatedAt" FROM posts p WHERE ${PUBLISHED} ORDER BY p.updated_at DESC LIMIT 500`,
    ),
    query(`SELECT slug FROM categories ORDER BY name`),
  ]);
  const urls = STATIC_SITEMAP_PATHS.map((path) => ({
    loc: `${site}${path === "/" ? "/" : path}`,
    lastmod: today,
  }));
  for (const p of posts.rows) {
    urls.push({
      loc: `${site}/post/${p.slug}`,
      lastmod: new Date(p.updatedAt).toISOString().split("T")[0],
    });
  }
  for (const c of categories.rows) {
    urls.push({ loc: `${site}/category/${c.slug}`, lastmod: today });
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`)
    .join("\n")}\n</urlset>`;
  sendText(res, 200, xml, "application/xml; charset=utf-8");
}

async function handleFeed(res) {
  setCache(res, 1800);
  const site = getSiteUrl();
  const { rows } = await query(
    `SELECT p.title, p.slug, p.excerpt, p.created_at AS "createdAt", c.name AS "categoryName"
     FROM posts p LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${PUBLISHED} ORDER BY p.created_at DESC LIMIT 20`,
  );
  const items = rows
    .map(
      (p) => `<item>
  <title>${escapeXml(p.title)}</title>
  <link>${site}/post/${p.slug}</link>
  <guid>${site}/post/${p.slug}</guid>
  <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
  <description>${escapeXml(p.excerpt ?? "")}</description>
</item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>TechVentry</title>\n<link>${site}</link>\n<description>Developer blog and resources</description>\n${items}\n</channel>\n</rss>`;
  sendText(res, 200, xml, "application/rss+xml; charset=utf-8");
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isContentRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/posts/featured" && m === "GET") return true;
  if (path === "/api/tags" && m === "GET") return true;
  if (path === "/api/contact" && m === "POST") return true;
  if (path === "/api/integrations/status" && m === "GET") return true;
  if (path === "/api/newsletter/confirm" && m === "GET") return true;
  if (path === "/api/newsletter/unsubscribe" && m === "GET") return true;
  if (path === "/api/robots.txt" && m === "GET") return true;
  if (path === "/api/sitemap.xml" && m === "GET") return true;
  if (path === "/api/sitemap" && m === "GET") return true;
  if (path === "/api/feed.xml" && m === "GET") return true;
  if (path === "/api/comments" && (m === "GET" || m === "POST")) return true;
  if (/^\/api\/posts\/\d+\/view$/.test(path) && m === "POST") return true;
  if (/^\/api\/categories\/slug\/[^/]+$/.test(path) && m === "GET") return true;
  if (/^\/api\/categories\/\d+$/.test(path) && m === "GET") return true;
  return false;
}

export async function tryContentRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();
  try {
    if (method === "GET" && path === "/api/posts/featured") {
      await handleFeaturedPosts(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/tags") {
      await handleTags(res);
      return true;
    }
    if (method === "POST" && path === "/api/contact") {
      await handleContact(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/integrations/status") {
      handleIntegrationsStatus(res);
      return true;
    }
    if (method === "GET" && path === "/api/newsletter/confirm") {
      await handleNewsletterConfirm(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/newsletter/unsubscribe") {
      await handleNewsletterUnsubscribe(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/robots.txt") {
      await handleRobots(res);
      return true;
    }
    if (method === "GET" && (path === "/api/sitemap.xml" || path === "/api/sitemap")) {
      await handleSitemap(res);
      return true;
    }
    if (method === "GET" && path === "/api/feed.xml") {
      await handleFeed(res);
      return true;
    }
    if (method === "GET" && path === "/api/comments") {
      return await handleCommentsList(req, res);
    }
    if (method === "POST" && path === "/api/comments") {
      await handleCreateComment(req, res);
      return true;
    }
    const viewMatch = path.match(/^\/api\/posts\/(\d+)\/view$/);
    if (method === "POST" && viewMatch) {
      await handlePostView(req, res, viewMatch[1]);
      return true;
    }
    const catSlugMatch = path.match(/^\/api\/categories\/slug\/([^/]+)$/);
    if (method === "GET" && catSlugMatch) {
      await handleCategoryBySlug(res, decodeURIComponent(catSlugMatch[1]));
      return true;
    }
    const catIdMatch = path.match(/^\/api\/categories\/(\d+)$/);
    if (method === "GET" && catIdMatch) {
      await handleCategoryById(res, catIdMatch[1]);
      return true;
    }
    return false;
  } catch (err) {
    routeError(res, err, "[content-routes]");
    return true;
  }
}
