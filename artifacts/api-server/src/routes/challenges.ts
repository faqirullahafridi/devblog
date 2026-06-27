import { Router } from "express";
import {
  db,
  challengesTable,
  challengeSubmissionsTable,
  challengeScoresTable,
  challengeStreaksTable,
  type ChallengeTestCase,
} from "@workspace/db";
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { runJavaScriptChallenge } from "../lib/challenge-runner";
import { slugify } from "../lib/slugify";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";

const router = Router();

function formatChallenge(c: typeof challengesTable.$inferSelect, includeSolution = false) {
  const { solutionCode, ...rest } = c;
  return {
    ...rest,
    createdAt: c.createdAt.toISOString(),
    ...(includeSolution ? { solutionCode } : {}),
  };
}

router.get("/challenges", cachePublic(60), async (req, res) => {
  try {
    const { difficulty, category, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (difficulty) conditions.push(eq(challengesTable.difficulty, difficulty));
    if (category) conditions.push(eq(challengesTable.category, category));
    if (search) conditions.push(or(ilike(challengesTable.title, `%${search}%`), ilike(challengesTable.slug, `%${search}%`))!);

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db.select().from(challengesTable).where(where).orderBy(desc(challengesTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(challengesTable).where(where),
    ]);

    res.json({
      challenges: rows.map((r) => formatChallenge(r)),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to list challenges" });
  }
});

router.get("/challenges/daily", cachePublic(300), async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    let [daily] = await db.select().from(challengesTable).where(eq(challengesTable.dailyDate, today)).limit(1);
    if (!daily) {
      [daily] = await db.select().from(challengesTable).orderBy(desc(challengesTable.createdAt)).limit(1);
    }
    if (!daily) return res.status(404).json({ error: "No challenges yet" });
    res.json(formatChallenge(daily));
  } catch (err) {
    res.status(500).json({ error: "Failed to get daily challenge" });
  }
});

router.get("/challenges/leaderboard", cachePublic(120), async (req, res) => {
  try {
    const limitNum = Math.min(50, parseInt(String(req.query.limit || "20"), 10));
    const rows = await db
      .select()
      .from(challengeScoresTable)
      .orderBy(desc(challengeScoresTable.totalPoints))
      .limit(limitNum);
    res.json(rows.map((r) => ({ ...r, updatedAt: r.updatedAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});

router.get("/challenges/stats", requireAuth, async (_req, res) => {
  try {
    const [totals] = await db.select({
      challenges: sql<number>`count(*)`.mapWith(Number),
      submissions: sql<number>`(select count(*) from challenge_submissions)`.mapWith(Number),
    }).from(challengesTable);
    res.json(totals);
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/challenges/admin", requireAuth, async (req, res) => {
  try {
    const { search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, parseInt(limit, 10) || 20);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(or(ilike(challengesTable.title, `%${search}%`), ilike(challengesTable.slug, `%${search}%`))!);
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db.select().from(challengesTable).where(where).orderBy(desc(challengesTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(challengesTable).where(where),
    ]);

    res.json({
      challenges: rows.map((r) => formatChallenge(r, true)),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to list admin challenges" });
  }
});

router.get("/challenges/:slug", cachePublic(120), async (req, res) => {
  try {
    const [c] = await db.select().from(challengesTable).where(eq(challengesTable.slug, req.params.slug)).limit(1);
    if (!c) return res.status(404).json({ error: "Challenge not found" });
    res.json(formatChallenge(c));
  } catch (err) {
    res.status(500).json({ error: "Failed to get challenge" });
  }
});

router.post("/challenges/:slug/submit", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { code, authorName, language = "javascript" } = req.body as {
      code?: string;
      authorName?: string;
      language?: string;
    };
    if (!code?.trim()) return res.status(400).json({ error: "code is required" });

    const [c] = await db.select().from(challengesTable).where(eq(challengesTable.slug, req.params.slug)).limit(1);
    if (!c) return res.status(404).json({ error: "Challenge not found" });

    const testCases = (c.testCases as ChallengeTestCase[]) ?? [];
    const result =
      language === "javascript" || c.category === "javascript" || c.category === "algorithms"
        ? runJavaScriptChallenge(code, testCases)
        : runJavaScriptChallenge(code, testCases);

    const score = result.passed ? c.points : 0;
    const name = authorName?.trim() || "Anonymous";

    const [submission] = await db
      .insert(challengeSubmissionsTable)
      .values({
        challengeId: c.id,
        visitorId,
        authorName: name,
        code,
        language,
        passed: result.passed,
        score,
        runtimeMs: result.runtimeMs,
      })
      .returning();

    if (result.passed) {
      const [existing] = await db.select().from(challengeScoresTable).where(eq(challengeScoresTable.visitorId, visitorId)).limit(1);
      if (existing) {
        await db
          .update(challengeScoresTable)
          .set({
            totalPoints: existing.totalPoints + score,
            challengesSolved: existing.challengesSolved + 1,
            authorName: name,
          })
          .where(eq(challengeScoresTable.id, existing.id));
      } else {
        await db.insert(challengeScoresTable).values({
          visitorId,
          authorName: name,
          totalPoints: score,
          challengesSolved: 1,
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const [streak] = await db.select().from(challengeStreaksTable).where(eq(challengeStreaksTable.visitorId, visitorId)).limit(1);
      if (streak) {
        const last = streak.lastActivityDate;
        let current = streak.currentStreak;
        if (last !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const y = yesterday.toISOString().slice(0, 10);
          current = last === y ? current + 1 : 1;
        }
        await db
          .update(challengeStreaksTable)
          .set({
            currentStreak: current,
            longestStreak: Math.max(streak.longestStreak, current),
            lastActivityDate: today,
          })
          .where(eq(challengeStreaksTable.id, streak.id));
      } else {
        await db.insert(challengeStreaksTable).values({
          visitorId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
        });
      }
    }

    res.json({
      submission: { ...submission, createdAt: submission.createdAt.toISOString() },
      result,
    });
  } catch (err) {
    req.log.error({ err }, "Challenge submit failed");
    res.status(500).json({ error: "Submission failed" });
  }
});

router.post("/challenges", requireAuth, async (req, res) => {
  try {
    const body = req.body as {
      title?: string;
      description?: string;
      difficulty?: string;
      category?: string;
      starterCode?: string;
      solutionCode?: string;
      testCases?: ChallengeTestCase[];
      points?: number;
      isDaily?: boolean;
    };
    if (!body.title || !body.description || !body.difficulty || !body.category) {
      return res.status(400).json({ error: "title, description, difficulty, category required" });
    }

    const slug = slugify(body.title);
    const [c] = await db
      .insert(challengesTable)
      .values({
        slug,
        title: body.title,
        description: body.description,
        difficulty: body.difficulty,
        category: body.category,
        starterCode: body.starterCode ?? "",
        solutionCode: body.solutionCode,
        testCases: body.testCases ?? [],
        points: body.points ?? 10,
        isDaily: body.isDaily ?? false,
        dailyDate: body.isDaily ? new Date().toISOString().slice(0, 10) : null,
      })
      .returning();

    res.status(201).json(formatChallenge(c, true));
  } catch (err) {
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

router.patch("/challenges/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body as Record<string, unknown>;
    const [updated] = await db.update(challengesTable).set(body as any).where(eq(challengesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(formatChallenge(updated, true));
  } catch (err) {
    res.status(500).json({ error: "Failed to update challenge" });
  }
});

export default router;
