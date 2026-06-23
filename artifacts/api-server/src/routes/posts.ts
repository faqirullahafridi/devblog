import { Router } from "express";
import { db, postsTable, categoriesTable } from "@workspace/db";
import { eq, desc, ilike, and, sql, or } from "drizzle-orm";
import { slugify, calcReadingTime } from "../lib/slugify";

const router = Router();

const withCategory = {
  id: postsTable.id,
  title: postsTable.title,
  slug: postsTable.slug,
  content: postsTable.content,
  excerpt: postsTable.excerpt,
  featuredImage: postsTable.featuredImage,
  status: postsTable.status,
  categoryId: postsTable.categoryId,
  seoTitle: postsTable.seoTitle,
  metaDescription: postsTable.metaDescription,
  views: postsTable.views,
  readingTime: postsTable.readingTime,
  createdAt: postsTable.createdAt,
  updatedAt: postsTable.updatedAt,
  categoryName: categoriesTable.name,
  categorySlug: categoriesTable.slug,
};

function formatPost(p: typeof withCategory & Record<string, unknown>) {
  return {
    ...p,
    categoryName: (p.categoryName as string | null) ?? null,
    categorySlug: (p.categorySlug as string | null) ?? null,
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
  };
}

router.get("/posts", async (req, res) => {
  try {
    const { category, search, status, page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status && status !== "all") conditions.push(eq(postsTable.status, status));
    if (category) conditions.push(eq(categoriesTable.slug, category));
    if (search) {
      conditions.push(
        or(
          ilike(postsTable.title, `%${search}%`),
          ilike(postsTable.content, `%${search}%`),
          ilike(postsTable.excerpt, `%${search}%`)
        )!
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select(withCategory)
        .from(postsTable)
        .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
        .where(where)
        .orderBy(desc(postsTable.createdAt))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(postsTable)
        .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
        .where(where),
    ]);

    res.json({
      posts: rows.map(formatPost as any),
      total: countRows[0]?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to list posts");
    res.status(500).json({ error: "Failed to list posts" });
  }
});

router.get("/posts/featured", async (req, res) => {
  try {
    const limitNum = Math.min(20, parseInt(String(req.query.limit || "6"), 10));
    const rows = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.status, "published"))
      .orderBy(desc(postsTable.createdAt))
      .limit(limitNum);

    res.json(rows.map(formatPost as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured posts");
    res.status(500).json({ error: "Failed to get featured posts" });
  }
});

router.get("/posts/slug/:slug", async (req, res) => {
  try {
    const [post] = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(and(eq(postsTable.slug, req.params.slug), eq(postsTable.status, "published")))
      .limit(1);

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(formatPost(post as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get post by slug");
    res.status(500).json({ error: "Failed to get post" });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [post] = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, id))
      .limit(1);

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(formatPost(post as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Failed to get post" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const { title, slug, content, excerpt, featuredImage, status, categoryId, seoTitle, metaDescription } =
      req.body as Record<string, string | number | undefined>;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!content && content !== "") return res.status(400).json({ error: "Content is required" });

    const finalSlug = (slug as string) || slugify(title as string);
    const readingTime = calcReadingTime(content as string);

    const [post] = await db
      .insert(postsTable)
      .values({
        title: title as string,
        slug: finalSlug,
        content: (content as string) ?? "",
        excerpt: excerpt as string | undefined,
        featuredImage: featuredImage as string | undefined,
        status: (status as string) ?? "draft",
        categoryId: categoryId ? Number(categoryId) : undefined,
        seoTitle: seoTitle as string | undefined,
        metaDescription: metaDescription as string | undefined,
        readingTime,
      })
      .returning();

    const [withCat] = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, post.id))
      .limit(1);

    res.status(201).json(formatPost(withCat as any));
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.patch("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, slug, content, excerpt, featuredImage, status, categoryId, seoTitle, metaDescription } =
      req.body as Record<string, string | number | null | undefined>;

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) {
      updates.content = content;
      updates.readingTime = calcReadingTime(content as string);
    }
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;
    if (status !== undefined) updates.status = status;
    if (categoryId !== undefined) updates.categoryId = categoryId ? Number(categoryId) : null;
    if (seoTitle !== undefined) updates.seoTitle = seoTitle;
    if (metaDescription !== undefined) updates.metaDescription = metaDescription;

    const [updated] = await db.update(postsTable).set(updates).where(eq(postsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const [withCat] = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, id))
      .limit(1);

    res.json(formatPost(withCat as any));
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.patch("/posts/:id/publish", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body as { status: string };
    const [updated] = await db.update(postsTable).set({ status }).where(eq(postsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const [withCat] = await db
      .select(withCategory)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, id))
      .limit(1);

    res.json(formatPost(withCat as any));
  } catch (err) {
    req.log.error({ err }, "Failed to toggle post publish");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.post("/posts/:id/view", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [updated] = await db
      .update(postsTable)
      .set({ views: sql`${postsTable.views} + 1` })
      .where(eq(postsTable.id, id))
      .returning({ views: postsTable.views });

    res.json({ views: updated?.views ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to increment post view");
    res.status(500).json({ error: "Failed to update view count" });
  }
});

export default router;
