/** Compact labels for the AI model picker (mirrors api-server model-labels). */

const PROVIDER_SHORT: Record<string, string> = {
  auto: "Auto",
  zai: "Z",
  groq: "Groq",
  ollama: "Ollama",
  gemini: "Gem",
  cerebras: "Cer",
  nvidia: "NV",
  "nvidia-image": "NV",
  deepseek: "DS",
  openai: "GPT",
  sambanova: "Sam",
  huggingface: "HF",
  openrouter: "OR",
  modelscope: "MS",
  siliconflow: "SF",
};

const MODEL_SHORT: Record<string, string> = {
  auto: "Auto",
  "glm-4.7-flash": "GLM 4.7",
  "glm-4.5-flash": "GLM 4.5",
  "glm-4.6v-flash": "GLM 4.6V",
  "llama-3.3-70b-versatile": "Llama 3.3",
  "llama-3.3-70b": "Llama 3.3",
  "gemini-2.0-flash": "2.0 Flash",
  "gemma3:4b": "Gemma 3",
  "deepseek-chat": "Chat",
  "gpt-4o-mini": "4o mini",
  "qwen/qwen3.5-122b-a10b": "Qwen3.5 122B",
  "qwen/qwen3-next-80b-a3b-instruct": "Qwen3 80B",
  "deepseek-ai/deepseek-v4-pro": "V4 Pro",
  "deepseek-ai/deepseek-v4-flash": "V4 Flash",
  "mistralai/mistral-small-4-119b-2603": "Mistral 119B",
  "google/gemma-4-31b-it": "Gemma 4",
  "minimaxai/minimax-m2.7": "M2.7",
  "abacusai/dracarys-llama-3.1-70b-instruct": "Dracarys",
  "meta/llama-3.3-70b-instruct": "Llama 3.3",
  "nvidia/nemotron-3-nano-30b-a3b": "Nemotron",
  "openai/gpt-oss-20b": "OSS 20B",
  "qwen/qwen-image": "Qwen img",
  "qwen-image": "Qwen img",
  "qwen/qwen-image-edit": "Qwen edit",
  "qwen-image-edit": "Qwen edit",
  "black-forest-labs/flux.1-schnell": "Flux fast",
  "black-forest-labs/flux.1-dev": "Flux dev",
  "stabilityai/stable-diffusion-3.5-large": "SD 3.5",
  "Meta-Llama-3.3-70B-Instruct": "Llama 3.3",
  "meta-llama/Llama-3.1-8B-Instruct": "Llama 3.1",
  "meta-llama/llama-3.3-70b-instruct:free": "Llama 3.3",
  "Qwen/Qwen2.5-72B-Instruct": "Qwen 72B",
  "deepseek-ai/DeepSeek-V3": "V3",
};

function modelSlug(model: string): string {
  const slash = model.lastIndexOf("/");
  return slash >= 0 ? model.slice(slash + 1) : model;
}

function compactSlug(slug: string): string {
  const s = slug.replace(/:free$/i, "").replace(/-instruct$/i, "");
  if (s.length <= 14) return s;
  return s.slice(0, 12) + "…";
}

export function displayModelName(model: string): string {
  if (model === "auto") return "Auto";
  return MODEL_SHORT[model] ?? MODEL_SHORT[modelSlug(model)] ?? compactSlug(modelSlug(model));
}

export function formatAiModelLabel(provider: string, model: string, kind?: "chat" | "image"): string {
  if (provider === "auto") return "Auto";

  const providerLabel = PROVIDER_SHORT[provider] ?? provider.slice(0, 4);
  const modelLabel = displayModelName(model);
  if (kind === "image" && !modelLabel.toLowerCase().includes("img")) {
    return `${providerLabel} ${modelLabel} img`;
  }
  return `${providerLabel} ${modelLabel}`;
}
