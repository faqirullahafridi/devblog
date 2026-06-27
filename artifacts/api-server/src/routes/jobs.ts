import { Router } from "express";
import { db, jobsTable, jobBookmarksTable, jobCategoriesTable } from "@workspace/db";
import { eq, desc, and, sql, or, ilike, gte, notInArray } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { slugify } from "../lib/slugify";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";
import { getJobSyncStatus, syncExternalJobs } from "../lib/job-sync";
import { JOB_SOURCES, HIDDEN_DEFAULT_JOB_SOURCES } from "../lib/job-providers";
import { likelyNonEnglish, translateJobField } from "../lib/job-translate";
import { rateLimit } from "../lib/rate-limit";

const router = Router();

const translateLimit = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.JOB_TRANSLATE_RATE_LIMIT_PER_MIN ?? 15),
  keyPrefix: "job-translate",
});

const JOB_CATEGORIES = [
  "frontend", "backend", "full-stack", "react", "nodejs", "django", "python", "qa", "devops", "remote",
];

function formatJob(j: typeof jobsTable.$inferSelect) {
  return {
    ...j,
    createdAt: j.createdAt.toISOString(),
    updatedAt: j.updatedAt.toISOString(),
    expiresAt: j.expiresAt?.toISOString() ?? null,
  };
}

router.get("/jobs/sources", cachePublic(3600), (_req, res) => {
  res.json(JOB_SOURCES);
});

router.get("/jobs/sync/status", requireAuth, (_req, res) => {
  res.json(getJobSyncStatus());
});

router.post("/jobs/sync", requireAuth, async (req, res) => {
  try {
    const result = await syncExternalJobs(true);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Job sync failed");
    res.status(500).json({ error: "Job sync failed" });
  }
});

/** Vercel Cron — set CRON_SECRET and schedule in vercel.json. */
router.get("/jobs/sync/cron", async (req, res) => {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else if (process.env.NODE_ENV === "production") {
    return res.status(503).json({ error: "CRON_SECRET not configured" });
  }

  try {
    const result = await syncExternalJobs(true);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Cron job sync failed");
    res.status(500).json({ error: "Job sync failed" });
  }
});

router.get("/jobs/categories", cachePublic(3600), async (_req, res) => {
  try {
    const rows = await db.select().from(jobCategoriesTable).orderBy(jobCategoriesTable.name);
    if (rows.length === 0) {
      return res.json(JOB_CATEGORIES.map((slug) => ({
        slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })));
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.get("/jobs/admin", requireAuth, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${search}%`),
          ilike(jobsTable.company, `%${search}%`),
        )!,
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db.select().from(jobsTable).where(where).orderBy(desc(jobsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(jobsTable).where(where),
    ]);

    res.json({
      jobs: rows.map(formatJob),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to list admin jobs" });
  }
});

router.get("/jobs", cachePublic(120), async (req, res) => {
  try {
    const { category, search, remote, source, region, page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;
    const now = new Date();

    const conditions = [
      eq(jobsTable.isActive, true),
      or(sql`${jobsTable.expiresAt} IS NULL`, gte(jobsTable.expiresAt, now))!,
    ];
    if (category) conditions.push(eq(jobsTable.category, category));
    if (source) {
      conditions.push(eq(jobsTable.source, source));
    } else {
      conditions.push(notInArray(jobsTable.source, [...HIDDEN_DEFAULT_JOB_SOURCES]));
    }
    if (region === "pakistan") {
      conditions.push(
        or(
          eq(jobsTable.region, "pakistan"),
          ilike(jobsTable.title, "%pakistan%"),
          ilike(jobsTable.location, "%pakistan%"),
          ilike(jobsTable.location, "%karachi%"),
          ilike(jobsTable.location, "%lahore%"),
          ilike(jobsTable.location, "%islamabad%"),
          ilike(jobsTable.location, "%rawalpindi%"),
          ilike(jobsTable.location, "%peshawar%"),
        )!,
      );
    } else if (region) {
      conditions.push(eq(jobsTable.region, region));
    }
    if (remote === "true") conditions.push(eq(jobsTable.remote, true));
    if (search) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${search}%`),
          ilike(jobsTable.company, `%${search}%`),
          ilike(jobsTable.description, `%${search}%`),
        )!,
      );
    }

    const where = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db.select().from(jobsTable).where(where).orderBy(desc(jobsTable.updatedAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(jobsTable).where(where),
    ]);

    res.json({
      jobs: rows.map(formatJob),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list jobs");
    res.status(500).json({ error: "Failed to list jobs" });
  }
});

