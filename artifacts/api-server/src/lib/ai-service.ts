import http from "node:http";
import https from "node:https";
import tls from "node:tls";
import { getNvidiaApiKey, getNvidiaApiKeyForMode, getNvidiaApiKeyForModel, getNimModelExtraBody, pickNimChatModels, NVIDIA_NIM_BASE, getNvidiaNimCatalog, isNvidiaNimConfigured } from "./integrations/nvidia-nim";
import { formatAiModelLabel, shortModelName } from "./model-labels";
import { inferModelCategory, parseCategoryModelId, pickProvidersForAuto, pickProvidersForCategory, pickProvidersForMode, resolveModelSelection, type AiModelCategory } from "./ai-model-categories";
import {
  buildSystemPrompt,
  MODE_HINTS,
  STATIC_SITE_USER_ENFORCEMENT,
  isStaticSiteRequest,
} from "./ai-instructions";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates as unknown as string[] });

export type AiMode = "chat" | "debug" | "explain" | "generate" | "convert" | "optimize" | "sql" | "api" | "errors";

/** Providers wired into the free-only AI chat fallback chain. */
export type AiProvider =
  | "zai"
  | "groq"
  | "ollama"
  | "gemini"
  | "cerebras"
  | "nvidia"
  | "deepseek"
  | "openai"
  | "sambanova"
  | "huggingface"
  | "openrouter"
  | "modelscope"
  | "siliconflow";

const SYSTEM_PROMPTS: Record<AiMode, string> = Object.fromEntries(
  (Object.keys(MODE_HINTS) as AiMode[]).map((mode) => [
    mode,
    buildSystemPrompt(MODE_HINTS[mode] ?? "", mode),
  ]),
) as Record<AiMode, string>;

export function modeFromPath(segment: string): AiMode {
  const map: Record<string, AiMode> = {
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

type ProviderConfig = {
  name: AiProvider;
  url: string;
  apiKey: string;
  model: string;
  kind?: "chat";
  extraBody?: Record<string, unknown>;
  extraHeaders?: Record<string, string>;
};

function buildProvider(
  name: AiProvider,
  url: string,
  apiKey: string,
  model: string,
  opts?: { kind?: "chat"; extraBody?: Record<string, unknown>; extraHeaders?: Record<string, string> },
): ProviderConfig {
  return { name, url, apiKey, model, kind: opts?.kind, extraBody: opts?.extraBody, extraHeaders: opts?.extraHeaders };
}

function envKey(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k]?.trim();
    if (v) return v;
  }
  return undefined;
}

/** Z.ai Open Platform — OpenAI-compatible chat API (https://docs.z.ai/guides/overview/quick-start) */
function addZaiProviders(all: ProviderConfig[]) {
  const zaiBase = (process.env.ZAI_BASE_URL?.trim() || "https://api.z.ai/api/paas/v4").replace(/\/$/, "");
  const zaiUrl = `${zaiBase}/chat/completions`;

  const flashModels: Array<{ keyEnv: string; modelEnv: string; defaultModel: string }> = [
    { keyEnv: "ZAI_GLM_47_FLASH_KEY", modelEnv: "ZAI_GLM_47_FLASH_MODEL", defaultModel: "glm-4.7-flash" },
    { keyEnv: "ZAI_GLM_45_FLASH_KEY", modelEnv: "ZAI_GLM_45_FLASH_MODEL", defaultModel: "glm-4.5-flash" },
    { keyEnv: "ZAI_GLM_46V_FLASH_KEY", modelEnv: "ZAI_GLM_46V_FLASH_MODEL", defaultModel: "glm-4.6v-flash" },
  ];

  for (const { keyEnv, modelEnv, defaultModel } of flashModels) {
    const apiKey = process.env[keyEnv]?.trim();
    if (apiKey) {
      const model = process.env[modelEnv]?.trim() || defaultModel;
      const extraBody = model.includes("4.7")
        ? { reasoning_effort: "none" as const }
        : model.includes("4.6v")
          ? { thinking: { type: "disabled" as const } }
          : undefined;
      all.push(buildProvider("zai", zaiUrl, apiKey, model, { extraBody }));
    }
  }

  const sharedKey = process.env.ZAI_API_KEY?.trim();
  if (sharedKey && !flashModels.some(({ keyEnv }) => process.env[keyEnv]?.trim())) {
    all.push(buildProvider("zai", zaiUrl, sharedKey, process.env.ZAI_MODEL?.trim() || "glm-4.7-flash"));
  }
}

