import { randomBytes } from "node:crypto";
import { query } from "./db-pool.js";
import { loadSession, isAdminValid } from "./admin-routes.js";
import { buildSystemPrompt, MODE_HINTS, STATIC_SITE_USER_ENFORCEMENT, isStaticSiteRequest } from "./ai-instructions.js";

const SYSTEM_PROMPTS = Object.fromEntries(
  Object.entries(MODE_HINTS).map(([mode, hint]) => [mode, buildSystemPrompt(mode, hint)]),
);

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

function nvidiaConfigured() {
  return Boolean(
    envKey("NVIDIA_CODE_KEY", "NVIDIA_API_KEY", "NVIDIA_CHAT_KEY", "NVIDIA_MODEL_API_KEYS"),
  );
}

function shouldUseDirectDeepseek() {
  const flag = process.env.DEEPSEEK_DISABLED?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return false;
  if (!envKey("DEEPSEEK_API_KEY")) return false;
  if (nvidiaConfigured()) return false;
  return true;
}

function buildAllProviders() {
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
  if (deepseekKey && shouldUseDirectDeepseek()) {
    providers.push({
      name: "deepseek",
      url: "https://api.deepseek.com/v1/chat/completions",
      apiKey: deepseekKey,
      model: process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat",
    });
  }
  const siliconKey = envKey("SILICONFLOW_API_KEY");
  if (siliconKey) {
    providers.push({
      name: "siliconflow",
      url: "https://api.siliconflow.com/v1/chat/completions",
      apiKey: siliconKey,
      model: process.env.SILICONFLOW_MODEL?.trim() || "deepseek-ai/DeepSeek-V3",
    });
  }
  const nvidiaKey = envKey("NVIDIA_CODE_KEY", "NVIDIA_API_KEY", "NVIDIA_CHAT_KEY");
  if (nvidiaKey) {
    const codeModels = [
      process.env.NVIDIA_CODE_MODEL?.trim(),
      "qwen/qwen3.5-122b-a10b",
      "deepseek-ai/deepseek-v4-flash",
      "qwen/qwen3-next-80b-a3b-instruct",
      "deepseek-ai/deepseek-v4-pro",
    ].filter(Boolean);
    const seen = new Set();
    for (const model of codeModels) {
      if (seen.has(model)) continue;
      seen.add(model);
      providers.push({
        name: "nvidia",
        url: "https://integrate.api.nvidia.com/v1/chat/completions",
        apiKey: nvidiaKey,
        model,
      });
    }
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

const CODE_MODES = new Set(["generate", "convert", "optimize", "sql", "api", "debug"]);

const CODE_PROVIDER_ORDER = [
  { name: "nvidia", model: "qwen/qwen3.5-122b-a10b" },
  { name: "nvidia", model: "deepseek-ai/deepseek-v4-flash" },
  { name: "nvidia", model: "qwen/qwen3-next-80b-a3b-instruct" },
  { name: "nvidia", model: "deepseek-ai/deepseek-v4-pro" },
  { name: "groq" },
  { name: "openai" },
  { name: "zai" },
  { name: "siliconflow" },
];

function orderProvidersForMode(all, mode) {
  if (!CODE_MODES.has(mode)) return all;
  const picks = [];
  const used = new Set();
  for (const pref of CODE_PROVIDER_ORDER) {
    const match = all.find(
      (p) => p.name === pref.name && (!pref.model || p.model === pref.model) && !used.has(p),
    );
    if (match) {
      picks.push(match);
      used.add(match);
    }
  }
  for (const p of all) {
    if (!used.has(p)) picks.push(p);
  }
  return picks.slice(0, 6);
}

function resolveProviders(mode = "chat") {
  return orderProvidersForMode(buildAllProviders(), mode);
}

function buildMessages(mode, history, userMessage) {
  let system = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.chat;
  let message = userMessage;
  if (isStaticSiteRequest(mode, userMessage)) {
    system = `${system}\n\n${STATIC_SITE_USER_ENFORCEMENT}`;
    message = `${userMessage}\n\n---\nDeliver: exactly \`\`\`html + \`\`\`css + \`\`\`javascript fences. Full static HTML body (hero, features, testimonials, CTA, footer). No React. No index.js/App.js/Hero.js. No #### file headers. Close every fence with \`\`\`.`;
  }
  return [
    { role: "system", content: system },
    ...history.filter((m) => m.role !== "system"),
    { role: "user", content: message },
  ];
}

function temperatureForRequest(mode, userMessage) {
  return isStaticSiteRequest(mode, userMessage) ? 0.15 : 0.3;
}

function estimateTokens(text) {
  return Math.max(1, Math.ceil(String(text).length / 4));
}

function isBuildHeavyRequest(mode, userMessage) {
  const t = String(userMessage ?? "").toLowerCase();
  if (mode === "generate") return true;
  return /\b(landing|website|saas|full page|complete site|portfolio|web page|homepage)\b/.test(t);
}

function maxTokensForRequest(mode, userMessage) {
  if (isBuildHeavyRequest(mode, userMessage)) {
    return Number(process.env.AI_BUILD_MAX_TOKENS ?? 8192);
  }
  return Number(process.env.AI_MAX_TOKENS ?? 4096);
}

function requestTimeoutMs(mode, userMessage) {
  return isBuildHeavyRequest(mode, userMessage) ? 120_000 : 28_000;
}

async function completeOpenAiChat(provider, messages, requestOpts) {
  const maxTokens = requestOpts?.maxTokens ?? 4096;
  const timeoutMs = requestOpts?.timeoutMs ?? 28_000;
  const temperature = requestOpts?.temperature ?? 0.3;
  const res = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(timeoutMs),
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

async function completeGeminiChat(provider, messages, requestOpts) {
  const maxTokens = requestOpts?.maxTokens ?? 4096;
  const timeoutMs = requestOpts?.timeoutMs ?? 28_000;
  const temperature = requestOpts?.temperature ?? 0.3;
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
      generationConfig: { temperature, maxOutputTokens: maxTokens },
    }),
    signal: AbortSignal.timeout(timeoutMs),
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

async function streamOpenAiChat(provider, messages, onDelta, requestOpts) {
  const maxTokens = requestOpts?.maxTokens ?? 4096;
  const timeoutMs = requestOpts?.timeoutMs ?? 28_000;
  const temperature = requestOpts?.temperature ?? 0.3;
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
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
    signal: AbortSignal.timeout(timeoutMs),
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
  const providers = resolveProviders(mode);
  if (!providers.length) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY on Vercel.",
    );
  }
  const messages = buildMessages(mode, history, userMessage);
  const requestOpts = {
    maxTokens: maxTokensForRequest(mode, userMessage),
    timeoutMs: requestTimeoutMs(mode, userMessage),
    temperature: temperatureForRequest(mode, userMessage),
  };
  const errors = [];
  for (const provider of providers) {
    try {
      if (provider.kind === "gemini") {
        if (onDelta) throw new Error("gemini streaming skipped");
        return await completeGeminiChat(provider, messages, requestOpts);
      }
      if (onDelta) return await streamOpenAiChat(provider, messages, onDelta, requestOpts);
      return await completeOpenAiChat(provider, messages, requestOpts);
    } catch (err) {
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }
  throw new Error(errors.join("; ") || "All AI providers failed");
}

function listModelOptions(mode) {
  return resolveProviders(mode).map((p) => ({
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
      const result = await runAiChat(mode, history, message, (delta) => send({ type: "delta", content: delta }));
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
  const result = await runAiChat(mode, history, message);
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
