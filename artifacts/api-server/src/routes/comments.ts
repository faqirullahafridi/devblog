import { Router } from "express";
import { db, commentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/comments", async (req, res) => {
  try {
    const postId = parseInt(String(req.query.postId), 10);
    if (isNaN(postId)) return res.status(400).json({ error: "postId is required" });

    const rows = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.postId, postId))
      .orderBy(commentsTable.createdAt);

    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list comments");
    res.status(500).json({ error: "Failed to list comments" });
  }
});

router.post("/comments", async (req, res) => {
  try {
    const { postId, authorName, authorEmail, content } = req.body as {
      postId: number; authorName: string; authorEmail?: string; content: string;
    };
    if (!postId || !authorName || !content) return res.status(400).json({ error: "Missing required fields" });

    const [comment] = await db.insert(commentsTable).values({ postId, authorName, authorEmail, content }).returning();
    res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create comment");
    res.status(500).json({ error: "Failed to create comment" });
  }
});

router.delete("/comments/:id", async (req, res) => {
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