type SimpleProviderDef = {
  id: AiProvider;
  keyEnv: string;
  url: string;
  modelEnv: string;
  defaultModel: string;
  extraHeaders?: () => Record<string, string> | undefined;
};

/** OpenAI-compatible providers with a documented free tier (no paid fallback in chat). */
const FREE_CHAT_PROVIDERS: SimpleProviderDef[] = [
  {
    id: "groq",
    keyEnv: "GROQ_API_KEY",
    url: "https://api.groq.com/openai/v1/chat/completions",
    modelEnv: "GROQ_MODEL",
    defaultModel: "llama-3.3-70b-versatile",
  },
  {
    id: "gemini",
    keyEnv: "GEMINI_API_KEY",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-2.0-flash",
  },
  {
    id: "cerebras",
    keyEnv: "CEREBRAS_API_KEY",
    url: "https://api.cerebras.ai/v1/chat/completions",
    modelEnv: "CEREBRAS_MODEL",
    defaultModel: "llama-3.3-70b",
  },
  {
    id: "sambanova",
    keyEnv: "SAMBANOVA_API_KEY",
    url: "https://api.sambanova.ai/v1/chat/completions",
    modelEnv: "SAMBANOVA_MODEL",
    defaultModel: "Meta-Llama-3.3-70B-Instruct",
  },
  {
    id: "huggingface",
    keyEnv: "HF_TOKEN",
    url: "https://router.huggingface.co/v1/chat/completions",
    modelEnv: "HF_MODEL",
    defaultModel: "meta-llama/Llama-3.1-8B-Instruct",
  },
  {
    id: "openrouter",
    keyEnv: "OPENROUTER_API_KEY",
    url: "https://openrouter.ai/api/v1/chat/completions",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "meta-llama/llama-3.3-70b-instruct:free",
    extraHeaders: () => {
      const siteUrl = process.env.SITE_URL?.trim();
      if (!siteUrl) return undefined;
      return { "HTTP-Referer": siteUrl, "X-OpenRouter-Title": "TechVentry" };
    },
  },
  {
    id: "modelscope",
    keyEnv: "MODELSCOPE_API_KEY",
    url: "https://api-inference.modelscope.cn/v1/chat/completions",
    modelEnv: "MODELSCOPE_MODEL",
    defaultModel: "Qwen/Qwen2.5-72B-Instruct",
  },
  {
    id: "siliconflow",
    keyEnv: "SILICONFLOW_API_KEY",
    url: "https://api.siliconflow.com/v1/chat/completions",
    modelEnv: "SILICONFLOW_MODEL",
    defaultModel: "deepseek-ai/DeepSeek-V3",
  },
  {
    id: "deepseek",
    keyEnv: "DEEPSEEK_API_KEY",
    url: "https://api.deepseek.com/v1/chat/completions",
    modelEnv: "DEEPSEEK_MODEL",
    defaultModel: "deepseek-chat",
  },
  {
    id: "openai",
    keyEnv: "OPENAI_API_KEY",
    url: "https://api.openai.com/v1/chat/completions",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-4o-mini",
  },
];

/** NVIDIA NIM — free open models from build.nvidia.com, mode-aware model picks */
function addNvidiaProviders(all: ProviderConfig[], mode: AiMode) {
  const url = `${NVIDIA_NIM_BASE}/chat/completions`;
  for (const model of pickNimChatModels(mode)) {
    const apiKey = getNvidiaApiKeyForModel(model) ?? getNvidiaApiKeyForMode(mode);
    if (!apiKey) continue;
    const extra = getNimModelExtraBody(model);
    all.push(buildProvider("nvidia", url, apiKey, model, extra ? { extraBody: extra } : undefined));
  }
}

