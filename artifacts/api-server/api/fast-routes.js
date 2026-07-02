import pg from "pg";

const { Pool } = pg;

let pool = null;

function getPool() {
  if (pool) return pool;
  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL (or DATABASE_POOLER_URL) is not set");
  }
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 8_000,
    allowExitOnIdle: true,
  });
  pool.on("error", (err) => {
    console.error("[fast-routes] pool error:", err.message);
  });
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
  res.setHeader("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge * 2}, stale-while-revalidate=300`);
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

const PUBLISHED = `p.status = 'published' AND (p.publish_at IS NULL OR p.publish_at <= NOW())`;

const POST_SELECT = `
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
    FROM posts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE ${PUBLISHED}
  `;

  const [featured, recent, popular] = await Promise.all([
    query(
      `SELECT ${POST_SELECT} ${baseFrom} AND p.is_featured = true ORDER BY p.created_at DESC LIMIT 4`,
    ),
    query(`SELECT ${POST_SELECT} ${baseFrom} ORDER BY p.created_at DESC LIMIT 6`),
    query(`SELECT ${POST_SELECT} ${baseFrom} ORDER BY p.views DESC, p.created_at DESC LIMIT 6`),
  ]);

  let featuredRows = featured.rows;
  if (featuredRows.length === 0) {
    featuredRows = recent.rows.slice(0, 4);
  }

  sendJson(res, 200, {
    featured: featuredRows.map(formatPost),
    recent: recent.rows.map(formatPost),
    popular: popular.rows.map(formatPost),
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
  const raw = req.url ?? "";
  const limitMatch = raw.match(/[?&]limit=(\d+)/);
  const limit = Math.min(Number(limitMatch?.[1] ?? 8), 20);
  const perSource = Math.ceil(limit / 2);
  const items = [];

  try {
    const ids = await fetchJson("https://hacker-news.firebaseio.com/v0/topstories.json");
    const top = ids.slice(0, perSource);
    const hnResults = await Promise.allSettled(
      top.map(async (id) => {
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

/** Routes served without loading the 2.5MB Express bundle. Returns true when handled. */
export async function tryFastRoute(path, req, res) {
  try {
    if (path === "/api/categories") {
      await handleCategories(res);
      return true;
    }
    if (path === "/api/posts/home-feed") {
      await handleHomeFeed(res);
      return true;
    }
    if (path.startsWith("/api/feeds/dev-headlines")) {
      await handleDevHeadlines(req, res);
      return true;
    }
    if (path === "/api/auth/user/me" && !String(req.headers?.cookie || "").includes("connect.sid")) {
      handleUserMe(res);
      return true;
    }
    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fast-routes]", path, message);
    sendJson(res, 503, { error: "Service temporarily unavailable", detail: message });
    return true;
  }
}
