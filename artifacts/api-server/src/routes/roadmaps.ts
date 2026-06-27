import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, roadmapsTable, roadmapProgressTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import {
  generateRoadmapPayload,
  ROADMAP_GOALS,
  ROADMAP_LEVELS,
  type RoadmapGoal,
} from "../lib/roadmap-generator";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";

const router = Router();

router.get("/roadmaps/options", cachePublic(3600), (_req, res) => {
  res.json({
    levels: ROADMAP_LEVELS,
    goals: ROADMAP_GOALS.map((g) => ({ slug: g, label: g.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })),
  });
});

router.post("/roadmaps/generate", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { currentLevel, goal } = req.body as { currentLevel?: string; goal?: string };

    if (!currentLevel || !goal) return res.status(400).json({ error: "currentLevel and goal are required" });
    if (!ROADMAP_LEVELS.includes(currentLevel as (typeof ROADMAP_LEVELS)[number])) {
      return res.status(400).json({ error: "Invalid currentLevel" });
    }
    if (!ROADMAP_GOALS.includes(goal as RoadmapGoal)) {
      return res.status(400).json({ error: "Invalid goal" });
    }

    const payload = generateRoadmapPayload(goal as RoadmapGoal, currentLevel as (typeof ROADMAP_LEVELS)[number]);
    const slug = `${goal}-${currentLevel}-${randomBytes(4).toString("hex")}`;

    const [row] = await db
      .insert(roadmapsTable)
      .values({
        slug,
        visitorId,
        currentLevel,
        goal,
        title: payload.title,
        payload,
      })
      .returning();

    res.status(201).json({
      ...row,
      payload,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate roadmap");
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

router.get("/roadmaps/stats", requireAuth, async (_req, res) => {
  try {
    const topGoals = await db
      .select({ goal: roadmapsTable.goal, count: sql<number>`count(*)`.mapWith(Number) })
      .from(roadmapsTable)
      .groupBy(roadmapsTable.goal)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const [totals] = await db.select({ total: sql<number>`count(*)`.mapWith(Number) }).from(roadmapsTable);
    const completedSteps = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(roadmapProgressTable)
      .where(eq(roadmapProgressTable.completed, true));

    res.json({ totalRoadmaps: totals?.total ?? 0, completedSteps: completedSteps[0]?.count ?? 0, topGoals });
  } catch (err) {
    res.status(500).json({ error: "Failed to get roadmap stats" });
  }
});

router.get("/roadmaps/:slug", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const [row] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.slug, req.params.slug)).limit(1);
    if (!row) return res.status(404).json({ error: "Roadmap not found" });

    const progress = await db.select().from(roadmapProgressTable).where(eq(roadmapProgressTable.roadmapId, row.id));

    res.json({
      ...row,
      createdAt: row.createdAt.toISOString(),
      progress,
      isOwner: row.visitorId === visitorId,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load roadmap" });
  }
});

router.get("/roadmaps/me/list", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const rows = await db
      .select()
      .from(roadmapsTable)
      .where(eq(roadmapsTable.visitorId, visitorId))
      .orderBy(desc(roadmapsTable.createdAt))
      .limit(20);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to list roadmaps" });
  }
});

router.post("/roadmaps/:slug/progress", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { itemKey, completed } = req.body as { itemKey?: string; completed?: boolean };
    if (!itemKey) return res.status(400).json({ error: "itemKey is required" });

    const [row] = await db.select().from(roadmapsTable).where(eq(roadmapsTable.slug, req.params.slug)).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    if (row.visitorId !== visitorId) return res.status(403).json({ error: "Not your roadmap" });

    const [existing] = await db
      .select()
      .from(roadmapProgressTable)
      .where(and(eq(roadmapProgressTable.roadmapId, row.id), eq(roadmapProgressTable.itemKey, itemKey)))
      .limit(1);

    if (existing) {
      await db
        .update(roadmapProgressTable)
        .set({ completed: !!completed, completedAt: completed ? new Date() : null })
        .where(eq(roadmapProgressTable.id, existing.id));
    } else {
      await db.insert(roadmapProgressTable).values({
        roadmapId: row.id,
        itemKey,
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update progress" });
  }
});

export default router;