function addOllamaProvider(all: ProviderConfig[]) {
  const ollamaKey = process.env.OLLAMA_API_KEY?.trim();
  const ollamaBase = (process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1").replace(/\/$/, "");
  if (ollamaKey || ollamaBase.includes("localhost") || ollamaBase.includes("127.0.0.1")) {
    all.push(
      buildProvider(
        "ollama",
        `${ollamaBase}/chat/completions`,
        ollamaKey || "ollama",
        process.env.OLLAMA_MODEL?.trim() || "gemma3:4b",
      ),
    );
  }
}

function shouldUseDirectDeepseek(): boolean {
  const flag = process.env.DEEPSEEK_DISABLED?.trim().toLowerCase();
  if (flag === "1" || flag === "true" || flag === "yes") return false;
  if (!envKey("DEEPSEEK_API_KEY")) return false;
  // Prefer free NVIDIA NIM — avoids paid api.deepseek.com "Insufficient Balance" errors.
  if (isNvidiaNimConfigured()) return false;
  return true;
}

function buildConfiguredProviders(mode: AiMode = "chat"): ProviderConfig[] {
  const all: ProviderConfig[] = [];
  addZaiProviders(all);
  addNvidiaProviders(all, mode);
  for (const def of FREE_CHAT_PROVIDERS) {
    if (def.id === "deepseek" && !shouldUseDirectDeepseek()) continue;
    const apiKey = envKey(def.keyEnv);
    if (!apiKey) continue;
    all.push(
      buildProvider(
        def.id,
        def.url,
        apiKey,
        process.env[def.modelEnv]?.trim() || def.defaultModel,
        { extraHeaders: def.extraHeaders?.() },
      ),
    );
  }
  addOllamaProvider(all);
  return all;
}

export type AiModelSelection = { provider: string; model: string };

export type AiModelOption = {
  id: string;
  provider: string;
  model: string;
  label: string;
  category: AiModelCategory;
};

export function modelOptionId(provider: string, model: string): string {
  return `${provider}::${model}`;
}

export function parseModelOptionId(id: string): AiModelSelection | null {
  if (!id || id === "auto" || id.startsWith("category::")) return null;
  const sep = id.indexOf("::");
  if (sep <= 0) return null;
  const provider = id.slice(0, sep);
  const model = id.slice(sep + 2);
  if (!provider || !model) return null;
  return { provider, model };
}

export function resolveModelOptionId(id: string | undefined, mode: AiMode = "chat"): AiModelSelection | null {
  const all = buildConfiguredProviders(mode);
  return resolveModelSelection(id, all);
}

export function listAiModelOptions(mode: AiMode = "chat"): AiModelOption[] {
  return [
    { id: "auto", provider: "auto", model: "auto", label: "Auto", category: "chat" },
    { id: "category::chat", provider: "category", model: "chat", label: "Text & reasoning", category: "chat" },
    { id: "category::code", provider: "category", model: "code", label: "Code", category: "code" },
  ];
}

const STREAM_FIRST_TOKEN_MS = Number(process.env.AI_STREAM_FIRST_TOKEN_MS ?? 8_000);

function resolveProviders(mode: AiMode = "chat", modelId?: string | null): ProviderConfig[] {
  const all = buildConfiguredProviders(mode);
  const category = modelId ? parseCategoryModelId(modelId) : null;

  if (category) {
    const max = category === "code" ? 6 : 3;
    return pickProvidersForCategory(category, all, max)
      .map((sel) => all.find((p) => p.name === sel.provider && p.model === sel.model))
      .filter((p): p is ProviderConfig => p != null);
  }

  const selection = resolveModelSelection(modelId ?? undefined, all);

  if (selection) {
    const match = all.find((p) => p.name === selection.provider && p.model === selection.model);
    return match ? [match] : [];
  }

  const chatProviders = all;

  const preferred = (process.env.AI_PROVIDER || "auto").toLowerCase();
  if (preferred !== "auto") {
    const picked = chatProviders.find((p) => p.name === preferred);
    if (picked) return [picked];
  }

  const autoMax = mode === "generate" ? 6 : mode === "convert" || mode === "optimize" ? 4 : 3;
  return pickProvidersForMode(mode, all, autoMax)
    .map((sel) => all.find((p) => p.name === sel.provider && p.model === sel.model))
    .filter((p): p is ProviderConfig => p != null);
}

function postJson(
  url: string,
  apiKey: string,
  body: unknown,
  extraHeaders?: Record<string, string>,
): Promise<{ status: number; text: string }> {
  const payload = JSON.stringify(body);
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: "POST",
        agent: isHttps ? httpsAgent : undefined,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept-Language": "en-US,en",
          "Content-Length": Buffer.byteLength(payload),
          ...extraHeaders,
        },
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => resolve({ status: res.statusCode ?? 500, text }));
      },
    );
    req.on("error", (err) => reject(err));
    req.write(payload);
    req.end();
  });
}

