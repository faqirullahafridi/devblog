import "./load-env";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { db, categoriesTable, postsTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { publishedVisibleCondition } from "./lib/post-filters";
import { setPublicCache } from "./lib/cache";
import { cached } from "./lib/memory-cache";
import { getDevHeadlines } from "./lib/integrations/feeds";

const app: Express = express();

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

const postListSelect = {
  id: postsTable.id,
  title: postsTable.title,
  slug: postsTable.slug,
  excerpt: postsTable.excerpt,
  featuredImage: postsTable.featuredImage,
  status: postsTable.status,
  isFeatured: postsTable.isFeatured,
  tags: postsTable.tags,
  publishAt: postsTable.publishAt,
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

function formatPost(p: Record<string, unknown>) {
  return {
    ...p,
    tags: (p.tags as string[] | null) ?? [],
    publishAt: p.publishAt ? (p.publishAt as Date).toISOString() : null,
    categoryName: (p.categoryName as string | null) ?? null,
    categorySlug: (p.categorySlug as string | null) ?? null,
    createdAt: (p.createdAt as Date).toISOString(),
    updatedAt: (p.updatedAt as Date).toISOString(),
  };
}

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

app.get(["/api/categories", "/categories"], async (_req, res) => {
  try {
    setPublicCache(res, 300);
    const rows = await cached("categories:all", 5 * 60_000, fetchCategoriesWithCounts);
    res.json(rows);
  } catch (err) {
    console.error("[public-api] categories failed:", err);
    res.status(503).json({ error: "Failed to list categories" });
  }
});

app.get(["/api/posts/home-feed", "/posts/home-feed"], async (_req, res) => {
  try {
    setPublicCache(res, 120);
    const listFrom = () =>
      db
        .select(postListSelect)
        .from(postsTable)
        .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id));

    const [featuredRows, recentRows, popularRows] = await Promise.all([
      listFrom()
        .where(and(eq(postsTable.isFeatured, true), publishedVisibleCondition()))
        .orderBy(desc(postsTable.createdAt))
        .limit(4),
      listFrom().where(publishedVisibleCondition()).orderBy(desc(postsTable.createdAt)).limit(6),
      listFrom()
        .where(publishedVisibleCondition())
        .orderBy(desc(postsTable.views), desc(postsTable.createdAt))
        .limit(6),
    ]);

    const featured = featuredRows.length > 0 ? featuredRows : recentRows.slice(0, 4);

    res.json({
      featured: featured.map(formatPost),
      recent: recentRows.map(formatPost),
      popular: popularRows.map(formatPost),
    });
  } catch (err) {
    console.error("[public-api] home-feed failed:", err);
    res.status(503).json({ error: "Failed to load home feed" });
  }
});

app.get(["/api/feeds/dev-headlines", "/feeds/dev-headlines"], async (req, res) => {
  try {
    setPublicCache(res, 600);
    const limit = Math.min(Number(req.query.limit ?? 10), 20);
    const items = await getDevHeadlines(limit);
    res.json({ items });
  } catch (err) {
    console.error("[public-api] dev-headlines failed:", err);
    res.json({ items: [] });
  }
});

app.get(["/api/auth/user/me", "/auth/user/me"], (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.json({ authenticated: false, user: null });
});

export default app;
