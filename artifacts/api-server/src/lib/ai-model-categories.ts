/** Model picker groups + auto-pick best model per category. */

export type AiModelSelection = { provider: string; model: string };

export type AiModelCategory = "chat" | "code";

export const AI_MODEL_CATEGORY_PREFIX = "category::";

export const AI_MODEL_CATEGORIES: Array<{ id: AiModelCategory; label: string; short: string }> = [
  { id: "chat", label: "Text & reasoning", short: "Text" },
  { id: "code", label: "Code", short: "Code" },
];

const CODE_MODEL_IDS = new Set([
  "qwen/qwen3.5-122b-a10b",
  "qwen/qwen3-next-80b-a3b-instruct",
  "nvidia/nemotron-3-nano-30b-a3b",
  "mistralai/mistral-small-4-119b-2603",
  "deepseek-ai/deepseek-v4-flash",
  "meta/llama-3.3-70b-instruct",
  "openai/gpt-oss-20b",
]);

const REASONING_MODEL_IDS = new Set([
  "deepseek-ai/deepseek-v4-pro",
  "google/gemma-4-31b-it",
  "qwen/qwq-32b",
  "microsoft/phi-4-mini-flash-reasoning",
  "moonshotai/kimi-k2-thinking",
]);

const CODE_AI_MODES = new Set([
  "generate",
  "convert",
  "optimize",
  "sql",
  "api",
  "debug",
]);

export function categoryForAiMode(mode: string): AiModelCategory {
  return CODE_AI_MODES.has(mode) ? "code" : "chat";
}

const CATEGORY_PICK_ORDER: Record<
  AiModelCategory,
  Array<{ provider: string; model?: string }>
> = {
  chat: [
    { provider: "groq" },
    { provider: "zai", model: "glm-4.7-flash" },
    { provider: "gemini" },
    { provider: "openai" },
    { provider: "nvidia", model: "meta/llama-3.3-70b-instruct" },
    { provider: "ollama" },
  ],
  code: [
    { provider: "nvidia", model: "qwen/qwen3.5-122b-a10b" },
    { provider: "nvidia", model: "deepseek-ai/deepseek-v4-flash" },
    { provider: "nvidia", model: "qwen/qwen3-next-80b-a3b-instruct" },
    { provider: "nvidia", model: "deepseek-ai/deepseek-v4-pro" },
    { provider: "groq" },
    { provider: "openai" },
    { provider: "zai", model: "glm-4.7-flash" },
    { provider: "siliconflow" },
    { provider: "nvidia", model: "nvidia/nemotron-3-nano-30b-a3b" },
  ],
};

export function inferModelCategory(provider: string, model: string): AiModelCategory {
  const id = model.toLowerCase();
  if (CODE_MODEL_IDS.has(model) || /coder|codegemma|usdcode/i.test(id)) return "code";
  if (REASONING_MODEL_IDS.has(model) || /qwq|reasoning|thinking|kimi-k2/i.test(id)) return "chat";
  if (/qwen3\.5|qwen3-next|nemotron|mistral-small/i.test(id)) return "code";

  return "chat";
}

type ProviderLike = {
  name: string;
  model: string;
};

export function pickBestModelForCategory(
  category: AiModelCategory,
  providers: ProviderLike[],
): AiModelSelection | null {
  const picks = pickProvidersForCategory(category, providers, 1);
  return picks[0] ?? null;
}

/** Fast auto-pick — up to `max` providers in priority order (not the full fallback chain). */
export function pickProvidersForCategory(
  category: AiModelCategory,
  providers: ProviderLike[],
  max = 3,
): AiModelSelection[] {
  const picks: AiModelSelection[] = [];
  const prefs = CATEGORY_PICK_ORDER[category];

  for (const pref of prefs) {
    if (picks.length >= max) break;
    const match = providers.find(
      (p) => p.name === pref.provider && (!pref.model || p.model === pref.model),
    );
    if (match) {
      const sel = { provider: match.name, model: match.model };
      if (!picks.some((p) => p.provider === sel.provider && p.model === sel.model)) {
        picks.push(sel);
      }
    }
  }

  if (!picks.length) {
    const fallback = providers.find((p) => inferModelCategory(p.name, p.model) === category);
    if (fallback) picks.push({ provider: fallback.name, model: fallback.model });
  }

  return picks;
}

export function pickProvidersForAuto(providers: ProviderLike[], max = 3): AiModelSelection[] {
  return pickProvidersForCategory("chat", providers, max);
}

/** Auto-pick chain for a mode — generate/debug/etc. use code-tier models. */
export function pickProvidersForMode(mode: string, providers: ProviderLike[], max = 3): AiModelSelection[] {
  return pickProvidersForCategory(categoryForAiMode(mode), providers, max);
}

export function parseCategoryModelId(id: string): AiModelCategory | null {
  if (!id.startsWith(AI_MODEL_CATEGORY_PREFIX)) return null;
  const cat = id.slice(AI_MODEL_CATEGORY_PREFIX.length) as AiModelCategory;
  return cat === "chat" || cat === "code" ? cat : null;
}

export function resolveModelSelection(
  modelId: string | undefined,
  providers: ProviderLike[],
): AiModelSelection | null {
  if (!modelId || modelId === "auto") return null;

  const category = parseCategoryModelId(modelId);
  if (category) return pickBestModelForCategory(category, providers);

  const sep = modelId.indexOf("::");
  if (sep <= 0) return null;
  const provider = modelId.slice(0, sep);
  const model = modelId.slice(sep + 2);
  if (!provider || !model || provider === "category") return null;
  return { provider, model };
}
