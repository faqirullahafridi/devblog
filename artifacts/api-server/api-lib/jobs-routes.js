import { query } from "./db-pool.js";
import {
  getVisitorId,
  parseQuery,
  readJsonBody,
  sendJson,
  setCache,
  setNoCache,
  toIso,
  routeError,
} from "./route-utils.js";

const JOB_SELECT = `
  j.id, j.slug, j.title, j.company, j.description, j.requirements,
  j.location, j.remote, j.salary_range AS "salaryRange", j.category,
  j.apply_url AS "applyUrl", j.source, j.external_id AS "externalId",
  j.region, j.is_active AS "isActive", j.expires_at AS "expiresAt",
  j.created_at AS "createdAt", j.updated_at AS "updatedAt"
`;

const JOB_CATEGORIES = [
  "frontend", "backend", "full-stack", "react", "nodejs", "django", "python", "qa", "devops", "remote",
];

const NON_ENGLISH_SOURCES = new Set(["arbeitnow"]);
const NON_ENGLISH_PATTERNS = [
  /\b(und|oder|mit|für|Sie|Ihre|Ihr|wir|unser|Entwickler|Entwicklerin|Stelle|Bewerbung|Deutschland|Berufserfahrung)\b/i,
  /\b(pour|avec|notre|vous|votre|poste|développeur|expérience|entreprise|français)\b/i,
];

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

function likelyNonEnglish(text, source) {
  if (!text?.trim()) return false;
  if (source && NON_ENGLISH_SOURCES.has(source)) return true;
  const nonAscii = (text.match(/[^\x00-\x7F]/g) || []).length;
  if (nonAscii / text.length > 0.025) return true;
  return NON_ENGLISH_PATTERNS.some((p) => p.test(text));
}

