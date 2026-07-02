import pg from "pg";
import { randomBytes } from "node:crypto";

const { Pool } = pg;

let pool = null;

const JOB_SOURCES = [
  { id: "remoteok", label: "RemoteOK", description: "Remote developer jobs", region: "global", requiresKey: false },
  { id: "remotive", label: "Remotive", description: "Tech and startup jobs", region: "global", requiresKey: false },
  {
    id: "arbeitnow",
    label: "Arbeitnow",
    description: "European opportunities (German listings — use Translate on job page)",
    region: "europe",
    requiresKey: false,
    hiddenByDefault: true,
  },
  { id: "themuse", label: "The Muse", description: "Company profiles & roles", region: "global", requiresKey: false },
  { id: "jooble", label: "Jooble", description: "Pakistan IT jobs (Jooble)", region: "pakistan", requiresKey: true },
  { id: "everjobs", label: "Ever Jobs", description: "160+ sources worldwide", region: "global", requiresKey: true },
];

const PUBLISHED = `p.status = 'published' AND (p.publish_at IS NULL OR p.publish_at <= NOW())`;

const POST_LIST_SELECT = `
  p.id, p.title, p.slug, p.excerpt, p.featured_image AS "featuredImage",
  p.status, p.is_featured AS "isFeatured", p.tags, p.publish_at AS "publishAt",
  p.category_id AS "categoryId", p.seo_title AS "seoTitle",
  p.meta_description AS "metaDescription", p.views, p.reading_time AS "readingTime",
  p.created_at AS "createdAt", p.updated_at AS "updatedAt",
  c.name AS "categoryName", c.slug AS "categorySlug"
`;

const POST_DETAIL_SELECT = `${POST_LIST_SELECT}, p.content`;

function getPool() {
  if (pool) return pool;
  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL (or DATABASE_POOLER_URL) is not set");
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 8_000,
    allowExitOnIdle: true,
  });
  pool.on("error", (err) => console.error("[fast-routes] pool error:", err.message));
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

