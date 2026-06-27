import { Router } from "express";
import { db, postsTable, categoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/sitemap", async (req, res) => {
  try {
    const [posts, categories] = await Promise.all([
      db
        .select({ slug: postsTable.slug, updatedAt: postsTable.updatedAt })
        .from(postsTable)
        .where(eq(postsTable.status, "published"))
        .orderBy(desc(postsTable.updatedAt)),
      db.select({ slug: categoriesTable.slug, createdAt: categoriesTable.createdAt }).from(categoriesTable),
    ]);

    const entries = [
      { url: "/", type: "home", updatedAt: new Date().toISOString() },
      { url: "/about", type: "page", updatedAt: new Date().toISOString() },
      { url: "/contact", type: "page", updatedAt: new Date().toISOString() },
      { url: "/privacy", type: "page", updatedAt: new Date().toISOString() },
      { url: "/terms", type: "page", updatedAt: new Date().toISOString() },
      ...categories.map((c) => ({
        url: `/category/${c.slug}`,
        type: "category",
        updatedAt: c.createdAt.toISOString(),
      })),
      ...posts.map((p) => ({
        url: `/post/${p.slug}`,
        type: "post",
        updatedAt: p.updatedAt.toISOString(),
      })),
    ];

    res.json(entries);
  } catch (err) {
    req.log.error({ err }, "Failed to get sitemap");
    res.status(500).json({ error: "Failed to get sitemap" });
  }
});

export default router;
