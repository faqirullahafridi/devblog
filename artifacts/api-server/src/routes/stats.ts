import { Router } from "express";
import { db, postsTable, categoriesTable, commentsTable, newsletterSubscribersTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/stats/overview", async (req, res) => {
  try {
    const [
      postStats,
      categoryStats,
      subscriberStats,
      commentStats,
    ] = await Promise.all([
      db.select({
        total: sql<number>`count(*)`.mapWith(Number),
        published: sql<number>`count(*) filter (where status = 'published')`.mapWith(Number),
        draft: sql<number>`count(*) filter (where status = 'draft')`.mapWith(Number),
        views: sql<number>`sum(views)`.mapWith(Number),
      }).from(postsTable),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(categoriesTable),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(newsletterSubscribersTable),
      db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(commentsTable),
    ]);

    res.json({
      totalPosts: postStats[0]?.total ?? 0,
      publishedPosts: postStats[0]?.published ?? 0,
      draftPosts: postStats[0]?.draft ?? 0,
      totalViews: postStats[0]?.views ?? 0,
      totalCategories: categoryStats[0]?.count ?? 0,
      totalSubscribers: subscriberStats[0]?.count ?? 0,
      totalComments: commentStats[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats overview");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/stats/posts", async (req, res) => {
  try {
    const limitNum = Math.min(50, parseInt(String(req.query.limit || "20"), 10));
    const rows = await db
      .select({
        id: postsTable.id,
        title: postsTable.title,
        slug: postsTable.slug,
        views: postsTable.views,
        status: postsTable.status,
        categoryName: categoriesTable.name,
        createdAt: postsTable.createdAt,
      })
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .orderBy(desc(postsTable.views))
      .limit(limitNum);

    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get post stats");
    res.status(500).json({ error: "Failed to get post stats" });
  }
});

export default router;