function setCache(res, maxAge = 120) {
  res.setHeader(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${maxAge * 2}, stale-while-revalidate=300`,
  );
}

function setNoCache(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function parseCookies(req) {
  const cookies = {};
  const header = req.headers?.cookie || "";
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    cookies[trimmed.slice(0, eq)] = decodeURIComponent(trimmed.slice(eq + 1));
  }
  return cookies;
}

function parseQuery(rawUrl) {
  const q = {};
  const idx = (rawUrl ?? "").indexOf("?");
  if (idx === -1) return q;
  for (const part of rawUrl.slice(idx + 1).split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
    const v = decodeURIComponent(eq === -1 ? "" : part.slice(eq + 1));
    q[k] = v;
  }
  return q;
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function formatPost(row, includeContent = false) {
  const out = {
    ...row,
    tags: row.tags ?? [],
    publishAt: row.publishAt ? new Date(row.publishAt).toISOString() : null,
    categoryName: row.categoryName ?? null,
    categorySlug: row.categorySlug ?? null,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
  if (!includeContent) delete out.content;
  return out;
}

function toIso(val) {
  if (val == null) return null;
  const d = val instanceof Date ? val : new Date(val);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatJob(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    company: row.company,
    description: row.description,
    requirements: row.requirements ?? "",
    location: row.location ?? "Remote",
    remote: row.remote ?? true,
    salaryRange: row.salaryRange ?? null,
    category: row.category,
    applyUrl: row.applyUrl,
    source: row.source ?? null,
    externalId: row.externalId ?? null,
    region: row.region ?? "global",
    isActive: row.isActive ?? true,
    expiresAt: toIso(row.expiresAt),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

const JOB_SELECT = `
  j.id, j.slug, j.title, j.company, j.description, j.requirements,
  j.location, j.remote, j.salary_range AS "salaryRange", j.category,
  j.apply_url AS "applyUrl", j.source, j.external_id AS "externalId",
  j.region, j.is_active AS "isActive", j.expires_at AS "expiresAt",
  j.created_at AS "createdAt", j.updated_at AS "updatedAt"
`;

function envConfigured(...keys) {
  return keys.some((k) => Boolean(process.env[k]?.trim()));
}

function handleAiStatus(res) {
  setCache(res, 300);
  const providers = [];
  if (envConfigured("GROQ_API_KEY")) {
    providers.push({ name: "groq", model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile" });
  }
  if (envConfigured("GEMINI_API_KEY")) {
    providers.push({ name: "gemini", model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash" });
  }
  if (envConfigured("OPENAI_API_KEY")) {
    providers.push({ name: "openai", model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini" });
  }
  if (envConfigured("DEEPSEEK_API_KEY")) {
    providers.push({ name: "deepseek", model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat" });
  }
  if (envConfigured("ZAI_GLM_47_FLASH_KEY", "ZAI_GLM_45_FLASH_KEY", "ZAI_GLM_46V_FLASH_KEY")) {
    providers.push({ name: "zai", model: process.env.ZAI_GLM_47_FLASH_MODEL?.trim() || "glm-4.7-flash" });
  }
  if (envConfigured("NVIDIA_API_KEY", "NVIDIA_CHAT_KEY")) {
    providers.push({
      name: "nvidia",
      model: process.env.NVIDIA_CHAT_MODEL?.trim() || "qwen/qwen3-next-80b-a3b-instruct",
    });
  }
  if (envConfigured("OLLAMA_API_KEY")) {
    providers.push({ name: "ollama", model: process.env.OLLAMA_MODEL?.trim() || "gemma3:4b" });
  }
  sendJson(res, 200, {
    configured: providers.length > 0,
    provider: providers[0]?.name ?? "none",
    providers,
    models: providers.map((p) => ({ id: p.model, label: p.model, provider: p.name })),
  });
}

async function handleAiConversations(req, res) {
  setNoCache(res);
  const visitorId = parseCookies(req).visitor_id;
  if (!visitorId || visitorId.length < 8) {
    sendJson(res, 200, []);
    return;
  }
  const q = parseQuery(req.url);
  const params = [visitorId];
  let sql = `
    SELECT id, visitor_id AS "visitorId", title, mode, created_at AS "createdAt", updated_at AS "updatedAt"
    FROM ai_conversations WHERE visitor_id = $1`;
  if (q.mode?.trim()) {
    sql += ` AND mode = $2`;
    params.push(q.mode.trim());
  }
  sql += ` ORDER BY updated_at DESC LIMIT 50`;
  const { rows } = await query(sql, params);
  sendJson(
    res,
    200,
    rows.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    })),
  );
}

async function handleCategories(res) {
  setCache(res, 300);
  const { rows } = await query(`
    SELECT c.id, c.name, c.slug, c.description, c.created_at AS "createdAt",
           COUNT(p.id)::int AS "postCount"
    FROM categories c
    LEFT JOIN posts p ON p.category_id = c.id
    GROUP BY c.id, c.name, c.slug, c.description, c.created_at
    ORDER BY c.name
  `);
  sendJson(
    res,
    200,
    rows.map((r) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() })),
  );
}

async function handleHomeFeed(res) {
  setCache(res, 120);
  const baseFrom = `
    FROM posts p LEFT JOIN categories c ON c.id = p.category_id WHERE ${PUBLISHED}`;
  const [featured, recent, popular] = await Promise.all([
    query(`SELECT ${POST_LIST_SELECT} ${baseFrom} AND p.is_featured = true ORDER BY p.created_at DESC LIMIT 4`),
    query(`SELECT ${POST_LIST_SELECT} ${baseFrom} ORDER BY p.created_at DESC LIMIT 6`),
    query(`SELECT ${POST_LIST_SELECT} ${baseFrom} ORDER BY p.views DESC, p.created_at DESC LIMIT 6`),
  ]);
  const featuredRows = featured.rows.length > 0 ? featured.rows : recent.rows.slice(0, 4);
  sendJson(res, 200, {
    featured: featuredRows.map((r) => formatPost(r)),
    recent: recent.rows.map((r) => formatPost(r)),
    popular: popular.rows.map((r) => formatPost(r)),
  });
}

async function handlePostsList(req, res) {
  setCache(res, 120);
  const q = parseQuery(req.url);
  const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
  const limitNum = Math.min(50, parseInt(q.limit || "10", 10) || 10);
  const offset = (pageNum - 1) * limitNum;
  const params = [];
  const conditions = [PUBLISHED.replace(/\bp\./g, "p.")];
  let paramIdx = 1;

  if (q.status === "published" || !q.status) {
    // already in PUBLISHED
  } else if (q.status && q.status !== "all") {
    conditions[0] = `p.status = $${paramIdx++}`;
    params.push(q.status);
  }

  if (q.category) {
    conditions.push(`c.slug = $${paramIdx++}`);
    params.push(q.category);
  }
  if (q.search) {
    conditions.push(
      `(p.title ILIKE $${paramIdx} OR p.excerpt ILIKE $${paramIdx} OR p.content ILIKE $${paramIdx})`,
    );
    params.push(`%${q.search}%`);
    paramIdx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows, countRows] = await Promise.all([
    query(
      `SELECT ${POST_LIST_SELECT} FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id
       ${where} ORDER BY p.created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limitNum, offset],
    ),
    query(
      `SELECT COUNT(*)::int AS count FROM posts p
       LEFT JOIN categories c ON c.id = p.category_id ${where}`,
      params,
    ),
  ]);
  sendJson(res, 200, {
    posts: rows.rows.map((r) => formatPost(r)),
    total: countRows.rows[0]?.count ?? 0,
    page: pageNum,
    limit: limitNum,
  });
}