async function translateChunk(text, fromLang = "de") {
  const params = new URLSearchParams({ q: text.slice(0, 480), langpair: `${fromLang}|en` });
  const email = process.env.MYMEMORY_EMAIL?.trim();
  if (email) params.set("de", email);
  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Translation unavailable (${res.status})`);
  const data = await res.json();
  const translated = data.responseData?.translatedText?.trim();
  if (!translated || translated.includes("MYMEMORY WARNING")) {
    throw new Error("Translation limit reached or failed");
  }
  return translated;
}

async function handleJobBySlug(req, res, slug) {
  setCache(res, 120);
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(
    `SELECT ${JOB_SELECT} FROM jobs j WHERE j.slug = $1 AND j.is_active = true LIMIT 1`,
    [slug],
  );
  if (!rows[0]) {
    sendJson(res, 404, { error: "Job not found" });
    return;
  }
  const job = rows[0];
  const { rows: bookmarkRows } = await query(
    `SELECT id FROM job_bookmarks WHERE job_id = $1 AND visitor_id = $2 LIMIT 1`,
    [job.id, visitorId],
  );
  const relatedParams = [job.id, job.category];
  let relatedSql = `
    SELECT ${JOB_SELECT} FROM jobs j
    WHERE j.category = $2 AND j.is_active = true AND j.id != $1
      AND (j.expires_at IS NULL OR j.expires_at >= NOW())
      AND (j.source IS NULL OR j.source NOT IN ('arbeitnow'))
    ORDER BY j.created_at DESC LIMIT 4`;
  const { rows: related } = await query(relatedSql, relatedParams);
  sendJson(res, 200, {
    ...formatJob(job),
    bookmarked: bookmarkRows.length > 0,
    related: related.map(formatJob),
    mayNeedTranslation:
      likelyNonEnglish(job.description, job.source) || likelyNonEnglish(job.requirements, job.source),
  });
}

async function handleJobBookmark(req, res, slug) {
  setNoCache(res);
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(`SELECT id FROM jobs WHERE slug = $1 LIMIT 1`, [slug]);
  if (!rows[0]) {
    sendJson(res, 404, { error: "Job not found" });
    return;
  }
  const jobId = rows[0].id;
  const { rows: existing } = await query(
    `SELECT id FROM job_bookmarks WHERE job_id = $1 AND visitor_id = $2 LIMIT 1`,
    [jobId, visitorId],
  );
  if (existing[0]) {
    await query(`DELETE FROM job_bookmarks WHERE id = $1`, [existing[0].id]);
    sendJson(res, 200, { bookmarked: false });
    return;
  }
  await query(`INSERT INTO job_bookmarks (job_id, visitor_id) VALUES ($1, $2)`, [jobId, visitorId]);
  sendJson(res, 200, { bookmarked: true });
}

async function handleJobTranslate(req, res, slug) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const field = body.field === "requirements" ? "requirements" : "description";
  const { rows } = await query(
    `SELECT description, requirements, source FROM jobs WHERE slug = $1 AND is_active = true LIMIT 1`,
    [slug],
  );
  if (!rows[0]) {
    sendJson(res, 404, { error: "Job not found" });
    return;
  }
  const text = field === "requirements" ? rows[0].requirements : rows[0].description;
  if (!text?.trim()) {
    sendJson(res, 400, { error: "Nothing to translate" });
    return;
  }
  try {
    const translated = await translateChunk(text);
    sendJson(res, 200, { field, text: translated, translated: true });
  } catch (err) {
    sendJson(res, 503, { error: err instanceof Error ? err.message : "Translation failed" });
  }
}

async function handleJobCategories(res) {
  setCache(res, 3600);
  const { rows } = await query(`SELECT slug, name FROM job_categories ORDER BY name`);
  if (rows.length === 0) {
    sendJson(
      res,
      200,
      JOB_CATEGORIES.map((slug) => ({
        slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    );
    return;
  }
  sendJson(res, 200, rows);
}

async function handleJobBookmarks(req, res) {
  setNoCache(res);
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(
    `SELECT ${JOB_SELECT} FROM job_bookmarks b
     INNER JOIN jobs j ON j.id = b.job_id
     WHERE b.visitor_id = $1 ORDER BY b.created_at DESC`,
    [visitorId],
  );
  sendJson(res, 200, rows.map(formatJob));
}

async function handleJobsSyncCron(req, res) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers?.authorization;
    if (auth !== `Bearer ${secret}`) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
  } else if (process.env.NODE_ENV === "production") {
    sendJson(res, 503, { error: "CRON_SECRET not configured" });
    return;
  }
  sendJson(res, 200, { ok: true, message: "Job sync requires full bundle; configure external cron separately." });
}

export function isJobsRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/jobs/categories" && m === "GET") return true;
  if (path === "/api/jobs/me/bookmarks" && m === "GET") return true;
  if (path === "/api/jobs/sync/cron" && m === "GET") return true;
  if (/^\/api\/jobs\/[^/]+\/bookmark$/.test(path) && m === "POST") return true;
  if (/^\/api\/jobs\/[^/]+\/translate$/.test(path) && m === "POST") return true;
  if (/^\/api\/jobs\/[^/]+$/.test(path) && m === "GET") {
    if (path === "/api/jobs/sources" || path === "/api/jobs/categories" || path === "/api/jobs/admin") return false;
    if (path.startsWith("/api/jobs/me/") || path.startsWith("/api/jobs/sync")) return false;
    return true;
  }
  return false;
}

export async function tryJobsRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();
  try {
    if (method === "GET" && path === "/api/jobs/categories") {
      await handleJobCategories(res);
      return true;
    }
    if (method === "GET" && path === "/api/jobs/me/bookmarks") {
      await handleJobBookmarks(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/jobs/sync/cron") {
      await handleJobsSyncCron(req, res);
      return true;
    }
    const bookmarkMatch = path.match(/^\/api\/jobs\/([^/]+)\/bookmark$/);
    if (method === "POST" && bookmarkMatch) {
      await handleJobBookmark(req, res, decodeURIComponent(bookmarkMatch[1]));
      return true;
    }
    const translateMatch = path.match(/^\/api\/jobs\/([^/]+)\/translate$/);
    if (method === "POST" && translateMatch) {
      await handleJobTranslate(req, res, decodeURIComponent(translateMatch[1]));
      return true;
    }
    const slugMatch = path.match(/^\/api\/jobs\/([^/]+)$/);
    if (method === "GET" && slugMatch) {
      const slug = decodeURIComponent(slugMatch[1]);
      if (slug === "sources" || slug === "categories" || slug === "admin" || slug === "sync") return false;
      await handleJobBySlug(req, res, slug);
      return true;
    }
    return false;
  } catch (err) {
    routeError(res, err, "[jobs-routes]");
    return true;
  }
}
