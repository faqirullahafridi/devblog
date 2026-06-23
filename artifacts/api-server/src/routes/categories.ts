import { Router } from "express";
import { db, categoriesTable, postsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { slugify } from "../lib/slugify";
import { logger } from "../lib/logger";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const rows = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        createdAt: categoriesTable.createdAt,
        postCount: sql<number>`(SELECT COUNT(*) FROM posts WHERE posts.category_id = ${categoriesTable.id})`.mapWith(Number),
      })
      .from(categoriesTable)
      .orderBy(categoriesTable.name);

    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, slug, description } = req.body as { name: string; slug?: string; description?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });

    const finalSlug = slug || slugify(name);
    const [cat] = await db.insert(categoriesTable).values({ name, slug: finalSlug, description }).returning();
    res.status(201).json({ ...cat, postCount: 0, createdAt: cat.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.get("/categories/slug/:slug", async (req, res) => {
  try {
    const [cat] = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        createdAt: categoriesTable.createdAt,
        postCount: sql<number>`(SELECT COUNT(*) FROM posts WHERE posts.category_id = ${categoriesTable.id})`.mapWith(Number),
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, req.params.slug))
      .limit(1);

    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ ...cat, createdAt: cat.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get category by slug");
    res.status(500).json({ error: "Failed to get category" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [cat] = await db
      .select({
        id: categoriesTable.id,
        name: categoriesTable.name,
        slug: categoriesTable.slug,
        description: categoriesTable.description,
        createdAt: categoriesTable.createdAt,
        postCount: sql<number>`(SELECT COUNT(*) FROM posts WHERE posts.category_id = ${categoriesTable.id})`.mapWith(Number),
      })
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .limit(1);

    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json({ ...cat, createdAt: cat.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get category");
    res.status(500).json({ error: "Failed to get category" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, slug, description } = req.body as { name?: string; slug?: string; description?: string };
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (slug !== undefined) updates.slug = slug;
    if (description !== undefined) updates.description = description;
    if (name && !slug) updates.slug = slugify(name);

    const [updated] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Category not found" });

    const postCount = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(postsTable)
      .where(eq(postsTable.categoryId, id));

    res.json({ ...updated, postCount: postCount[0]?.count ?? 0, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