async function handlePostBySlug(res, slug) {
  setCache(res, 300);
  const { rows } = await query(
    `SELECT ${POST_DETAIL_SELECT} FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = $1 AND ${PUBLISHED} LIMIT 1`,
    [slug],
  );
  if (!rows[0]) {
    sendJson(res, 404, { error: "Post not found" });
    return;
  }
  sendJson(res, 200, formatPost(rows[0], true));
}

async function handleRelatedPosts(req, res, slug) {
  setCache(res, 300);
  const q = parseQuery(req.url);
  const limitNum = Math.min(6, parseInt(q.limit || "3", 10) || 3);
  const { rows: posts } = await query(
    `SELECT p.id, p.category_id AS "categoryId" FROM posts p
     WHERE p.slug = $1 AND ${PUBLISHED} LIMIT 1`,
    [slug],
  );
  if (!posts[0]) {
    sendJson(res, 404, { error: "Post not found" });
    return;
  }
  const post = posts[0];
  const params = [post.id];
  let categoryClause = "";
  if (post.categoryId) {
    categoryClause = ` AND p.category_id = $2`;
    params.push(post.categoryId);
  }
  params.push(limitNum);
  const limitParam = `$${params.length}`;
  const { rows } = await query(
    `SELECT ${POST_LIST_SELECT} FROM posts p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${PUBLISHED} AND p.id != $1${categoryClause}
     ORDER BY p.created_at DESC LIMIT ${limitParam}`,
    params,
  );
  sendJson(res, 200, rows.map((r) => formatPost(r)));
}

