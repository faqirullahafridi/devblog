import { Router } from "express";
import { randomBytes } from "node:crypto";
import {
  db,
  communityQuestionsTable,
  communityAnswersTable,
  communityVotesTable,
  communityUsersTable,
  communityReportsTable,
} from "@workspace/db";
import { eq, desc, and, sql, or, ilike } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { slugify } from "../lib/slugify";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";

const router = Router();

async function ensureCommunityUser(visitorId: string, username: string) {
  const [existing] = await db.select().from(communityUsersTable).where(eq(communityUsersTable.visitorId, visitorId)).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(communityUsersTable).values({ visitorId, username }).returning();
  return created;
}

router.get("/community/questions", cachePublic(30), async (req, res) => {
  try {
    const { tag, search, page = "1", limit = "15" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 15);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(or(ilike(communityQuestionsTable.title, `%${search}%`), ilike(communityQuestionsTable.body, `%${search}%`))!);
    if (tag) conditions.push(sql`${communityQuestionsTable.tags} @> ${JSON.stringify([tag])}::jsonb`);

    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db.select().from(communityQuestionsTable).where(where).orderBy(desc(communityQuestionsTable.score), desc(communityQuestionsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(communityQuestionsTable).where(where),
    ]);

    res.json({
      questions: rows.map((q) => ({ ...q, createdAt: q.createdAt.toISOString(), updatedAt: q.updatedAt.toISOString() })),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to list questions" });
  }
});

router.get("/community/questions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [q] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, id)).limit(1);
    if (!q) return res.status(404).json({ error: "Question not found" });

    await db.update(communityQuestionsTable).set({ views: sql`${communityQuestionsTable.views} + 1` }).where(eq(communityQuestionsTable.id, id));

    const answers = await db
      .select()
      .from(communityAnswersTable)
      .where(eq(communityAnswersTable.questionId, id))
      .orderBy(desc(communityAnswersTable.isAccepted), desc(communityAnswersTable.score));

    res.json({
      ...q,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      answers: answers.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get question" });
  }
});

router.post("/community/questions", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { title, body, tags, authorName } = req.body as {
      title?: string;
      body?: string;
      tags?: string[];
      authorName?: string;
    };
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: "title and body required" });

    const name = authorName?.trim() || "Anonymous";
    await ensureCommunityUser(visitorId, name);

    const slug = `${slugify(title)}-${randomBytes(3).toString("hex")}`;
    const [q] = await db
      .insert(communityQuestionsTable)
      .values({
        slug,
        title: title.trim(),
        body: body.trim(),
        visitorId,
        authorName: name,
        tags: tags ?? [],
      })
      .returning();

    res.status(201).json({ ...q, createdAt: q.createdAt.toISOString(), updatedAt: q.updatedAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to create question" });
  }
});

router.post("/community/questions/:id/answers", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const questionId = parseInt(req.params.id, 10);
    const { body, authorName } = req.body as { body?: string; authorName?: string };
    if (!body?.trim()) return res.status(400).json({ error: "body required" });

    const [q] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, questionId)).limit(1);
    if (!q) return res.status(404).json({ error: "Question not found" });

    const name = authorName?.trim() || "Anonymous";
    await ensureCommunityUser(visitorId, name);

    const [a] = await db
      .insert(communityAnswersTable)
      .values({ questionId, body: body.trim(), visitorId, authorName: name })
      .returning();

    res.status(201).json({ ...a, createdAt: a.createdAt.toISOString() });
  } catch (err) {
    res.status(500).json({ error: "Failed to post answer" });
  }
});

router.post("/community/vote", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { targetType, targetId, value } = req.body as {
      targetType?: "question" | "answer";
      targetId?: number;
      value?: number;
    };
    if (!targetType || !targetId || ![1, -1].includes(value ?? 0)) {
      return res.status(400).json({ error: "Invalid vote" });
    }

    const [existing] = await db
      .select()
      .from(communityVotesTable)
      .where(
        and(
          eq(communityVotesTable.targetType, targetType),
          eq(communityVotesTable.targetId, targetId),
          eq(communityVotesTable.visitorId, visitorId),
        ),
      )
      .limit(1);

    const table = targetType === "question" ? communityQuestionsTable : communityAnswersTable;
    const delta = value! - (existing?.value ?? 0);

    if (existing) {
      await db.update(communityVotesTable).set({ value: value! }).where(eq(communityVotesTable.id, existing.id));
    } else {
      await db.insert(communityVotesTable).values({ targetType, targetId, visitorId, value: value! });
    }

    await db.update(table).set({ score: sql`${table.score} + ${delta}` }).where(eq(table.id, targetId));

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

router.post("/community/questions/:id/accept/:answerId", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const questionId = parseInt(req.params.id, 10);
    const answerId = parseInt(req.params.answerId, 10);

    const [q] = await db.select().from(communityQuestionsTable).where(eq(communityQuestionsTable.id, questionId)).limit(1);
    if (!q || q.visitorId !== visitorId) return res.status(403).json({ error: "Only the author can accept an answer" });

    await db.update(communityAnswersTable).set({ isAccepted: false }).where(eq(communityAnswersTable.questionId, questionId));
    await db.update(communityAnswersTable).set({ isAccepted: true }).where(eq(communityAnswersTable.id, answerId));
    await db.update(communityQuestionsTable).set({ acceptedAnswerId: answerId, status: "closed" }).where(eq(communityQuestionsTable.id, questionId));

    const [answer] = await db.select().from(communityAnswersTable).where(eq(communityAnswersTable.id, answerId)).limit(1);
    if (answer) {
      await db
        .update(communityUsersTable)
        .set({ reputation: sql`${communityUsersTable.reputation} + 15` })
        .where(eq(communityUsersTable.visitorId, answer.visitorId));
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept answer" });
  }
});

router.get("/community/profile/:username", cachePublic(120), async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(communityUsersTable)
      .where(eq(communityUsersTable.username, req.params.username))
      .limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    const questions = await db
      .select()
      .from(communityQuestionsTable)
      .where(eq(communityQuestionsTable.visitorId, user.visitorId))
      .orderBy(desc(communityQuestionsTable.createdAt))
      .limit(10);

    res.json({ user, questions });
  } catch (err) {
    res.status(500).json({ error: "Failed to load profile" });
  }
});

router.post("/community/report", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { targetType, targetId, reason } = req.body as { targetType?: string; targetId?: number; reason?: string };
    if (!targetType || !targetId || !reason) return res.status(400).json({ error: "Missing fields" });

    await db.insert(communityReportsTable).values({ targetType, targetId, reason, visitorId });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

router.get("/community/moderation/reports", requireAuth, async (req, res) => {
  try {
    const status = (req.query.status as string) || "pending";
    const rows = await db
      .select()
      .from(communityReportsTable)
      .where(eq(communityReportsTable.status, status))
      .orderBy(desc(communityReportsTable.createdAt))
      .limit(50);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed to list reports" });
  }
});

router.patch("/community/moderation/reports/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body as { status?: string };
    await db.update(communityReportsTable).set({ status: status ?? "resolved" }).where(eq(communityReportsTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;
