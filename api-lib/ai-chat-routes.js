import { randomBytes } from "node:crypto";
import { query } from "./db-pool.js";
import { loadSession, isAdminValid } from "./admin-routes.js";
import {
  isImageGenerationRequest,
  extractImagePrompt,
  generateNimImage,
  buildImageAssistantMarkdown,
  isNvidiaImageConfigured,
} from "./nvidia-nim-image.js";

const BASE_RULES = `You are TechVentry's AI Developer Assistant — practical, direct, and accurate.

Rules:
- Fulfill the user's actual request first (answer, code, design, explanation). Do not dump API client boilerplate unless they explicitly ask how to integrate an API.
- For image/logo/banner requests: describe the visual briefly; if you cannot output an image, offer SVG/HTML/CSS mockups — never replace an image request with Python/JS API integration code.
- Use markdown. Put code in fenced blocks with correct language tags.
- Be concise. Lead with the solution, then optional detail.`;

const SYSTEM_PROMPTS = {
  chat: `${BASE_RULES}\n\nMode: General developer Q&A — architecture, patterns, reviews, and how-tos.`,
  debug: `${BASE_RULES}\n\nMode: Debugging — find root cause, minimal fix, and why it broke. Show fixed code in fenced blocks.`,
  explain: `${BASE_RULES}\n\nMode: Explain code clearly with step-by-step breakdowns and small examples.`,
  generate: `${BASE_RULES}\n\nMode: Generate production-ready code from descriptions. Output complete runnable code in fenced blocks — not API setup scripts unless asked.\nFor UI/logo/image requests: output SVG or HTML/CSS the user can open in Preview, not image API code.`,
  convert: `${BASE_RULES}\n\nMode: Convert code between languages preserving behavior. Show the converted code in fenced blocks.`,
  optimize: `${BASE_RULES}\n\nMode: Optimize for performance and readability. Show before/after with brief notes.`,
  sql: `${BASE_RULES}\n\nMode: PostgreSQL — write correct queries in sql fenced blocks with short explanations.`,
  api: `${BASE_RULES}\n\nMode: REST API design with routes, request/response JSON examples, and status codes.`,
  errors: `${BASE_RULES}\n\nMode: Decode errors and stack traces with root cause and fix steps.`,
};

const VISITOR_COOKIE = "visitor_id";
const VISITOR_MAX_AGE_SEC = 365 * 24 * 60 * 60;

function modeFromPath(segment) {
  const map = {
    chat: "chat",
    debug: "debug",
    explain: "explain",
    generate: "generate",
    convert: "convert",
    optimize: "optimize",
    sql: "sql",
    api: "api",
    errors: "errors",
  };
  return map[segment] ?? "chat";
}

