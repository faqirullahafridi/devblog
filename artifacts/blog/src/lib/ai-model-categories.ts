import type { AiModelOption } from "@/lib/platform-api";

/** Model picker groups (mirrors api-server ai-model-categories). */
export type AiModelCategory = "chat" | "code";

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

export function inferModelCategory(option: AiModelOption): AiModelCategory {
  if ((option.category as string | undefined) === "image") return "chat";
  if (option.category) return option.category;
  if (option.id === "auto") return "chat";

  const { model } = option;
  const id = model.toLowerCase();
  if (CODE_MODEL_IDS.has(model) || /coder|codegemma|usdcode/i.test(id)) return "code";
  if (REASONING_MODEL_IDS.has(model) || /qwq|reasoning|thinking|kimi-k2/i.test(id)) return "chat";
  if (/qwen3\.5|qwen3-next|nemotron|mistral-small/i.test(id)) return "code";

  return "chat";
}

export function groupModelsByCategory(models: AiModelOption[]): Record<AiModelCategory, AiModelOption[]> {
  const groups: Record<AiModelCategory, AiModelOption[]> = { chat: [], code: [] };
  for (const m of models) {
    if (m.id === "auto") continue;
    groups[inferModelCategory(m)].push(m);
  }
  return groups;
}

export function categoryForModelId(models: AiModelOption[], modelId: string): AiModelCategory {
  if (modelId === "auto" || modelId === "category::image") return "chat";
  const match = models.find((m) => m.id === modelId);
  return match ? inferModelCategory(match) : "chat";
}