function parseProviderError(provider: AiProvider, status: number, text: string, model?: string): string {
  try {
    const json = JSON.parse(text) as { error?: { message?: string; type?: string; code?: string }; detail?: string };
    const msg = json.error?.message ?? json.detail;
    if (msg) {
      if (provider === "ollama" && status === 403 && msg.includes("subscription")) {
        return "Ollama model requires a paid plan. Set OLLAMA_MODEL to a free cloud model (e.g. gemma3:4b, gpt-oss:120b) or upgrade at ollama.com/upgrade.";
      }
      if (provider === "ollama" && status === 404) {
        return `Ollama model not found. List models at GET ${process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1"}/models and set OLLAMA_MODEL.`;
      }
      if (provider === "zai" && (status === 429 || json.error?.code === "1305")) {
        return "Z.ai model temporarily overloaded — trying next provider.";
      }
      if (provider === "zai" && json.error?.code === "1301") {
        return "Z.ai content filter triggered — trying next provider.";
      }
      if (provider === "nvidia" && status === 429) {
        return "NVIDIA NIM rate limited — trying next model or provider.";
      }
      if (status === 410 || msg.toLowerCase().includes("end of life")) {
        const name = model ? shortModelName(model) : "selected model";
        return `${provider}: ${name} was retired by NVIDIA — pick another model or use Auto.`;
      }
      return `${provider}: ${msg}`;
    }
  } catch {
    /* fall through */
  }
  return `${provider} API error (${status}): ${text.slice(0, 200)}`;
}

function buildChatMessages(
  mode: AiMode,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  userMessage: string,
) {
  let system = SYSTEM_PROMPTS[mode];
  let message = userMessage;
  if (isStaticSiteRequest(mode, userMessage)) {
    system = `${system}\n\n${STATIC_SITE_USER_ENFORCEMENT}`;
    message = `${userMessage}\n\n---\nDeliver: exactly \`\`\`html + \`\`\`css + \`\`\`javascript fences. Full static HTML body (hero, features, testimonials, CTA, footer). No React. No index.js/App.js/Hero.js. No #### file headers. Close every fence with \`\`\`.`;
  }
  return {
    messages: [
      { role: "system" as const, content: system },
      ...messages.filter((m) => m.role !== "system"),
      { role: "user" as const, content: message },
    ],
    temperature: temperatureForRequest(mode, userMessage),
    max_tokens: maxTokensForRequest(mode, userMessage),
  };
}

function temperatureForRequest(mode: AiMode, userMessage: string): number {
  return isStaticSiteRequest(mode, userMessage) ? 0.15 : 0.3;
}

function isBuildHeavyRequest(mode: AiMode, userMessage: string): boolean {
  const t = userMessage.toLowerCase();
  if (mode === "generate") return true;
  return /\b(landing|website|saas|full page|complete site|portfolio|web page|homepage)\b/.test(t);
}

function maxTokensForRequest(mode: AiMode, userMessage: string): number {
  if (isBuildHeavyRequest(mode, userMessage)) {
    return Number(process.env.AI_BUILD_MAX_TOKENS ?? 8192);
  }
  return Number(process.env.AI_MAX_TOKENS ?? 4096);
}