async function handleJobs(req, res) {
  setCache(res, 120);
  const q = parseQuery(req.url);
  const pageNum = Math.max(1, parseInt(q.page || "1", 10) || 1);
  const limitNum = Math.min(200, Math.max(1, parseInt(q.limit || "50", 10) || 50));
  const offset = (pageNum - 1) * limitNum;
  const params = [];
  let paramIdx = 1;
  const conditions = [
    "j.is_active = true",
    "(j.expires_at IS NULL OR j.expires_at >= NOW())",
  ];

  if (q.category) {
    conditions.push(`j.category = $${paramIdx++}`);
    params.push(q.category);
  }
  if (q.source) {
    conditions.push(`j.source = $${paramIdx++}`);
    params.push(q.source);
  } else {
    conditions.push(`(j.source IS NULL OR j.source NOT IN ('arbeitnow'))`);
  }
  if (q.remote === "true") {
    conditions.push("j.remote = true");
  }
  if (q.search) {
    conditions.push(
      `(j.title ILIKE $${paramIdx} OR j.company ILIKE $${paramIdx} OR j.description ILIKE $${paramIdx})`,
    );
    params.push(`%${q.search}%`);
    paramIdx++;
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const [rows, countRows] = await Promise.all([
    query(
      `SELECT ${JOB_SELECT} FROM jobs j ${where} ORDER BY j.updated_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limitNum, offset],
    ),
    query(`SELECT COUNT(*)::int AS count FROM jobs j ${where}`, params),
  ]);
  sendJson(res, 200, {
    jobs: rows.rows.map(formatJob),
    total: countRows.rows[0]?.count ?? 0,
    page: pageNum,
    limit: limitNum,
  });
}

function handleJobSources(res) {
  setCache(res, 3600);
  sendJson(res, 200, JOB_SOURCES);
}

async function handleNewsletterSubscribe(req, res) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    sendJson(res, 400, { error: "Email is required" });
    return;
  }
  const name = body.name?.trim() || null;
  const confirmToken = randomBytes(32).toString("hex");
  const unsubscribeToken = randomBytes(32).toString("hex");

  const existing = await query(
    `SELECT id, status, name FROM newsletter_subscribers WHERE email = $1 LIMIT 1`,
    [email],
  );
  if (existing.rows[0]?.status === "confirmed") {
    sendJson(res, 200, { message: "You're already subscribed!", status: "confirmed" });
    return;
  }
  if (existing.rows[0]) {
    await query(
      `UPDATE newsletter_subscribers SET confirm_token = $1, status = 'pending', name = COALESCE($2, name) WHERE email = $3`,
      [confirmToken, name, email],
    );
  } else {
    await query(
      `INSERT INTO newsletter_subscribers (email, name, status, confirm_token, unsubscribe_token)
       VALUES ($1, $2, 'pending', $3, $4)`,
      [email, name, confirmToken, unsubscribeToken],
    );
  }
  sendJson(res, 200, {
    message: "Check your email to confirm your subscription.",
    status: "pending",
  });
}

async function fetchJson(url, timeoutMs = 6_000) {
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "devblog-platform/1.0" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function handleDevHeadlines(req, res) {
  setCache(res, 600);
  const q = parseQuery(req.url);
  const limit = Math.min(Number(q.limit ?? 8), 20);
  const perSource = Math.ceil(limit / 2);
  const items = [];
  try {
    const ids = await fetchJson("https://hacker-news.firebaseio.com/v0/topstories.json");
    const hnResults = await Promise.allSettled(
      ids.slice(0, perSource).map(async (id) => {
        const item = await fetchJson(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!item?.title) return null;
        return {
          id: `hn-${id}`,
          title: item.title,
          url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
          source: "hackernews",
          score: item.score,
          comments: item.descendants,
          author: item.by,
        };
      }),
    );
    for (const r of hnResults) {
      if (r.status === "fulfilled" && r.value) items.push(r.value);
    }
  } catch (err) {
    console.warn("[fast-routes] HN fetch failed:", err.message);
  }
  try {
    const devto = await fetchJson(`https://dev.to/api/articles?per_page=${perSource}`);
    for (const a of devto) {
      items.push({
        id: `devto-${a.id}`,
        title: a.title,
        url: a.url,
        source: "devto",
        score: a.positive_reactions_count,
        comments: a.comments_count,
        author: a.user?.username,
      });
    }
  } catch (err) {
    console.warn("[fast-routes] Dev.to fetch failed:", err.message);
  }
  sendJson(res, 200, { items: items.slice(0, limit) });
}

function handleUserMe(res) {
  setNoCache(res);
  sendJson(res, 200, { authenticated: false, user: null });
}

/** Public routes — raw pg/fetch, no 2.5MB bundle. Returns true when handled. */
export async function tryFastRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();

  try {
    if (method === "GET" && path === "/api/categories") {
      await handleCategories(res);
      return true;
    }
    if (method === "GET" && path === "/api/posts/home-feed") {
      await handleHomeFeed(res);
      return true;
    }
    if (method === "GET" && path.startsWith("/api/feeds/dev-headlines")) {
      await handleDevHeadlines(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/auth/user/me" && !parseCookies(req)["connect.sid"]) {
      handleUserMe(res);
      return true;
    }
    if (method === "GET" && path === "/api/ai/status") {
      handleAiStatus(res);
      return true;
    }
    if (method === "GET" && path === "/api/ai/conversations") {
      await handleAiConversations(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/jobs/sources") {
      handleJobSources(res);
      return true;
    }
    if (method === "GET" && path === "/api/jobs") {
      await handleJobs(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/posts") {
      const q = parseQuery(req.url);
      if (q.status === "all") return false;
      await handlePostsList(req, res);
      return true;
    }
    if (method === "GET") {
      const relatedMatch = path.match(/^\/api\/posts\/slug\/([^/]+)\/related$/);
      if (relatedMatch) {
        await handleRelatedPosts(req, res, decodeURIComponent(relatedMatch[1]));
        return true;
      }
      const slugMatch = path.match(/^\/api\/posts\/slug\/([^/]+)$/);
      if (slugMatch) {
        await handlePostBySlug(res, decodeURIComponent(slugMatch[1]));
        return true;
      }
    }
    if (method === "POST" && path === "/api/newsletter/subscribe") {
      await handleNewsletterSubscribe(req, res);
      return true;
    }
    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fast-routes]", method, path, message);
    sendJson(res, 503, { error: "Service temporarily unavailable", detail: message });
    return true;
  }
}

/** True for /api/ai/* routes that need the AI bundle (chat, stream, etc.). */
export function isAiBundlePath(path, method) {
  if (!path.startsWith("/api/ai/")) return false;
  if (path === "/api/ai/status" || path === "/api/ai/conversations") return false;
  return true;
}

export function isFastRoutePath(path, req) {
  if (isAiBundlePath(path, req.method)) return false;
  // Heuristic — tryFastRoute does exact matching
  const method = (req.method || "GET").toUpperCase();
  if (method === "GET" && path === "/api/categories") return true;
  if (method === "GET" && path === "/api/posts/home-feed") return true;
  if (method === "GET" && path.startsWith("/api/feeds/dev-headlines")) return true;
  if (method === "GET" && path === "/api/auth/user/me") return true;
  if (method === "GET" && path === "/api/ai/status") return true;
  if (method === "GET" && path === "/api/ai/conversations") return true;
  if (method === "GET" && path === "/api/jobs/sources") return true;
  if (method === "GET" && path === "/api/jobs") return true;
  if (method === "GET" && path === "/api/posts") return true;
  if (method === "GET" && /^\/api\/posts\/slug\/[^/]+(\/related)?$/.test(path)) return true;
  if (method === "POST" && path === "/api/newsletter/subscribe") return true;
  return false;
}