function parseCookies(req) {
  const cookies = {};
  for (const part of (req.headers?.cookie || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    cookies[trimmed.slice(0, eq)] = decodeURIComponent(trimmed.slice(eq + 1));
  }
  return cookies;
}

function parseQuery(rawUrl) {
  const q = {};
  const idx = (rawUrl ?? "").indexOf("?");
  if (idx === -1) return q;
  for (const part of rawUrl.slice(idx + 1).split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const k = decodeURIComponent(eq === -1 ? part : part.slice(0, eq));
    const v = decodeURIComponent(eq === -1 ? "" : part.slice(eq + 1));
    q[k] = v;
  }
  return q;
}

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function setNoCache(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

function setCache(res, maxAge = 60) {
  res.setHeader("Cache-Control", `public, max-age=${maxAge}, s-maxage=${maxAge * 2}`);
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function getVisitorId(req, res) {
  const existing = parseCookies(req)[VISITOR_COOKIE];
  if (existing && existing.length >= 8) return existing;
  const id = randomBytes(16).toString("hex");
  res.setHeader(
    "Set-Cookie",
    `${VISITOR_COOKIE}=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${VISITOR_MAX_AGE_SEC}`,
  );
  return id;
}

function envKey(...keys) {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

function resolveProviders() {
  const providers = [];
  const groqKey = envKey("GROQ_API_KEY");
  if (groqKey) {
    providers.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    });
  }
  const zaiKey = envKey("ZAI_GLM_47_FLASH_KEY", "ZAI_GLM_45_FLASH_KEY", "ZAI_API_KEY");
  if (zaiKey) {
    const base = (process.env.ZAI_BASE_URL?.trim() || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");
    providers.push({
      name: "zai",
      url: `${base}/chat/completions`,
      apiKey: zaiKey,
      model: process.env.ZAI_GLM_47_FLASH_MODEL?.trim() || process.env.ZAI_MODEL?.trim() || "glm-4.7-flash",
    });
  }
  const openaiKey = envKey("OPENAI_API_KEY");
  if (openaiKey) {
    providers.push({
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    });
  }
  const deepseekKey = envKey("DEEPSEEK_API_KEY");
  if (deepseekKey) {
    providers.push({
      name: "deepseek",
      url: "https://api.deepseek.com/chat/completions",
      apiKey: deepseekKey,
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    });
  }
  const geminiKey = envKey("GEMINI_API_KEY");
  if (geminiKey) {
    providers.push({
      name: "gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash"}:generateContent?key=${geminiKey}`,
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
      kind: "gemini",
    });
  }
  return providers;
}

function buildMessages(mode, history, userMessage) {
  const system = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.chat;
  return [
    { role: "system", content: system },
    ...history.filter((m) => m.role !== "system"),
    { role: "user", content: userMessage },
  ];
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text).length / 4));
}

/** When the user wants an image, generate via NVIDIA NIM instead of LLM API code. */
async function tryImageGeneration(userMessage, onDelta) {
  if (!isImageGenerationRequest(userMessage)) return null;
  const prompt = extractImagePrompt(userMessage);
  if (onDelta) onDelta("Generating your image…\n\n");

  try {
    const result = await generateNimImage({ prompt });
    const content = buildImageAssistantMarkdown(prompt, result);
    return {
      content,
      tokensIn: estimateTokens(userMessage),
      tokensOut: estimateTokens(content),
      provider: "nvidia-nim-image",
      model: result.model,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const content = isNvidiaImageConfigured()
      ? `**Image generation failed:** ${msg}\n\nTry a shorter prompt or check your NVIDIA API credits on [build.nvidia.com](https://build.nvidia.com/models).`
      : `**Image generation isn't configured** on this server (add \`NVIDIA_API_KEY\` or \`NVIDIA_IMAGE_KEY\` from [build.nvidia.com](https://build.nvidia.com/models)).\n\nYou asked for: **${prompt}**\n\nI can still help with:\n- **SVG or HTML/CSS mockup** — ask "create an SVG logo for …"\n- **Design description** — colors, layout, typography\n\nI won't respond with API client code when you wanted a visual.`;
    return {
      content,
      tokensIn: estimateTokens(userMessage),
      tokensOut: estimateTokens(content),
      provider: "techventry",
      model: "image-fallback",
    };
  }
}

async function completeOpenAiChat(provider, messages) {
  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`${provider.name}: HTTP ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${provider.name}: empty response`);
  const tokensIn = json.usage?.prompt_tokens ?? estimateTokens(JSON.stringify(messages));
  const tokensOut = json.usage?.completion_tokens ?? estimateTokens(content);
  return { content, tokensIn, tokensOut, provider: provider.name, model: provider.model };
}

async function completeGeminiChat(provider, messages) {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const system = messages.find((m) => m.role === "system")?.content;
  const res = await fetch(provider.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }),
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`gemini: HTTP ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
  }
  const json = await res.json();
  const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!content) throw new Error("gemini: empty response");
  return {
    content,
    tokensIn: estimateTokens(JSON.stringify(messages)),
    tokensOut: estimateTokens(content),
    provider: "gemini",
    model: provider.model,
  };
}

function parseSseDelta(line) {
  if (!line.startsWith("data:")) return "";
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  try {
    const json = JSON.parse(data);
    const delta = json.choices?.[0]?.delta;
    return delta?.content ?? delta?.reasoning_content ?? "";
  } catch {
    return "";
  }
}

async function streamOpenAiChat(provider, messages, onDelta) {
  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
      stream: true,
    }),
    signal: AbortSignal.timeout(28_000),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`${provider.name}: HTTP ${res.status}${errText ? ` — ${errText.slice(0, 200)}` : ""}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error(`${provider.name}: streaming not supported`);
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const text = parseSseDelta(line.trim());
      if (text) {
        content += text;
        onDelta(text);
      }
    }
  }
  return {
    content,
    tokensIn: estimateTokens(JSON.stringify(messages)),
    tokensOut: estimateTokens(content),
    provider: provider.name,
    model: provider.model,
  };
}

async function runAiChat(mode, history, userMessage, onDelta) {
  const providers = resolveProviders();
  if (!providers.length) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on Vercel.",
    );
  }
  const messages = buildMessages(mode, history, userMessage);
  const errors = [];
  for (const provider of providers) {
    try {
      if (provider.kind === "gemini") {
        if (onDelta) throw new Error("gemini streaming skipped");
        return await completeGeminiChat(provider, messages);
      }
      if (onDelta) return await streamOpenAiChat(provider, messages, onDelta);
      return await completeOpenAiChat(provider, messages);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  throw new Error(errors.join("; ") || "All AI providers failed");
}

function listModelOptions(mode) {
  return resolveProviders().map((p) => ({
    id: `${p.name}::${p.model}`,
    provider: p.name,
    model: p.model,
    label: p.model,
    category: mode === "generate" ? "code" : "chat",
  }));
}

async function handleAiModels(req, res) {
  setCache(res, 60);
  const q = parseQuery(req.url);
  const mode = modeFromPath(q.mode || "chat");
  sendJson(res, 200, { mode, models: listModelOptions(mode) });
}

async function handleAiConversationById(req, res, idStr) {
  setNoCache(res);
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) {
    sendJson(res, 400, { error: "Invalid conversation id" });
    return;
  }
  const visitorId = getVisitorId(req, res);
  const { rows: convRows } = await query(
    `SELECT id, visitor_id AS "visitorId", title, mode, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM ai_conversations WHERE id = $1 AND visitor_id = $2 LIMIT 1`,
    [id, visitorId],
  );
  if (!convRows[0]) {
    sendJson(res, 404, { error: "Conversation not found" });
    return;
  }
  const conv = convRows[0];
  const { rows: messages } = await query(
    `SELECT id, role, content, created_at AS "createdAt"
     FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [id],
  );
  sendJson(res, 200, {
    ...conv,
    createdAt: new Date(conv.createdAt).toISOString(),
    updatedAt: new Date(conv.updatedAt).toISOString(),
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: new Date(m.createdAt).toISOString(),
    })),
  });
}

async function handleCreateConversation(req, res) {
  setNoCache(res);
  const visitorId = getVisitorId(req, res);
  const body = await readJsonBody(req);
  const mode = modeFromPath(body.mode || "chat");
  const title = body.title?.trim() || "New conversation";
  const { rows } = await query(
    `INSERT INTO ai_conversations (visitor_id, mode, title) VALUES ($1, $2, $3)
     RETURNING id, visitor_id AS "visitorId", title, mode, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [visitorId, mode, title],
  );
  const conv = rows[0];
  sendJson(res, 201, {
    ...conv,
    createdAt: new Date(conv.createdAt).toISOString(),
    updatedAt: new Date(conv.updatedAt).toISOString(),
  });
}

