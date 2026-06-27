import { Router } from "express";
import { db, contactMessagesTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import { rateLimit } from "../lib/rate-limit";
import { sendContactNotification, sendContactAutoReply } from "../lib/resend";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.post(
  "/contact",
  rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "contact" }),
  async (req, res) => {
    try {
      const { name, email, message } = req.body as {
        name?: string;
        email?: string;
        message?: string;
      };
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ error: "Name, email, and message are required" });
      }

      const [row] = await db
        .insert(contactMessagesTable)
        .values({ name: name.trim(), email: email.trim(), message: message.trim() })
        .returning();

      await Promise.all([
        sendContactNotification(name.trim(), email.trim(), message.trim()),
        sendContactAutoReply(email.trim(), name.trim()),
      ]);

      return res.status(201).json({
        id: row.id,
        success: true,
        createdAt: row.createdAt.toISOString(),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to submit contact");
      return res.status(500).json({ error: "Failed to send message" });
    }
  },
);

router.get("/contact/messages", requireAuth, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(contactMessagesTable)
      .orderBy(desc(contactMessagesTable.createdAt));
    return res.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list contact messages");
    return res.status(500).json({ error: "Failed to list messages" });
  }
});

export default router;
