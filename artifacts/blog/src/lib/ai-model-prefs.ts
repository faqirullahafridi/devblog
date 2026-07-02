/** Category-based model picker — users pick a type, server picks the best available model. */
export type AiModelCategory = "chat" | "code" | "image";

export const AI_MODEL_CATEGORY_PREFIX = "category::";

export const AI_MODEL_CATEGORY_CHAT = `${AI_MODEL_CATEGORY_PREFIX}chat`;
export const AI_MODEL_CATEGORY_CODE = `${AI_MODEL_CATEGORY_PREFIX}code`;
export const AI_MODEL_CATEGORY_IMAGE = `${AI_MODEL_CATEGORY_PREFIX}image`;

export const AI_MODEL_PICKER_OPTIONS = [
  { id: "auto", label: "Auto", short: "Auto", description: "Best available" },
  { id: AI_MODEL_CATEGORY_CHAT, label: "Text & reasoning", short: "Text", description: "Fast chat & explain" },
  { id: AI_MODEL_CATEGORY_CODE, label: "Code", short: "Code", description: "Generate & debug" },
  { id: AI_MODEL_CATEGORY_IMAGE, label: "Images", short: "Img", description: "Create pictures" },
] as const;

export function isCategoryModelId(id: string): boolean {
  return id.startsWith(AI_MODEL_CATEGORY_PREFIX);
}

export function pickerLabel(modelId: string, full = false): string {
  const match = AI_MODEL_PICKER_OPTIONS.find((o) => o.id === modelId);
  if (!match) return "Auto";
  return full ? match.label : match.short === "Auto" ? "Auto" : match.short;
}

export const AI_MODEL_AUTO = "auto";

const STORAGE_KEY = "ai-model-id";

function normalizeStoredId(id: string | null): string {
  if (!id) return AI_MODEL_AUTO;
  if (isValidPickerModelId(id)) return id;
  if (id.includes("nvidia-image")) return AI_MODEL_CATEGORY_IMAGE;
  if (/::.*(code|coder|deepseek-v4-flash|nemotron|qwen3)/i.test(id)) return AI_MODEL_CATEGORY_CODE;
  return AI_MODEL_AUTO;
}

export function getStoredAiModelId(): string {
  try {
    return normalizeStoredId(localStorage.getItem(STORAGE_KEY));
  } catch {
    return AI_MODEL_AUTO;
  }
}

export function setStoredAiModelId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, isValidPickerModelId(id) ? id : AI_MODEL_AUTO);
  } catch {
    /* ignore */
  }
}

export function isValidPickerModelId(id: string): boolean {
  return AI_MODEL_PICKER_OPTIONS.some((o) => o.id === id);
}