async function handleDeleteConversation(req, res, idStr) {
  setNoCache(res);
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) {
    sendJson(res, 400, { error: "Invalid conversation id" });
    return;
  }
  const visitorId = getVisitorId(req, res);
  await query(`DELETE FROM ai_conversations WHERE id = $1 AND visitor_id = $2`, [id, visitorId]);
  res.statusCode = 204;
  res.end();
}

async function handleAiUsageMe(req, res) {
  setNoCache(res);
  const visitorId = getVisitorId(req, res);
  const { rows } = await query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(tokens_in), 0)::int AS "tokensIn",
            COALESCE(SUM(tokens_out), 0)::int AS "tokensOut"
     FROM ai_usage WHERE visitor_id = $1`,
    [visitorId],
  );
  sendJson(res, 200, rows[0] ?? { total: 0, tokensIn: 0, tokensOut: 0 });
}

async function handleAiStats(req, res) {
  setNoCache(res);
  const loaded = await loadSession(req);
  if (!isAdminValid(loaded?.sess)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [totals, daily, topModes] = await Promise.all([
    query(`SELECT COUNT(*)::int AS requests,
                  COALESCE(SUM(tokens_in), 0)::int AS "tokensIn",
                  COALESCE(SUM(tokens_out), 0)::int AS "tokensOut"
           FROM ai_usage`),
    query(
      `SELECT DATE(created_at)::text AS day, COUNT(*)::int AS count
       FROM ai_usage WHERE created_at >= $1
       GROUP BY DATE(created_at) ORDER BY day`,
      [since],
    ),
    query(
      `SELECT mode, COUNT(*)::int AS count FROM ai_usage
       GROUP BY mode ORDER BY count DESC LIMIT 10`,
    ),
  ]);
  sendJson(res, 200, {
    totals: totals.rows[0] ?? { requests: 0, tokensIn: 0, tokensOut: 0 },
    daily: daily.rows,
    topModes: topModes.rows,
  });
}

async function handleAiChat(req, res, modeSegment) {
  setNoCache(res);
  const body = await readJsonBody(req);
  const wantsStream =
    body.stream === true || String(req.headers?.accept ?? "").includes("text/event-stream");
  const mode = modeFromPath(modeSegment || "chat");
  const message = body.message?.trim();
  if (!message) {
    sendJson(res, 400, { error: "message is required" });
    return;
  }

  const visitorId = getVisitorId(req, res);
  let convId = body.conversationId;
  if (!convId) {
    const title = body.title?.trim() || message.slice(0, 60);
    const { rows } = await query(
      `INSERT INTO ai_conversations (visitor_id, mode, title) VALUES ($1, $2, $3) RETURNING id`,
      [visitorId, mode, title],
    );
    convId = rows[0].id;
  } else {
    const { rows } = await query(
      `SELECT id FROM ai_conversations WHERE id = $1 AND visitor_id = $2 LIMIT 1`,
      [convId, visitorId],
    );
    if (!rows[0]) {
      sendJson(res, 404, { error: "Conversation not found" });
      return;
    }
  }

  const { rows: prior } = await query(
    `SELECT role, content FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [convId],
  );
  const history = prior.map((m) => ({ role: m.role, content: m.content }));

  if (wantsStream) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    const send = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };
    send({ type: "start", conversationId: convId });

    await query(
      `INSERT INTO ai_messages (conversation_id, role, content, tokens_used) VALUES ($1, 'user', $2, 0)`,
      [convId, message],
    );

    try {
      const imageResult = await tryImageGeneration(message, (delta) => send({ type: "delta", content: delta }));
      const result =
        imageResult ??
        (await runAiChat(mode, history, message, (delta) => send({ type: "delta", content: delta })));
      const { rows: assistantRows } = await query(
        `INSERT INTO ai_messages (conversation_id, role, content, tokens_used)
         VALUES ($1, 'assistant', $2, $3)
         RETURNING id, role, content, created_at AS "createdAt"`,
        [convId, result.content, result.tokensOut],
      );
      const assistantMsg = assistantRows[0];
      await query(
        `INSERT INTO ai_usage (visitor_id, mode, prompt_type, tokens_in, tokens_out) VALUES ($1, $2, $3, $4, $5)`,
        [visitorId, mode, mode, result.tokensIn, result.tokensOut],
      );
      await query(`UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1`, [convId]);
      send({
        type: "done",
        conversationId: convId,
        message: { ...assistantMsg, createdAt: new Date(assistantMsg.createdAt).toISOString() },
        usage: { tokensIn: result.tokensIn, tokensOut: result.tokensOut },
        model: { provider: result.provider, name: result.model },
      });
      res.end();
    } catch (err) {
      send({ type: "error", error: err instanceof Error ? err.message : "AI request failed" });
      res.end();
    }
    return;
  }

  await query(
    `INSERT INTO ai_messages (conversation_id, role, content, tokens_used) VALUES ($1, 'user', $2, 0)`,
    [convId, message],
  );
  const imageResult = await tryImageGeneration(message);
  const result = imageResult ?? (await runAiChat(mode, history, message));
  const { rows: assistantRows } = await query(
    `INSERT INTO ai_messages (conversation_id, role, content, tokens_used)
     VALUES ($1, 'assistant', $2, $3)
     RETURNING id, role, content, created_at AS "createdAt"`,
    [convId, result.content, result.tokensOut],
  );
  const assistantMsg = assistantRows[0];
  await query(
    `INSERT INTO ai_usage (visitor_id, mode, prompt_type, tokens_in, tokens_out) VALUES ($1, $2, $3, $4, $5)`,
    [visitorId, mode, mode, result.tokensIn, result.tokensOut],
  );
  await query(`UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1`, [convId]);
  sendJson(res, 200, {
    conversationId: convId,
    message: { ...assistantMsg, createdAt: new Date(assistantMsg.createdAt).toISOString() },
    usage: { tokensIn: result.tokensIn, tokensOut: result.tokensOut },
    model: { provider: result.provider, name: result.model },
  });
}

