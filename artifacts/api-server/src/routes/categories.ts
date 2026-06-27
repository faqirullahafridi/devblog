import { Router } from "express";
import { db, categoriesTable, postsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/require-auth";
import { slugify } from "../lib/slugify";
import { cachePublic } from "../lib/cache";
import { cached, invalidateCache } from "../lib/memory-cache";

const router = Router();

const CACHE_TTL_MS = 5 * 60_000;

async function fetchCategoriesWithCounts() {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      createdAt: categoriesTable.createdAt,
      postCount: sql<number>`count(${postsTable.id})`.mapWith(Number),
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
    .groupBy(
      categoriesTable.id,
      categoriesTable.name,
      categoriesTable.slug,
      categoriesTable.description,
      categoriesTable.createdAt,
    )
    .orderBy(categoriesTable.name);

  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}

async function fetchCategoryBySlug(slug: string) {
  const [cat] = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      description: categoriesTable.description,
      createdAt: categoriesTable.createdAt,
      postCount: sql<number>`count(${postsTable.id})`.mapWith(Number),
    })
    .from(categoriesTable)
    .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
    .where(eq(categoriesTable.slug, slug))
    .groupBy(
      categoriesTable.id,
      categoriesTable.name,
      categoriesTable.slug,
      categoriesTable.description,
      categoriesTable.createdAt,
    )
    .limit(1);

  if (!cat) return null;
  return { ...cat, createdAt: cat.createdAt.toISOString() };
}

router.get("/categories", cachePublic(300), async (req, res) => {
  try {
    const rows = await cached("categories:all", CACHE_TTL_MS, fetchCategoriesWithCounts);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.post("/categories", requireAuth, async (req, res) => {
  try {
    const { name, slug, description } = req.body as { name: string; slug?: string; description?: string };
    if (!name) return res.status(400).json({ error: "Name is required" });

    const finalSlug = slug || slugify(name);
    const [cat] = await db.insert(categoriesTable).values({ name, slug: finalSlug, description }).returning();
    invalidateCache("categories:");
    res.status(201).json({ ...cat, postCount: 0, createdAt: cat.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.get("/categories/slug/:slug", cachePublic(300), async (req, res) => {
  try {
    const slug = req.params.slug;
    const cat = await cached(`categories:slug:${slug}`, CACHE_TTL_MS, () => fetchCategoryBySlug(slug));
    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json(cat);
  } catch (err) {
    req.log.error({ err }, "Failed to get category by slug");
    res.status(500).json({ error: "Failed to get category" });
  }
});

router.get("/categories/:id", cachePublic(300), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cat = await cached(`categories:id:${id}`, CACHE_TTL_MS, async () => {
      const [row] = await db
        .select({
          id: categoriesTable.id,
          name: categoriesTable.name,
          slug: categoriesTable.slug,
          description: categoriesTable.description,
          createdAt: categoriesTable.createdAt,
          postCount: sql<number>`count(${postsTable.id})`.mapWith(Number),
        })
        .from(categoriesTable)
        .leftJoin(postsTable, eq(postsTable.categoryId, categoriesTable.id))
        .where(eq(categoriesTable.id, id))
        .groupBy(
          categoriesTable.id,
          categoriesTable.name,
          categoriesTable.slug,
          categoriesTable.description,
          categoriesTable.createdAt,
        )
        .limit(1);

      if (!row) return null;
      return { ...row, createdAt: row.createdAt.toISOString() };
    });

    if (!cat) return res.status(404).json({ error: "Category not found" });
    res.json(cat);
  } catch (err) {
    req.log.error({ err }, "Failed to get category");
    res.status(500).json({ error: "Failed to get category" });
  }
});

router.patch("/categories/:id", requireAuth, async (req, res) => {
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

    invalidateCache("categories:");
    res.json({ ...updated, postCount: postCount[0]?.count ?? 0, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/categories/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    invalidateCache("categories:");
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