function streamTimeoutMs(mode: AiMode, userMessage: string): number {
  return isBuildHeavyRequest(mode, userMessage) ? 120_000 : 45_000;
}

function parseSseDelta(line: string): string {
  if (!line.startsWith("data:")) return "";
  const data = line.slice(5).trim();
  if (!data || data === "[DONE]") return "";
  try {
    const json = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string; reasoning_content?: string } }>;
    };
    const delta = json.choices?.[0]?.delta;
    return delta?.content ?? delta?.reasoning_content ?? "";
  } catch {
    return "";
  }
}

function streamChatCompletion(
  url: string,
  apiKey: string,
  body: Record<string, unknown>,
  onDelta: (text: string) => void,
  extraHeaders?: Record<string, string>,
  opts?: { firstTokenMs?: number },
): Promise<{ status: number; errorText?: string; timedOut?: boolean }> {
  const payload = JSON.stringify({ ...body, stream: true });
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    let settled = false;
    let gotToken = false;
    let firstTokenTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = (result: { status: number; errorText?: string; timedOut?: boolean }) => {
      if (settled) return;
      settled = true;
      if (firstTokenTimer) clearTimeout(firstTokenTimer);
      resolve(result);
    };

    const req = lib.request(
      url,
      {
        method: "POST",
        agent: isHttps ? httpsAgent : undefined,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Accept-Language": "en-US,en",
          "Content-Length": Buffer.byteLength(payload),
          ...extraHeaders,
        },
      },
      (res) => {
        const status = res.statusCode ?? 500;
        if (status < 200 || status >= 300) {
          let errorText = "";
          res.on("data", (chunk) => {
            errorText += chunk;
          });
          res.on("end", () => finish({ status, errorText }));
          return;
        }

        if (opts?.firstTokenMs) {
          firstTokenTimer = setTimeout(() => {
            if (!gotToken) {
              req.destroy();
              finish({ status: 408, errorText: "First token timeout", timedOut: true });
            }
          }, opts.firstTokenMs);
        }

        let buffer = "";
        res.on("data", (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const text = parseSseDelta(line.trim());
            if (text) {
              gotToken = true;
              if (firstTokenTimer) clearTimeout(firstTokenTimer);
              onDelta(text);
            }
          }
        });
        res.on("end", () => {
          if (buffer.trim()) {
            const text = parseSseDelta(buffer.trim());
            if (text) {
              gotToken = true;
              if (firstTokenTimer) clearTimeout(firstTokenTimer);
              onDelta(text);
            }
          }
          finish({ status });
        });
      },
    );
    req.on("error", (err) => {
      if (settled) return;
      settled = true;
      if (firstTokenTimer) clearTimeout(firstTokenTimer);
      reject(err);
    });
    req.write(payload);
    req.end();
  });
}

