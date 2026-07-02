import http from "node:http";
import https from "node:https";
import tls from "node:tls";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates as unknown as string[] });

export type NimAiMode =
  | "chat"
  | "debug"
  | "explain"
  | "generate"
  | "convert"
  | "optimize"
  | "sql"
  | "api"
  | "errors";

export const NVIDIA_NIM_BASE = "https://integrate.api.nvidia.com/v1";

/** Free open-source models on build.nvidia.com — https://docs.api.nvidia.com/nim/reference/llm-apis */
export const NVIDIA_NIM_CHAT_MODELS = {
  general: [
    "qwen/qwen3.5-122b-a10b",
    "qwen/qwen3-next-80b-a3b-instruct",
    "deepseek-ai/deepseek-v4-pro",
    "deepseek-ai/deepseek-v4-flash",
    "mistralai/mistral-small-4-119b-2603",
    "google/gemma-4-31b-it",
    "minimaxai/minimax-m2.7",
    "abacusai/dracarys-llama-3.1-70b-instruct",
    "meta/llama-3.3-70b-instruct",
    "nvidia/nemotron-3-nano-30b-a3b",
    "openai/gpt-oss-20b",
  ],
  code: [
    "qwen/qwen3.5-122b-a10b",
    "qwen/qwen3-next-80b-a3b-instruct",
    "nvidia/nemotron-3-nano-30b-a3b",
    "mistralai/mistral-small-4-119b-2603",
    "deepseek-ai/deepseek-v4-pro",
    "deepseek-ai/deepseek-v4-flash",
    "meta/llama-3.3-70b-instruct",
    "openai/gpt-oss-20b",
  ],
  reasoning: [
    "deepseek-ai/deepseek-v4-pro",
    "google/gemma-4-31b-it",
    "qwen/qwq-32b",
    "microsoft/phi-4-mini-flash-reasoning",
    "moonshotai/kimi-k2-thinking",
    "meta/llama-3.3-70b-instruct",
  ],
} as const;

/** Free image models — https://docs.nvidia.com/nim/visual-genai/latest/api/openai-image-generation.html */
export const NVIDIA_NIM_IMAGE_MODELS = [
  "qwen/qwen-image",
  "qwen/qwen-image-edit",
  "black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-dev",
  "stabilityai/stable-diffusion-3.5-large",
] as const;

/** Optional per-model request body (from build.nvidia.com model cards). */
const NVIDIA_NIM_MODEL_EXTRAS: Record<string, Record<string, unknown>> = {
  "deepseek-ai/deepseek-v4-pro": { chat_template_kwargs: { thinking: false } },
  "google/gemma-4-31b-it": { chat_template_kwargs: { enable_thinking: true } },
  "meta/llama-3.3-70b-instruct": { temperature: 0.2, top_p: 0.7 },
};

let modelKeyMapCache: Record<string, string> | null = null;

function getModelKeyMap(): Record<string, string> {
  if (modelKeyMapCache) return modelKeyMapCache;
  modelKeyMapCache = {};
  const raw = process.env.NVIDIA_MODEL_API_KEYS?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      for (const [model, key] of Object.entries(parsed)) {
        const k = key?.trim();
        if (k?.startsWith("nvapi-")) modelKeyMapCache[model] = k;
      }
    } catch {
      /* invalid JSON */
    }
  }
  return modelKeyMapCache;
}

function isNimImageModelId(model: string): boolean {
  const id = model.toLowerCase();
  return (
    id.includes("flux") ||
    id.includes("stable-diffusion") ||
    id.includes("qwen-image") ||
    id.endsWith("/image")
  );
}

export function getNimModelExtraBody(model: string): Record<string, unknown> | undefined {
  return NVIDIA_NIM_MODEL_EXTRAS[model];
}

const CODE_MODES: NimAiMode[] = ["generate", "convert", "optimize", "sql", "api", "debug"];
const REASONING_MODES: NimAiMode[] = ["explain", "errors"];

