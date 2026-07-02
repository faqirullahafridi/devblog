import { Router, type Request, type Response } from "express";
import { db, aiConversationsTable, aiMessagesTable, aiUsageTable } from "@workspace/db";
import { eq, desc, and, sql, gte } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { withDbRetry, isDbConnectionError } from "../lib/db-retry";
import { completeAiChat, streamAiChat, getAiStatus, listAiModelOptions, modeFromPath, type AiMode } from "../lib/ai-service";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";
import { rateLimit } from "../lib/rate-limit";

const router = Router();

const aiChatLimit = rateLimit({
  windowMs: 60_000,
  max: Number(process.env.AI_RATE_LIMIT_PER_MIN ?? 20),
  keyPrefix: "ai-chat",
});

router.get("/ai/status", cachePublic(300), (_req, res) => {
  res.json(getAiStatus());
});

router.get("/ai/models", cachePublic(60), (req, res) => {
  const mode = modeFromPath(typeof req.query.mode === "string" ? req.query.mode : "chat");
  res.json({ mode, models: listAiModelOptions(mode) });
});

router.get("/ai/conversations", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const modeFilter =
      typeof req.query.mode === "string" && req.query.mode.trim()
        ? modeFromPath(req.query.mode)
        : undefined;

    const rows = await withDbRetry(() =>
      db
        .select()
        .from(aiConversationsTable)
        .where(
          modeFilter
            ? and(eq(aiConversationsTable.visitorId, visitorId), eq(aiConversationsTable.mode, modeFilter))
            : eq(aiConversationsTable.visitorId, visitorId),
        )
        .orderBy(desc(aiConversationsTable.updatedAt))
        .limit(50),
    );
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list AI conversations");
    if (isDbConnectionError(err)) {
      return res.status(503).json({ error: "Database temporarily unavailable. Try again." });
    }
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.get("/ai/conversations/:id", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid conversation id" });

    const [conv] = await withDbRetry(() =>
      db
        .select()
        .from(aiConversationsTable)
        .where(and(eq(aiConversationsTable.id, id), eq(aiConversationsTable.visitorId, visitorId)))
        .limit(1),
    );
    if (!conv) return res.status(404).json({ error: "Conversation not found" });

    const messages = await withDbRetry(() =>
      db
        .select()
        .from(aiMessagesTable)
        .where(eq(aiMessagesTable.conversationId, id))
        .orderBy(aiMessagesTable.createdAt),
    );

    res.json({
      ...conv,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get AI conversation");
    if (isDbConnectionError(err)) {
      return res.status(503).json({ error: "Database temporarily unavailable. Try again." });
    }
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.post("/ai/conversations", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const { mode = "chat", title = "New conversation" } = req.body as { mode?: string; title?: string };
    const [conv] = await db
      .insert(aiConversationsTable)
      .values({ visitorId, mode: modeFromPath(mode), title })
      .returning();
    res.status(201).json({ ...conv, createdAt: conv.createdAt.toISOString(), updatedAt: conv.updatedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create AI conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.delete("/ai/conversations/:id", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const id = parseInt(req.params.id, 10);
    await db.delete(aiConversationsTable).where(and(eq(aiConversationsTable.id, id), eq(aiConversationsTable.visitorId, visitorId)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete AI conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

async function handleAiChat(req: Request, res: Response) {
  const wantsStream =
    (req.body as { stream?: boolean })?.stream === true ||
    String(req.headers.accept ?? "").includes("text/event-stream");

  try {
    const visitorId = getVisitorId(req, res);
    const mode = modeFromPath(req.params.mode || "chat") as AiMode;
    const { message, conversationId, title, modelId } = req.body as {
      message?: string;
      conversationId?: number;
      title?: string;
      modelId?: string;
      stream?: boolean;
    };

    if (!message?.trim()) return res.status(400).json({ error: "message is required" });

    let convId = conversationId;
    if (!convId) {
      const [conv] = await db
        .insert(aiConversationsTable)
        .values({ visitorId, mode, title: title || message.slice(0, 60) })
        .returning();
      convId = conv.id;
    } else {
      const [existing] = await db
        .select()
        .from(aiConversationsTable)
        .where(and(eq(aiConversationsTable.id, convId), eq(aiConversationsTable.visitorId, visitorId)))
        .limit(1);
      if (!existing) return res.status(404).json({ error: "Conversation not found" });
    }

    const prior = await db
      .select()
      .from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, convId))
      .orderBy(aiMessagesTable.createdAt);

    const history = prior.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    if (wantsStream) {
      res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache, no-transform");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders?.();

      const send = (payload: unknown) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      send({ type: "start", conversationId: convId });

      await db.insert(aiMessagesTable).values({
        conversationId: convId,
        role: "user",
        content: message.trim(),
        tokensUsed: 0,
      });

      try {
        const { content, tokensIn, tokensOut, provider, model } = await streamAiChat({
          mode,
          messages: history,
          userMessage: message.trim(),
          modelId,
          onDelta: (text) => send({ type: "delta", content: text }),
        });

        const [assistantMsg] = await db
          .insert(aiMessagesTable)
          .values({
            conversationId: convId,
            role: "assistant",
            content,
            tokensUsed: tokensOut,
          })
          .returning();

        await db.insert(aiUsageTable).values({
          visitorId,
          mode,
          promptType: mode,
          tokensIn,
          tokensOut,
        });

        await db.update(aiConversationsTable).set({ updatedAt: new Date() }).where(eq(aiConversationsTable.id, convId));

        send({
          type: "done",
          conversationId: convId,
          message: { ...assistantMsg, createdAt: assistantMsg.createdAt.toISOString() },
          usage: { tokensIn, tokensOut },
          model: { provider, name: model },
        });
        res.end();
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "AI request failed";
        send({ type: "error", error: errMsg });
        res.end();
      }
      return;
    }

    await db.insert(aiMessagesTable).values({
      conversationId: convId,
      role: "user",
      content: message.trim(),
      tokensUsed: 0,
    });

    const { content, tokensIn, tokensOut, provider, model } = await completeAiChat({
      mode,
      messages: history,
      userMessage: message.trim(),
      modelId,
    });

    const [assistantMsg] = await db
      .insert(aiMessagesTable)
      .values({
        conversationId: convId,
        role: "assistant",
        content,
        tokensUsed: tokensOut,
      })
      .returning();

    await db.insert(aiUsageTable).values({
      visitorId,
      mode,
      promptType: mode,
      tokensIn,
      tokensOut,
    });

    await db.update(aiConversationsTable).set({ updatedAt: new Date() }).where(eq(aiConversationsTable.id, convId));

    res.json({
      conversationId: convId,
      message: { ...assistantMsg, createdAt: assistantMsg.createdAt.toISOString() },
      usage: { tokensIn, tokensOut },
      model: { provider, name: model },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI request failed";
    req.log.error({ err }, "AI chat failed");
    res.status(503).json({ error: message });
  }
}

router.post("/ai/chat", aiChatLimit, handleAiChat);
router.post("/ai/chat/:mode", aiChatLimit, handleAiChat);

router.get("/ai/usage/me", async (req, res) => {
  try {
    const visitorId = getVisitorId(req, res);
    const rows = await db
      .select({
        total: sql<number>`count(*)`.mapWith(Number),
        tokensIn: sql<number>`coalesce(sum(${aiUsageTable.tokensIn}), 0)`.mapWith(Number),
        tokensOut: sql<number>`coalesce(sum(${aiUsageTable.tokensOut}), 0)`.mapWith(Number),
      })
      .from(aiUsageTable)
      .where(eq(aiUsageTable.visitorId, visitorId));
    res.json(rows[0] ?? { total: 0, tokensIn: 0, tokensOut: 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to get usage" });
  }
});

router.get("/ai/stats", requireAuth, async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [totals, daily, topModes] = await Promise.all([
      db.select({
        requests: sql<number>`count(*)`.mapWith(Number),
        tokensIn: sql<number>`coalesce(sum(${aiUsageTable.tokensIn}), 0)`.mapWith(Number),
        tokensOut: sql<number>`coalesce(sum(${aiUsageTable.tokensOut}), 0)`.mapWith(Number),
      }).from(aiUsageTable),
      db
        .select({
          day: sql<string>`date(${aiUsageTable.createdAt})`.mapWith(String),
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(aiUsageTable)
        .where(gte(aiUsageTable.createdAt, since))
        .groupBy(sql`date(${aiUsageTable.createdAt})`)
        .orderBy(sql`date(${aiUsageTable.createdAt})`),
      db
        .select({
          mode: aiUsageTable.mode,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(aiUsageTable)
        .groupBy(aiUsageTable.mode)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
    ]);

    res.json({ totals: totals[0], daily, topModes });
  } catch (err) {
    req.log.error({ err }, "Failed to get AI stats");
    res.status(500).json({ error: "Failed to get AI stats" });
  }
});

export default router;
