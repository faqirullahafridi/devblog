import { Router } from "express";
import { db, postsTable, categoriesTable } from "@workspace/db";
import { eq, desc, ilike, and, sql, or, ne } from "drizzle-orm";
import { slugify, calcReadingTime } from "../lib/slugify";
import { publishedVisibleCondition } from "../lib/post-filters";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic, setPublicCache } from "../lib/cache";
import { cached } from "../lib/memory-cache";
import { withDbRetry } from "../lib/db-retry";

const router = Router();

/** List/card views — omit heavy `content` column */
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

const postDetailSelect = {
  ...postListSelect,
  content: postsTable.content,
};

function formatPost(p: typeof postListSelect & Partial<Pick<typeof postDetailSelect, "content">> & Record<string, unknown>) {
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

router.get("/posts", async (req, res) => {
  try {
    const { category, search, tag, status, page = "1", limit = "10" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status && status !== "all") {
      if (status === "published") {
        conditions.push(publishedVisibleCondition());
      } else {
        conditions.push(eq(postsTable.status, status));
      }
    }
    if (category) conditions.push(eq(categoriesTable.slug, category));
    if (tag) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM jsonb_array_elements_text(${postsTable.tags}) AS elem
          WHERE lower(regexp_replace(trim(elem), '[^a-zA-Z0-9]+', '-', 'g')) = lower(${tag})
             OR lower(trim(elem)) = lower(replace(${tag}, '-', ' '))
        )`,
      );
    }
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
        .select(postListSelect)
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

    if (status === "published" || !status) {
      setPublicCache(res, 120);
    }

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

router.get("/posts/home-feed", cachePublic(120), async (_req, res) => {
  try {
    const feed = await cached("posts:home-feed", 120_000, () =>
      withDbRetry(async () => {
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

        let featured = featuredRows;
        if (featured.length === 0) {
          featured = recentRows.slice(0, 4);
        }

        return {
          featured: featured.map(formatPost as any),
          recent: recentRows.map(formatPost as any),
          popular: popularRows.map(formatPost as any),
        };
      }),
    );

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to load home feed" });
  }
});

router.get("/posts/featured", cachePublic(120), async (req, res) => {
  try {
    const limitNum = Math.min(20, parseInt(String(req.query.limit || "6"), 10));

    const featured = await db
      .select(postListSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(and(eq(postsTable.isFeatured, true), publishedVisibleCondition()))
      .orderBy(desc(postsTable.createdAt))
      .limit(limitNum);

    if (featured.length > 0) {
      return res.json(featured.map(formatPost as any));
    }

    const recent = await db
      .select(postListSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(publishedVisibleCondition())
      .orderBy(desc(postsTable.createdAt))
      .limit(limitNum);

    res.json(recent.map(formatPost as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured posts");
    res.status(500).json({ error: "Failed to get featured posts" });
  }
});

router.get("/posts/popular", cachePublic(120), async (req, res) => {
  try {
    const limitNum = Math.min(12, parseInt(String(req.query.limit || "6"), 10));

    const popular = await db
      .select(postListSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(publishedVisibleCondition())
      .orderBy(desc(postsTable.views), desc(postsTable.createdAt))
      .limit(limitNum);

    res.json(popular.map(formatPost as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get popular posts");
    res.status(500).json({ error: "Failed to get popular posts" });
  }
});

router.get("/tags", cachePublic(300), async (_req, res) => {
  try {
    const tags = await cached("posts:tags", 5 * 60_000, async () => {
      const rows = await db
        .select({ tags: postsTable.tags })
        .from(postsTable)
        .where(publishedVisibleCondition());

      const tagSet = new Map<string, string>();
      for (const row of rows) {
        for (const t of (row.tags as string[] | null) ?? []) {
          const trimmed = t.trim();
          if (!trimmed) continue;
          const slug = trimmed.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
          if (slug) tagSet.set(slug, trimmed);
        }
      }

      return [...tagSet.entries()]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    });

    res.json(tags);
  } catch (err) {
    req.log.error({ err }, "Failed to list tags");
    res.status(500).json({ error: "Failed to list tags" });
  }
});

router.get("/posts/slug/:slug/related", cachePublic(300), async (req, res) => {
  try {
    const limitNum = Math.min(6, parseInt(String(req.query.limit || "3"), 10));
    const [post] = await db
      .select({ id: postsTable.id, categoryId: postsTable.categoryId })
      .from(postsTable)
      .where(and(eq(postsTable.slug, req.params.slug), publishedVisibleCondition()))
      .limit(1);

    if (!post) return res.status(404).json({ error: "Post not found" });

    const conditions = [publishedVisibleCondition(), ne(postsTable.id, post.id)];
    if (post.categoryId) conditions.push(eq(postsTable.categoryId, post.categoryId));

    const related = await db
      .select(postListSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(and(...conditions))
      .orderBy(desc(postsTable.createdAt))
      .limit(limitNum);

    res.json(related.map(formatPost as any));
  } catch (err) {
    req.log.error({ err }, "Failed to get related posts");
    res.status(500).json({ error: "Failed to get related posts" });
  }
});

router.get("/posts/slug/:slug", cachePublic(300), async (req, res) => {
  try {
    const [post] = await db
      .select(postDetailSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(and(eq(postsTable.slug, req.params.slug), publishedVisibleCondition()))
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
      .select(postDetailSelect)
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

router.post("/posts", requireAuth, async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      seoTitle,
      metaDescription,
      tags,
      publishAt,
    } = req.body as Record<string, string | number | string[] | undefined | null>;
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
        tags: Array.isArray(tags) ? tags : [],
        publishAt: publishAt ? new Date(publishAt as string) : undefined,
        readingTime,
      })
      .returning();

    const [withCat] = await db
      .select(postDetailSelect)
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

router.patch("/posts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      seoTitle,
      metaDescription,
      tags,
      publishAt,
    } = req.body as Record<string, string | number | string[] | null | undefined>;

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
    if (tags !== undefined) updates.tags = tags;
    if (publishAt !== undefined) {
      updates.publishAt = publishAt ? new Date(publishAt as string) : null;
    }

    const [updated] = await db.update(postsTable).set(updates).where(eq(postsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const [withCat] = await db
      .select(postDetailSelect)
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

router.delete("/posts/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.patch("/posts/:id/feature", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { isFeatured } = req.body as { isFeatured: boolean };
    const [updated] = await db.update(postsTable).set({ isFeatured }).where(eq(postsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const [withCat] = await db
      .select(postDetailSelect)
      .from(postsTable)
      .leftJoin(categoriesTable, eq(postsTable.categoryId, categoriesTable.id))
      .where(eq(postsTable.id, id))
      .limit(1);

    res.json(formatPost(withCat as any));
  } catch (err) {
    req.log.error({ err }, "Failed to toggle post feature");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.patch("/posts/:id/publish", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body as { status: string };
    const [updated] = await db.update(postsTable).set({ status }).where(eq(postsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Post not found" });

    const [withCat] = await db
      .select(postDetailSelect)
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