export type NvidiaKeyPurpose = "default" | "chat" | "code" | "reasoning" | "image";

function readEnvKey(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v?.startsWith("nvapi-")) return v;
  }
  return undefined;
}

/** Per-purpose API keys from build.nvidia.com (separate from model ID env vars). */
export function getNvidiaApiKey(purpose: NvidiaKeyPurpose = "default"): string | undefined {
  const purposeKeys: Record<Exclude<NvidiaKeyPurpose, "default">, string[]> = {
    chat: ["NVIDIA_CHAT_KEY", "NVIDIA_CHAT_API_KEY"],
    code: ["NVIDIA_CODE_KEY", "NVIDIA_CODE_API_KEY"],
    reasoning: ["NVIDIA_REASONING_KEY", "NVIDIA_REASONING_API_KEY"],
    image: ["NVIDIA_IMAGE_KEY", "NVIDIA_IMAGE_API_KEY"],
  };

  if (purpose !== "default") {
    const keyed = readEnvKey(...purposeKeys[purpose]);
    if (keyed) return keyed;
    return getNvidiaApiKey("default");
  }

  return readEnvKey("NVIDIA_API_KEY", "NVIDIA_MODEL_KEY");
}

export function getNvidiaApiKeyForMode(mode: NimAiMode): string | undefined {
  if (CODE_MODES.includes(mode)) return getNvidiaApiKey("code");
  if (REASONING_MODES.includes(mode)) return getNvidiaApiKey("reasoning");
  return getNvidiaApiKey("chat");
}

export function getNvidiaApiKeyForModel(model: string): string | undefined {
  const mapped = getModelKeyMap()[model];
  if (mapped) return mapped;

  const id = model.toLowerCase();
  if (
    id.includes("coder") ||
    id.includes("codegemma") ||
    id.includes("usdcode") ||
    id.includes("qwen3-next") ||
    id.includes("qwen3.5") ||
    id.includes("mistral-small") ||
    id.includes("nemotron")
  ) {
    return getNvidiaApiKey("code");
  }
  if (id.includes("qwq") || id.includes("reasoning") || id.includes("thinking") || id.includes("kimi-k2")) {
    return getNvidiaApiKey("reasoning");
  }
  return getNvidiaApiKey("chat");
}

function readEnvModel(...names: string[]): string | undefined {
  for (const name of names) {
    const v = process.env[name]?.trim();
    // Model IDs use org/name; ignore mistaken nvapi- keys in model slots
    if (v && !v.startsWith("nvapi-")) return v;
  }
  return undefined;
}

export function isNvidiaNimConfigured(): boolean {
  const keyed = Object.keys(getModelKeyMap()).length > 0;
  return Boolean(
    keyed ||
      getNvidiaApiKey("default") ||
      getNvidiaApiKey("chat") ||
      getNvidiaApiKey("code") ||
      getNvidiaApiKey("reasoning") ||
      getNvidiaApiKey("image"),
  );
}

function uniqueModels(models: string[]): string[] {
  const seen = new Set<string>();
  return models.filter((m) => {
    if (!m || seen.has(m)) return false;
    seen.add(m);
    return true;
  });
}

export function listNimImageModels(): string[] {
  const keyed = Object.keys(getModelKeyMap()).filter(isNimImageModelId);
  return uniqueModels([...keyed, ...NVIDIA_NIM_IMAGE_MODELS]);
}

