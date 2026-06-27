import http from "node:http";
import https from "node:https";
import tls from "node:tls";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates });

export type AiMode = "chat" | "debug" | "explain" | "generate" | "convert" | "optimize" | "sql" | "api" | "errors";
export type AiProvider = "groq" | "ollama" | "openai";

const SYSTEM_PROMPTS: Record<AiMode, string> = {
  chat: "You are DevTool Blog's AI Developer Assistant. Help developers with code, architecture, and best practices. Use markdown and code blocks.",
  debug: "You are an expert debugger. Analyze code, find bugs, explain root causes, and suggest minimal fixes. Use markdown.",
  explain: "You are a patient senior engineer. Explain code clearly for developers at all levels. Use markdown and examples.",
  generate: "You generate clean, production-ready code with brief comments. Output code in fenced blocks with language tags.",
  convert: "You convert code between programming languages accurately, preserving logic. Show converted code in fenced blocks.",
  optimize: "You optimize code for performance, readability, and maintainability. Show before/after with explanations.",
  sql: "You write correct SQL for PostgreSQL. Explain queries briefly. Use sql fenced blocks.",
  api: "You design REST API endpoints with request/response examples. Use OpenAPI-style descriptions and JSON examples.",
  errors: "You explain error messages and stack traces. Provide root cause and step-by-step fixes.",
};

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
};

function resolveProviders(): ProviderConfig[] {
  const preferred = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const all: ProviderConfig[] = [];

  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    all.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
    });
  }

  const ollamaKey = process.env.OLLAMA_API_KEY?.trim();
  const ollamaBase = (process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1").replace(/\/$/, "");
  if (ollamaKey || ollamaBase.includes("localhost") || ollamaBase.includes("127.0.0.1")) {
    all.push({
      name: "ollama",
      url: `${ollamaBase}/chat/completions`,
      apiKey: ollamaKey || "ollama",
      model: process.env.OLLAMA_MODEL?.trim() || "gemma3:4b",
    });
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey?.startsWith("sk-")) {
    all.push({
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    });
  }

  if (preferred !== "auto") {
    const picked = all.filter((p) => p.name === preferred);
    if (picked.length) return picked;
  }

  return all;
}

function postJson(url: string, apiKey: string, body: unknown): Promise<{ status: number; text: string }> {
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
          "Content-Length": Buffer.byteLength(payload),
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

function parseProviderError(provider: AiProvider, status: number, text: string): string {
  try {
    const json = JSON.parse(text) as { error?: { message?: string; type?: string; code?: string } };
    const msg = json.error?.message;
    if (msg) {
      if (provider === "openai" && (status === 429 || json.error?.type === "insufficient_quota")) {
        return "OpenAI quota exceeded. Add billing or use GROQ_API_KEY (free tier at console.groq.com).";
      }
      if (provider === "ollama" && status === 403 && msg.includes("subscription")) {
        return "Ollama model requires a paid plan. Set OLLAMA_MODEL to a free cloud model (e.g. gemma3:4b, gpt-oss:120b) or upgrade at ollama.com/upgrade.";
      }
      if (provider === "ollama" && status === 404) {
        return `Ollama model not found. List models at GET ${process.env.OLLAMA_BASE_URL?.trim() || "https://ollama.com/v1"}/models and set OLLAMA_MODEL.`;
      }
      return `${provider}: ${msg}`;
    }
  } catch {
    /* fall through */
  }
  return `${provider} API error (${status}): ${text.slice(0, 200)}`;
}

export async function completeAiChat(opts: {
  mode: AiMode;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  userMessage: string;
}): Promise<{ content: string; tokensIn: number; tokensOut: number }> {
  const providers = resolveProviders();
  if (!providers.length) {
    throw new Error(
      "No AI provider configured. Add GROQ_API_KEY (free at console.groq.com) to .env and restart the API server.",
    );
  }

  const system = SYSTEM_PROMPTS[opts.mode];
  const chatBody = {
    messages: [
      { role: "system", content: system },
      ...opts.messages.filter((m) => m.role !== "system"),
      { role: "user", content: opts.userMessage },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };

  const errors: string[] = [];

  for (const provider of providers) {
    const body = { ...chatBody, model: provider.model };
    try {
      const response = await postJson(provider.url, provider.apiKey, body);
      if (response.status >= 200 && response.status < 300) {
        const data = JSON.parse(response.text) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const content = data.choices?.[0]?.message?.content?.trim() ?? "";
        if (!content) {
          errors.push(`${provider.name}: empty response`);
          continue;
        }
        return {
          content,
          tokensIn: data.usage?.prompt_tokens ?? 0,
          tokensOut: data.usage?.completion_tokens ?? 0,
        };
      }
      errors.push(parseProviderError(provider.name, response.status, response.text));
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
} {
  const providers = resolveProviders();
  return {
    configured: providers.length > 0,
    provider: providers[0]?.name ?? "none",
    providers: providers.map((p) => ({ name: p.name, model: p.model })),
  };
}
