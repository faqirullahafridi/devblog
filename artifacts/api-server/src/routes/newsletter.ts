import { Router } from "express";
import { randomBytes } from "node:crypto";
import { db, newsletterSubscribersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { rateLimit } from "../lib/rate-limit";
import {
  sendNewsletterConfirmEmail,
  sendWelcomeEmail,
  sendNewsletterBroadcast,
  getSiteUrl,
} from "../lib/resend";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

function token() {
  return randomBytes(32).toString("hex");
}

router.post(
  "/newsletter/subscribe",
  rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "newsletter" }),
  async (req, res) => {
    try {
      const { email, name } = req.body as { email?: string; name?: string };
      if (!email?.trim()) return res.status(400).json({ error: "Email is required" });

      const normalized = email.trim().toLowerCase();
      const confirmToken = token();
      const unsubscribeToken = token();

      const [existing] = await db
        .select()
        .from(newsletterSubscribersTable)
        .where(eq(newsletterSubscribersTable.email, normalized))
        .limit(1);

      if (existing?.status === "confirmed") {
        return res.status(200).json({
          message: "You're already subscribed!",
          status: "confirmed",
        });
      }

      if (existing) {
        await db
          .update(newsletterSubscribersTable)
          .set({ confirmToken, status: "pending", name: name?.trim() || existing.name })
          .where(eq(newsletterSubscribersTable.id, existing.id));
      } else {
        await db.insert(newsletterSubscribersTable).values({
          email: normalized,
          name: name?.trim(),
          status: "pending",
          confirmToken,
          unsubscribeToken,
        });
      }

      await sendNewsletterConfirmEmail(normalized, confirmToken);

      return res.status(201).json({
        message: "Check your email to confirm your subscription.",
        status: "pending",
      });
    } catch (err) {
      req.log.error({ err }, "Failed to subscribe");
      return res.status(500).json({ error: "Failed to subscribe" });
    }
  },
);

router.get("/newsletter/confirm", async (req, res) => {
  try {
    const t = String(req.query.token || "");
    if (!t) return res.status(400).json({ error: "Token required" });

    const [sub] = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.confirmToken, t))
      .limit(1);

    if (!sub) return res.status(404).json({ error: "Invalid or expired token" });

    await db
      .update(newsletterSubscribersTable)
      .set({ status: "confirmed", confirmToken: null, confirmedAt: new Date() })
      .where(eq(newsletterSubscribersTable.id, sub.id));

    await sendWelcomeEmail(sub.email);

    return res.json({ success: true, message: "Subscription confirmed!" });
  } catch (err) {
    req.log.error({ err }, "Failed to confirm subscription");
    return res.status(500).json({ error: "Failed to confirm" });
  }
});

router.get("/newsletter/unsubscribe", async (req, res) => {
  try {
    const t = String(req.query.token || "");
    if (!t) return res.status(400).json({ error: "Token required" });

    const [sub] = await db
      .select()
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.unsubscribeToken, t))
      .limit(1);

    if (!sub) return res.status(404).json({ error: "Invalid token" });

    await db
      .update(newsletterSubscribersTable)
      .set({ status: "unsubscribed" })
      .where(eq(newsletterSubscribersTable.id, sub.id));

    return res.json({ success: true, message: "You have been unsubscribed." });
  } catch (err) {
    req.log.error({ err }, "Failed to unsubscribe");
    return res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

router.get("/newsletter/subscribers", requireAuth, async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(newsletterSubscribersTable)
      .orderBy(desc(newsletterSubscribersTable.createdAt));
    return res.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        confirmedAt: r.confirmedAt ? r.confirmedAt.toISOString() : null,
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list subscribers");
    return res.status(500).json({ error: "Failed to list subscribers" });
  }
});

router.post("/newsletter/send", requireAuth, async (req, res) => {
  try {
    const { subject, html, postSlug } = req.body as {
      subject?: string;
      html?: string;
      postSlug?: string;
    };
    if (!subject?.trim() || !html?.trim()) {
      return res.status(400).json({ error: "Subject and HTML body are required" });
    }

    const subs = await db
      .select({ email: newsletterSubscribersTable.email })
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.status, "confirmed"));

    let body = html.trim();
    if (postSlug) {
      body += `<p><a href="${getSiteUrl()}/post/${postSlug}">Read the full article</a></p>`;
    }
    body += `<p style="font-size:12px;color:#888">You received this because you subscribed to our newsletter.</p>`;

    const results = await sendNewsletterBroadcast(
      subs.map((s) => s.email),
      subject.trim(),
      body,
    );

    const sent = results.filter((r) => r.ok).length;
    return res.json({ success: true, sent, total: subs.length });
  } catch (err) {
    req.log.error({ err }, "Failed to send newsletter");
    return res.status(500).json({ error: "Failed to send newsletter" });
  }
});

export default router;
