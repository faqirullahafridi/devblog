const NVIDIA_NIM_BASE = "https://integrate.api.nvidia.com/v1";

/** NVIDIA Visual GenAI API model IDs (NOT build.nvidia.com URL slugs). */
const API_IMAGE_MODELS = {
  qwen: "qwen-image",
  qwen2512: "qwen-image-2512",
  qwenEdit: "qwen-image-edit",
  fluxSchnell: "flux.1-schnell",
  fluxDev: "flux.1-dev",
  sd35: "stable-diffusion-3.5-large",
};

/** Map catalog / env aliases → API model id sent in the request body. */
const MODEL_ALIASES = {
  "qwen/qwen-image": API_IMAGE_MODELS.qwen,
  "qwen-image": API_IMAGE_MODELS.qwen,
  "qwen/qwen-image-2512": API_IMAGE_MODELS.qwen2512,
  "qwen-image-2512": API_IMAGE_MODELS.qwen2512,
  "qwen/qwen-image-edit": API_IMAGE_MODELS.qwenEdit,
  "qwen-image-edit": API_IMAGE_MODELS.qwenEdit,
  "black-forest-labs/flux.1-schnell": API_IMAGE_MODELS.fluxSchnell,
  "flux.1-schnell": API_IMAGE_MODELS.fluxSchnell,
  "black-forest-labs/flux.1-dev": API_IMAGE_MODELS.fluxDev,
  "flux.1-dev": API_IMAGE_MODELS.fluxDev,
  "stabilityai/stable-diffusion-3.5-large": API_IMAGE_MODELS.sd35,
  "stable-diffusion-3.5-large": API_IMAGE_MODELS.sd35,
};

const GENERATE_FALLBACK_MODELS = [
  API_IMAGE_MODELS.qwen,
  API_IMAGE_MODELS.qwen2512,
  API_IMAGE_MODELS.fluxSchnell,
];

let modelKeyMapCache = null;

function readEnvKey(...names) {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v?.startsWith("nvapi-")) return v;
  }
  return undefined;
}

function normalizeModelId(raw) {
  const id = String(raw ?? "").trim();
  if (!id || id.startsWith("nvapi-")) return API_IMAGE_MODELS.qwen;
  return MODEL_ALIASES[id] ?? id;
}

function isEditModel(apiModelId) {
  return apiModelId === API_IMAGE_MODELS.qwenEdit;
}

function getModelKeyMap() {
  if (modelKeyMapCache) return modelKeyMapCache;
  modelKeyMapCache = {};

  const raw = process.env.NVIDIA_MODEL_API_KEYS?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      for (const [model, key] of Object.entries(parsed)) {
        const k = String(key).trim();
        if (!k.startsWith("nvapi-")) continue;
        const apiId = normalizeModelId(model);
        modelKeyMapCache[apiId] = k;
        modelKeyMapCache[model] = k;
      }
    } catch {
      /* invalid JSON */
    }
  }

  const imageKey = readEnvKey("NVIDIA_IMAGE_KEY", "NVIDIA_API_KEY");
  const editKey = readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1");
  if (imageKey) {
    modelKeyMapCache[API_IMAGE_MODELS.qwen] = imageKey;
    modelKeyMapCache[API_IMAGE_MODELS.qwen2512] = imageKey;
    modelKeyMapCache["qwen/qwen-image"] = imageKey;
  }
  if (editKey) {
    modelKeyMapCache[API_IMAGE_MODELS.qwenEdit] = editKey;
    modelKeyMapCache["qwen/qwen-image-edit"] = editKey;
  }

  return modelKeyMapCache;
}

function readNvidiaImageKey(apiModelId) {
  const map = getModelKeyMap();
  const normalized = normalizeModelId(apiModelId);
  if (map[normalized]) return map[normalized];
  if (isEditModel(normalized)) {
    return readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1") ?? map[API_IMAGE_MODELS.qwenEdit];
  }
  return (
    readEnvKey("NVIDIA_IMAGE_KEY", "NVIDIA_API_KEY") ??
    map[API_IMAGE_MODELS.qwen] ??
    Object.values(map)[0]
  );
}