export function pickNimChatModels(mode: NimAiMode): string[] {
  const single = readEnvModel("NVIDIA_MODEL");
  if (single) return [single];

  const lists: string[] = [];
  if (CODE_MODES.includes(mode)) {
    const code = readEnvModel("NVIDIA_CODE_MODEL");
    if (code) lists.push(code);
    lists.push(...NVIDIA_NIM_CHAT_MODELS.code);
  } else if (REASONING_MODES.includes(mode)) {
    const reasoning = readEnvModel("NVIDIA_REASONING_MODEL");
    if (reasoning) lists.push(reasoning);
    lists.push(...NVIDIA_NIM_CHAT_MODELS.reasoning);
  } else {
    const chat = readEnvModel("NVIDIA_CHAT_MODEL");
    if (chat) lists.push(chat);
    lists.push(...NVIDIA_NIM_CHAT_MODELS.general);
  }

  const keyed = Object.keys(getModelKeyMap()).filter((m) => !isNimImageModelId(m));
  lists.push(...keyed);

  return uniqueModels(lists);
}

export function pickNimImageModel(): string {
  return (
    readEnvModel("NVIDIA_IMAGE_MODEL", "NVIDIA_IMAGE_MODEL_DEFAULT") ||
    listNimImageModels()[0] ||
    NVIDIA_NIM_IMAGE_MODELS[0]
  );
}

export function nimPostJson(
  path: string,
  body: unknown,
  apiKey?: string,
): Promise<{ status: number; text: string }> {
  const key = apiKey ?? getNvidiaApiKey("default");
  if (!key) {
    return Promise.resolve({ status: 401, text: JSON.stringify({ error: { message: "NVIDIA API key not set" } }) });
  }

  const url = `${NVIDIA_NIM_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: "POST",
        agent: httpsAgent,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Accept: "application/json",
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
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

export type NimGeneratedImage = {
  url?: string;
  b64Json?: string;
  revisedPrompt?: string;
};

export async function generateNimImage(opts: {
  prompt: string;
  model?: string;
  size?: string;
  n?: number;
}): Promise<{ images: NimGeneratedImage[]; model: string }> {
  const model = opts.model?.trim() || pickNimImageModel();
  const response = await nimPostJson(
    "/images/generations",
    {
      model,
      prompt: opts.prompt,
      n: opts.n ?? 1,
      size: opts.size ?? "1024x1024",
      response_format: "b64_json",
    },
    getNvidiaApiKeyForModel(model) ?? getNvidiaApiKey("image"),
  );

  if (response.status < 200 || response.status >= 300) {
    let msg = `NVIDIA image API error (${response.status})`;
    try {
      const json = JSON.parse(response.text) as { error?: { message?: string } };
      if (json.error?.message) msg = json.error.message;
    } catch {
      msg = `${msg}: ${response.text.slice(0, 200)}`;
    }
    throw new Error(msg);
  }

  const data = JSON.parse(response.text) as {
    data?: Array<{ url?: string; b64_json?: string; revised_prompt?: string }>;
  };

  const images: NimGeneratedImage[] = (data.data ?? []).map((item) => ({
    url: item.url,
    b64Json: item.b64_json,
    revisedPrompt: item.revised_prompt,
  }));

  if (!images.length) {
    throw new Error("NVIDIA image API returned no images");
  }

  return { images, model };
}

export function getNvidiaNimCatalog() {
  return {
    configured: isNvidiaNimConfigured(),
    baseUrl: NVIDIA_NIM_BASE,
    chat: NVIDIA_NIM_CHAT_MODELS,
    image: NVIDIA_NIM_IMAGE_MODELS,
    envVars: {
      key: "NVIDIA_API_KEY",
      chatKey: "NVIDIA_CHAT_KEY",
      codeKey: "NVIDIA_CODE_KEY",
      reasoningKey: "NVIDIA_REASONING_KEY",
      imageKey: "NVIDIA_IMAGE_KEY",
      modelKey: "NVIDIA_MODEL_KEY",
      modelApiKeys: "NVIDIA_MODEL_API_KEYS",
      model: "NVIDIA_MODEL",
      chatModel: "NVIDIA_CHAT_MODEL",
      codeModel: "NVIDIA_CODE_MODEL",
      reasoningModel: "NVIDIA_REASONING_MODEL",
      imageModel: "NVIDIA_IMAGE_MODEL",
    },
    signupUrl: "https://build.nvidia.com/models",
  };
}