export function isAiRoutePath(path, method) {
  const m = (method || "GET").toUpperCase();
  if (path === "/api/ai/models" && m === "GET") return true;
  if (path === "/api/ai/usage/me" && m === "GET") return true;
  if (path === "/api/ai/stats" && m === "GET") return true;
  if (path === "/api/ai/conversations" && m === "POST") return true;
  if (path === "/api/ai/chat" && m === "POST") return true;
  if (/^\/api\/ai\/chat\/[^/]+$/.test(path) && m === "POST") return true;
  if (/^\/api\/ai\/conversations\/\d+$/.test(path)) return true;
  return false;
}

export async function tryAiRoute(path, req, res) {
  const method = (req.method || "GET").toUpperCase();
  try {
    if (method === "GET" && path === "/api/ai/models") {
      await handleAiModels(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/ai/usage/me") {
      await handleAiUsageMe(req, res);
      return true;
    }
    if (method === "GET" && path === "/api/ai/stats") {
      await handleAiStats(req, res);
      return true;
    }
    if (method === "POST" && path === "/api/ai/conversations") {
      await handleCreateConversation(req, res);
      return true;
    }
    const convMatch = path.match(/^\/api\/ai\/conversations\/(\d+)$/);
    if (convMatch) {
      if (method === "GET") {
        await handleAiConversationById(req, res, convMatch[1]);
        return true;
      }
      if (method === "DELETE") {
        await handleDeleteConversation(req, res, convMatch[1]);
        return true;
      }
    }
    if (method === "POST" && path === "/api/ai/chat") {
      await handleAiChat(req, res, "chat");
      return true;
    }
    const chatMatch = path.match(/^\/api\/ai\/chat\/([^/]+)$/);
    if (method === "POST" && chatMatch) {
      await handleAiChat(req, res, decodeURIComponent(chatMatch[1]));
      return true;
    }
    return false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ai-chat-routes]", method, path, message);
    sendJson(res, 503, { error: message || "AI service temporarily unavailable" });
    return true;
  }
}
