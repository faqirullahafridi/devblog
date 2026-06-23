import { Router } from "express";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body as { email: string; name?: string };
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [sub] = await db
      .insert(newsletterSubscribersTable)
      .values({ email, name })
      .onConflictDoNothing()
      .returning();

    if (!sub) {
      const [existing] = await db.select().from(newsletterSubscribersTable);
      return res.status(201).json({ ...existing, createdAt: existing.createdAt.toISOString() });
    }

    res.status(201).json({ ...sub, createdAt: sub.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to subscribe");
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.get("/newsletter/subscribers", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(newsletterSubscribersTable)
      .orderBy(desc(newsletterSubscribersTable.createdAt));
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list subscribers");
    res.status(500).json({ error: "Failed to list subscribers" });
  }
});

export default router;
