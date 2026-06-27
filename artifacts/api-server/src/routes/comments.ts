import { Router } from "express";
import { db, commentsTable, postsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";
import { rateLimit } from "../lib/rate-limit";

const router = Router();

function formatComment(r: typeof commentsTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    adminRepliedAt: r.adminRepliedAt ? r.adminRepliedAt.toISOString() : null,
  };
}

router.get("/comments", async (req, res) => {
  try {
    const rawPostId = req.query.postId;
    if (rawPostId !== undefined) {
      const postId = parseInt(String(rawPostId), 10);
      if (isNaN(postId)) return res.status(400).json({ error: "Invalid postId" });
      const rows = await db
        .select()
        .from(commentsTable)
        .where(eq(commentsTable.postId, postId))
        .orderBy(commentsTable.createdAt);
      return res.json(rows.map(formatComment));
    }

    if (!req.session.adminAuthenticated) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rows = await db
      .select({
        id: commentsTable.id,
        postId: commentsTable.postId,
        authorName: commentsTable.authorName,
        authorEmail: commentsTable.authorEmail,
        content: commentsTable.content,
        adminReply: commentsTable.adminReply,
        adminRepliedAt: commentsTable.adminRepliedAt,
        createdAt: commentsTable.createdAt,
        postTitle: postsTable.title,
        postSlug: postsTable.slug,
      })
      .from(commentsTable)
      .leftJoin(postsTable, eq(commentsTable.postId, postsTable.id))
      .orderBy(desc(commentsTable.createdAt));

    return res.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        adminRepliedAt: r.adminRepliedAt ? r.adminRepliedAt.toISOString() : null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list comments");
    return res.status(500).json({ error: "Failed to list comments" });
  }
});

router.post(
  "/comments",
  rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "comments" }),
  async (req, res) => {
    try {
      const { postId, authorName, authorEmail, content } = req.body as {
        postId: number;
        authorName: string;
        authorEmail?: string;
        content: string;
      };
      if (!postId || !authorName || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [comment] = await db
        .insert(commentsTable)
        .values({ postId, authorName, authorEmail, content })
        .returning();
      res.status(201).json(formatComment(comment));
    } catch (err) {
      req.log.error({ err }, "Failed to create comment");
      res.status(500).json({ error: "Failed to create comment" });
    }
  },
);

router.patch("/comments/:id/reply", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reply } = req.body as { reply: string };
    if (!reply) return res.status(400).json({ error: "Reply text is required" });

    const [updated] = await db
      .update(commentsTable)
      .set({ adminReply: reply, adminRepliedAt: new Date() })
      .where(eq(commentsTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(formatComment(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to reply to comment");
    res.status(500).json({ error: "Failed to reply to comment" });
  }
});

router.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(commentsTable).where(eq(commentsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete comment");
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