export function isNvidiaImageConfigured() {
  return !!readNvidiaImageKey(API_IMAGE_MODELS.qwen) || !!readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1");
}

function pickImageModel() {
  const env = process.env.NVIDIA_IMAGE_MODEL?.trim();
  if (env) return normalizeModelId(env);
  return API_IMAGE_MODELS.qwen;
}

async function requestImage(apiModelId, apiKey, prompt, size) {
  const res = await fetch(`${NVIDIA_NIM_BASE}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: apiModelId,
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.detail) msg = String(json.detail);
      else if (json.error?.message) msg = json.error.message;
      else if (json.title) msg = `${json.title}: ${json.detail ?? text.slice(0, 120)}`;
    } catch {
      msg = text.slice(0, 200) || msg;
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const data = JSON.parse(text);
  const first = data.data?.[0];
  if (!first?.b64_json && !first?.url) {
    throw new Error("NVIDIA image API returned no image data");
  }

  return {
    model: apiModelId,
    b64Json: first.b64_json,
    url: first.url,
    revisedPrompt: first.revised_prompt,
    dataUrl: first.b64_json ? `data:image/png;base64,${first.b64_json}` : first.url,
  };
}

export async function generateNimImage({ prompt, model, size = "1024x1024" }) {
  const primary = normalizeModelId(model?.trim() || pickImageModel());
  const candidates = isEditModel(primary)
    ? [primary]
    : [primary, ...GENERATE_FALLBACK_MODELS.filter((m) => m !== primary)];

  const errors = [];

  for (const apiModelId of candidates) {
    const apiKey = readNvidiaImageKey(apiModelId);
    if (!apiKey) continue;
    try {
      return await requestImage(apiModelId, apiKey, prompt, size);
    } catch (err) {
      const status = err?.status ?? 0;
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${apiModelId}: ${message}`);
      if (status !== 404 && status !== 400) break;
    }
  }

  if (!readNvidiaImageKey(API_IMAGE_MODELS.qwen)) {
    throw new Error(
      "NVIDIA image API not configured. Set NVIDIA_IMAGE_KEY and NVIDIA_IMAGE_MODEL=qwen-image on Vercel.",
    );
  }

  throw new Error(
    errors.length
      ? `Image generation failed (${errors.join("; ")}). Set NVIDIA_IMAGE_MODEL=qwen-image on Vercel.`
      : "Image generation failed. Set NVIDIA_IMAGE_MODEL=qwen-image on Vercel.",
  );
}

export function isImageGenerationRequest(text) {
  const t = String(text).toLowerCase();
  if (
    /\b(generate|create|make|draw|design|render|produce)\b/.test(t) &&
    /\b(image|picture|photo|illustration|logo|icon|banner|mockup|graphic|artwork|wallpaper)\b/.test(t)
  ) {
    return true;
  }
  if (/\b(image|picture|logo|icon|banner)\s+(of|for|showing|depicting|with)\b/.test(t)) {
    return true;
  }
  if (/\btext[- ]to[- ]image\b/.test(t)) {
    return true;
  }
  return false;
}

export function extractImagePrompt(text) {
  let p = String(text).trim();
  p = p.replace(
    /^(please\s+)?(can you\s+)?(could you\s+)?(generate|create|make|draw|design|render|produce)\s+(me\s+)?(an?\s+)?(image|picture|photo|illustration|logo|icon|banner|mockup|graphic)\s+(of\s+)?/i,
    "",
  );
  p = p.replace(/^(please\s+)?(show|give)\s+me\s+(an?\s+)?(image|picture)\s+(of\s+)?/i, "");
  return p.trim() || String(text).trim();
}

export function buildImageAssistantMarkdown(prompt, result) {
  const src = result.dataUrl || result.url;
  const lines = [`Here is your generated image for **${prompt}**:`, "", `![Generated: ${prompt}](${src})`, ""];
  if (result.revisedPrompt && result.revisedPrompt !== prompt) {
    lines.push(`_Model refined prompt: ${result.revisedPrompt}_`, "");
  }
  lines.push(`_Model: ${result.model}_`);
  return lines.join("\n");
}

export function listConfiguredImageModels() {
  return Object.values(API_IMAGE_MODELS).filter((id) => !!readNvidiaImageKey(id));
}