export async function streamAiChat(opts: {
  mode: AiMode;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  userMessage: string;
  modelId?: string | null;
  onDelta: (text: string) => void;
}): Promise<{ content: string; tokensIn: number; tokensOut: number; provider: string; model: string }> {
  const providers = resolveProviders(opts.mode, opts.modelId);
  if (!providers.length) {
    if (opts.modelId && opts.modelId !== "auto") {
      const cat = parseCategoryModelId(opts.modelId);
      throw new Error(
        cat
          ? `No ${cat} model available. Check API keys or pick Auto.`
          : `Model "${opts.modelId}" is not available. Check API keys or pick Auto.`,
      );
    }
    throw new Error(
      "No free AI provider configured. Add NVIDIA_API_KEY (build.nvidia.com), ZAI_GLM_47_FLASH_KEY, or GROQ_API_KEY to .env and restart the API server.",
    );
  }

  const chatBody = buildChatMessages(opts.mode, opts.messages, opts.userMessage);
  const firstTokenMs = isBuildHeavyRequest(opts.mode, opts.userMessage)
    ? Number(process.env.AI_BUILD_STREAM_FIRST_TOKEN_MS ?? 30_000)
    : STREAM_FIRST_TOKEN_MS;
  const errors: string[] = [];

  for (const provider of providers) {
    let content = "";
    const body = { ...chatBody, model: provider.model, ...provider.extraBody };
    try {
      const response = await streamChatCompletion(
        provider.url,
        provider.apiKey,
        body,
        (delta) => {
          content += delta;
          opts.onDelta(delta);
        },
        provider.extraHeaders,
        { firstTokenMs },
      );

      if (response.status >= 200 && response.status < 300) {
        const trimmed = content.trim();
        if (!trimmed) {
          errors.push(`${provider.name}: empty response`);
          continue;
        }
        return {
          content: trimmed,
          tokensIn: estimateTokens(JSON.stringify(chatBody.messages)),
          tokensOut: estimateTokens(trimmed),
          provider: provider.name,
          model: provider.model,
        };
      }
      errors.push(parseProviderError(provider.name, response.status, response.errorText ?? "", provider.model));
      if (response.timedOut) {
        errors.push(`${provider.name}: slow response, trying next provider`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  throw new Error(errors.join(" | ") || "All AI providers failed.");
}

export async function completeAiChat(opts: {
  mode: AiMode;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  userMessage: string;
  modelId?: string | null;
}): Promise<{ content: string; tokensIn: number; tokensOut: number; provider: string; model: string }> {
  const providers = resolveProviders(opts.mode, opts.modelId);
  if (!providers.length) {
    if (opts.modelId && opts.modelId !== "auto") {
      const cat = parseCategoryModelId(opts.modelId);
      throw new Error(
        cat
          ? `No ${cat} model available. Check API keys or pick Auto.`
          : `Model "${opts.modelId}" is not available. Check API keys or pick Auto.`,
      );
    }
    throw new Error(
      "No free AI provider configured. Add NVIDIA_API_KEY (build.nvidia.com), ZAI_GLM_47_FLASH_KEY, or GROQ_API_KEY to .env and restart the API server.",
    );
  }

  const chatBody = buildChatMessages(opts.mode, opts.messages, opts.userMessage);

  const errors: string[] = [];

  for (const provider of providers) {
    const body = { ...chatBody, model: provider.model, ...provider.extraBody };
    try {
      const response = await postJson(provider.url, provider.apiKey, body, provider.extraHeaders);
      if (response.status >= 200 && response.status < 300) {
        const data = JSON.parse(response.text) as {
          choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const message = data.choices?.[0]?.message;
        const content = message?.content?.trim() || message?.reasoning_content?.trim() || "";
        if (!content) {
          errors.push(`${provider.name}: empty response`);
          continue;
        }
        return {
          content,
          tokensIn: data.usage?.prompt_tokens ?? 0,
          tokensOut: data.usage?.completion_tokens ?? 0,
          provider: provider.name,
          model: provider.model,
        };
      }
      errors.push(parseProviderError(provider.name, response.status, response.text, provider.model));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      errors.push(`${provider.name}: ${msg}`);
    }
  }

  throw new Error(errors.join(" | ") || "All AI providers failed.");
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function getActiveAiProvider(): string {
  const providers = resolveProviders();
  return providers[0]?.name ?? "none";
}

export function getAiStatus(): {
  configured: boolean;
  provider: string;
  providers: Array<{ name: AiProvider; model: string }>;
  generateProviders?: Array<{ name: AiProvider; model: string }>;
  models: AiModelOption[];
  nvidia?: ReturnType<typeof getNvidiaNimCatalog>;
} {
  const providers = resolveProviders("chat");
  const generateProviders = resolveProviders("generate");
  return {
    configured: providers.length > 0,
    provider: providers[0]?.name ?? "none",
    providers: providers.map((p) => ({ name: p.name, model: p.model })),
    generateProviders: generateProviders.map((p) => ({ name: p.name, model: p.model })),
    models: listAiModelOptions("chat"),
    ...(isNvidiaNimConfigured() ? { nvidia: getNvidiaNimCatalog() } : {}),
  };
}
