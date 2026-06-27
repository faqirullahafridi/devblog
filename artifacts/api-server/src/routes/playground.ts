import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, playgroundsTable, playgroundFilesTable, playgroundSharesTable } from "@workspace/db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { slugify } from "../lib/slugify";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";

const router = Router();

async function loadPlayground(slug: string) {
  const [pg] = await db.select().from(playgroundsTable).where(eq(playgroundsTable.slug, slug)).limit(1);
  if (!pg) return null;
  const files = await db
    .select()
    .from(playgroundFilesTable)
    .where(eq(playgroundFilesTable.playgroundId, pg.id))
    .orderBy(playgroundFilesTable.sortOrder);
  return { ...pg, files };
}

router.get("/playgrounds", cachePublic(60), async (req, res) => {
  try {
    const { language, search, page = "1", limit = "12", publicOnly = "true" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 12);
    const offset = (pageNum - 1) * limitNum;
    const visitorId = getVisitorId(req, res);

    const conditions = [];
    if (publicOnly === "true") conditions.push(eq(playgroundsTable.isPublic, true));
    else conditions.push(or(eq(playgroundsTable.isPublic, true), eq(playgroundsTable.visitorId, visitorId))!);
    if (language) conditions.push(eq(playgroundsTable.language, language));
    if (search) conditions.push(or(ilike(playgroundsTable.title, `%${search}%`), ilike(playgroundsTable.slug, `%${search}%`))!);

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db.select().from(playgroundsTable).where(where).orderBy(desc(playgroundsTable.updatedAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(playgroundsTable).where(where),
    ]);

    res.json({
      playgrounds: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list playgrounds");
    res.status(500).json({ error: "Failed to list playgrounds" });
  }
});

router.get("/playgrounds/stats", requireAuth, async (req, res) => {
  try {
    const [totals, popular] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`.mapWith(Number),
        public: sql<number>`count(*) filter (where ${playgroundsTable.isPublic})`.mapWith(Number),
        views: sql<number>`coalesce(sum(${playgroundsTable.views}), 0)`.mapWith(Number),
      }).from(playgroundsTable),
      db.select().from(playgroundsTable).where(eq(playgroundsTable.isPublic, true)).orderBy(desc(playgroundsTable.views)).limit(10),
    ]);
    res.json({ totals: totals[0], popular });
  } catch (err) {
    res.status(500).json({ error: "Failed to get playground stats" });
  }
});

router.get("/playgrounds/share/:token", async (req, res) => {
  try {
    const [share] = await db
      .select()
      .from(playgroundSharesTable)
      .where(eq(playgroundSharesTable.shareToken, req.params.token))
      .limit(1);
    if (!share) return res.status(404).json({ error: "Share link not found" });
    if (share.expiresAt && share.expiresAt < new Date()) {
      return res.status(410).json({ error: "Share link expired" });
    }

    const [pg] = await db.select().from(playgroundsTable).where(eq(playgroundsTable.id, share.playgroundId)).limit(1);
    if (!pg) return res.status(404).json({ error: "Snippet not found" });

    const data = await loadPlayground(pg.slug);
    if (!data) return res.status(404).json({ error: "Not found" });

    res.json({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      shareToken: share.shareToken,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load shared playground" });
  }
});

router.get("/playgrounds/:slug", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const data = await loadPlayground(req.params.slug);
    if (!data) return res.status(404).json({ error: "Not found" });
    if (!data.isPublic && data.visitorId !== visitorId) return res.status(403).json({ error: "Private snippet" });

    await db.update(playgroundsTable).set({ views: sql`${playgroundsTable.views} + 1` }).where(eq(playgroundsTable.id, data.id));

    res.json({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load playground" });
  }
});

router.post("/playgrounds", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { title, language, isPublic, authorName, files, forkedFromId } = req.body as {
      title?: string;
      language?: string;
      isPublic?: boolean;
      authorName?: string;
      files?: Array<{ filename: string; content: string }>;
      forkedFromId?: number;
    };

    if (!title || !language || !files?.length) {
      return res.status(400).json({ error: "title, language, and files are required" });
    }

    const baseSlug = slugify(title) || "snippet";
    const slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;

    const [pg] = await db
      .insert(playgroundsTable)
      .values({
        slug,
        title,
        language,
        isPublic: !!isPublic,
        visitorId,
        authorName: authorName?.trim() || "Anonymous",
        forkedFromId: forkedFromId ?? null,
      })
      .returning();

    await db.insert(playgroundFilesTable).values(
      files.map((f, i) => ({
        playgroundId: pg.id,
        filename: f.filename,
        content: f.content,
        sortOrder: i,
      })),
    );

    const loaded = await loadPlayground(slug);
    res.status(201).json(loaded);
  } catch (err) {
    req.log.error({ err }, "Failed to save playground");
    res.status(500).json({ error: "Failed to save playground" });
  }
});

router.patch("/playgrounds/:slug", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { title, isPublic, files } = req.body as {
      title?: string;
      isPublic?: boolean;
      files?: Array<{ filename: string; content: string }>;
    };

    const [pg] = await db.select().from(playgroundsTable).where(eq(playgroundsTable.slug, req.params.slug)).limit(1);
    if (!pg) return res.status(404).json({ error: "Not found" });
    if (pg.visitorId !== visitorId) return res.status(403).json({ error: "Not your snippet" });

    const updates: Partial<typeof pg> = {};
    if (title) updates.title = title;
    if (typeof isPublic === "boolean") updates.isPublic = isPublic;
    if (Object.keys(updates).length) await db.update(playgroundsTable).set(updates).where(eq(playgroundsTable.id, pg.id));

    if (files?.length) {
      await db.delete(playgroundFilesTable).where(eq(playgroundFilesTable.playgroundId, pg.id));
      await db.insert(playgroundFilesTable).values(
        files.map((f, i) => ({ playgroundId: pg.id, filename: f.filename, content: f.content, sortOrder: i })),
      );
    }

    res.json(await loadPlayground(req.params.slug));
  } catch (err) {
    res.status(500).json({ error: "Failed to update playground" });
  }
});

router.post("/playgrounds/:slug/share", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const [pg] = await db.select().from(playgroundsTable).where(eq(playgroundsTable.slug, req.params.slug)).limit(1);
    if (!pg) return res.status(404).json({ error: "Not found" });
    if (pg.visitorId !== visitorId) return res.status(403).json({ error: "Not your snippet" });

    const shareToken = randomBytes(12).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const [share] = await db
      .insert(playgroundSharesTable)
      .values({ playgroundId: pg.id, shareToken, expiresAt })
      .returning();

    res.json({ shareToken: share.shareToken, expiresAt: share.expiresAt?.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create share link" });
  }
});

export default router;