router.get("/jobs/me/bookmarks", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const rows = await db
      .select({ job: jobsTable })
      .from(jobBookmarksTable)
      .innerJoin(jobsTable, eq(jobBookmarksTable.jobId, jobsTable.id))
      .where(eq(jobBookmarksTable.visitorId, visitorId))
      .orderBy(desc(jobBookmarksTable.createdAt));
    res.json(rows.map((r) => formatJob(r.job)));
  } catch (err) {
    res.status(500).json({ error: "Failed to list bookmarks" });
  }
});

router.post("/jobs/:slug/translate", translateLimit, async (req, res) => {
  try {
    const slug = req.params.slug;
    const field = (req.body as { field?: string })?.field === "requirements" ? "requirements" : "description";

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.slug, slug)).limit(1);
    if (!job || !job.isActive) return res.status(404).json({ error: "Job not found" });

    const sourceText = field === "requirements" ? job.requirements : job.description;
    if (!sourceText?.trim()) {
      return res.status(400).json({ error: "Nothing to translate" });
    }

    const text = await translateJobField(slug, field, sourceText, job.source);
    res.json({ field, text, translated: true });
  } catch (err) {
    req.log.error({ err }, "Job translation failed");
    res.status(503).json({ error: err instanceof Error ? err.message : "Translation failed" });
  }
});

router.get("/jobs/:slug", cachePublic(120), async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.slug, req.params.slug)).limit(1);
    if (!job || !job.isActive) return res.status(404).json({ error: "Job not found" });

    const [bookmarked] = await db
      .select()
      .from(jobBookmarksTable)
      .where(and(eq(jobBookmarksTable.jobId, job.id), eq(jobBookmarksTable.visitorId, visitorId)))
      .limit(1);

    const relatedConditions = [
      eq(jobsTable.category, job.category),
      eq(jobsTable.isActive, true),
      sql`${jobsTable.id} != ${job.id}`,
    ];
    if (!HIDDEN_DEFAULT_JOB_SOURCES.includes(job.source as (typeof HIDDEN_DEFAULT_JOB_SOURCES)[number])) {
      relatedConditions.push(notInArray(jobsTable.source, [...HIDDEN_DEFAULT_JOB_SOURCES]));
    }

    const related = await db
      .select()
      .from(jobsTable)
      .where(and(...relatedConditions))
      .orderBy(desc(jobsTable.createdAt))
      .limit(4);

    res.json({
      ...formatJob(job),
      bookmarked: !!bookmarked,
      related: related.map(formatJob),
      mayNeedTranslation:
        likelyNonEnglish(job.description, job.source) ||
        likelyNonEnglish(job.requirements, job.source),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get job" });
  }
});

router.post("/jobs/:slug/bookmark", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.slug, req.params.slug)).limit(1);
    if (!job) return res.status(404).json({ error: "Job not found" });

    const [existing] = await db
      .select()
      .from(jobBookmarksTable)
      .where(and(eq(jobBookmarksTable.jobId, job.id), eq(jobBookmarksTable.visitorId, visitorId)))
      .limit(1);

    if (existing) {
      await db.delete(jobBookmarksTable).where(eq(jobBookmarksTable.id, existing.id));
      return res.json({ bookmarked: false });
    }

    await db.insert(jobBookmarksTable).values({ jobId: job.id, visitorId });
    res.json({ bookmarked: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle bookmark" });
  }
});

router.post("/jobs", requireAuth, async (req, res) => {
  try {
    const body = req.body as {
      title?: string;
      company?: string;
      description?: string;
      requirements?: string;
      location?: string;
      remote?: boolean;
      salaryRange?: string;
      category?: string;
      applyUrl?: string;
      expiresAt?: string;
    };
    if (!body.title || !body.company || !body.description || !body.category || !body.applyUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const slug = `${slugify(`${body.company}-${body.title}`)}-${Date.now().toString(36)}`;
    const [job] = await db
      .insert(jobsTable)
      .values({
        slug,
        title: body.title,
        company: body.company,
        description: body.description,
        requirements: body.requirements ?? "",
        location: body.location ?? "Remote",
        remote: body.remote ?? true,
        salaryRange: body.salaryRange,
        category: body.category,
        applyUrl: body.applyUrl,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      })
      .returning();

    res.status(201).json(formatJob(job));
  } catch (err) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

router.patch("/jobs/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as Record<string, unknown>;
    if (body.expiresAt) body.expiresAt = new Date(body.expiresAt as string);
    const [updated] = await db.update(jobsTable).set(body as any).where(eq(jobsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(formatJob(updated));
  } catch (err) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

router.delete("/jobs/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.update(jobsTable).set({ isActive: false }).where(eq(jobsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to deactivate job" });
  }
});

export default router;
