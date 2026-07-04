const NVIDIA_NIM_BASE = "https://integrate.api.nvidia.com/v1";

const IMAGE_MODELS = [
  "qwen/qwen-image",
  "qwen/qwen-image-edit",
  "black-forest-labs/flux.1-schnell",
  "black-forest-labs/flux.1-dev",
  "stabilityai/stable-diffusion-3.5-large",
];

let modelKeyMapCache = null;

function readEnvKey(...names) {
  for (const name of names) {
    const v = process.env[name]?.trim();
    if (v?.startsWith("nvapi-")) return v;
  }
  return undefined;
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
        if (k.startsWith("nvapi-")) modelKeyMapCache[model] = k;
      }
    } catch {
      /* invalid JSON */
    }
  }

  // Vercel-friendly per-model keys (no JSON required)
  const imageKey = readEnvKey("NVIDIA_IMAGE_KEY", "NVIDIA_API_KEY");
  const editKey = readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1");
  if (imageKey && !modelKeyMapCache["qwen/qwen-image"]) {
    modelKeyMapCache["qwen/qwen-image"] = imageKey;
  }
  if (editKey && !modelKeyMapCache["qwen/qwen-image-edit"]) {
    modelKeyMapCache["qwen/qwen-image-edit"] = editKey;
  }

  return modelKeyMapCache;
}

function readNvidiaImageKey(model) {
  const map = getModelKeyMap();
  if (model && map[model]) return map[model];
  if (model === "qwen/qwen-image-edit") {
    return readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1") ?? map["qwen/qwen-image-edit"];
  }
  return (
    readEnvKey("NVIDIA_IMAGE_KEY", "NVIDIA_API_KEY", "NVIDIA_CHAT_KEY") ??
    map["qwen/qwen-image"] ??
    Object.values(map)[0]
  );
}

export function isNvidiaImageConfigured() {
  return !!readNvidiaImageKey() || !!readEnvKey("NVIDIA_IMAGE_EDIT_KEY", "NVIDIA_IMAGE_KEY1");
}

function pickImageModel() {
  const env = process.env.NVIDIA_IMAGE_MODEL?.trim();
  if (env) return env;
  if (getModelKeyMap()["qwen/qwen-image"]) return "qwen/qwen-image";
  return IMAGE_MODELS[0];
}

export async function generateNimImage({ prompt, model, size = "1024x1024" }) {
  const chosenModel = model?.trim() || pickImageModel();
  const apiKey = readNvidiaImageKey(chosenModel);
  if (!apiKey) {
    throw new Error(
      "NVIDIA image API not configured. Set NVIDIA_IMAGE_KEY (+ NVIDIA_IMAGE_MODEL=qwen/qwen-image) on Vercel.",
    );
  }

  const body = JSON.stringify({
    model: chosenModel,
    prompt,
    n: 1,
    size,
    response_format: "b64_json",
  });

  const res = await fetch(`${NVIDIA_NIM_BASE}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    let msg = `NVIDIA image API error (${res.status})`;
    try {
      const json = JSON.parse(text);
      if (json.error?.message) msg = json.error.message;
    } catch {
      msg = `${msg}: ${text.slice(0, 200)}`;
    }
    throw new Error(msg);
  }

  const data = JSON.parse(text);
  const first = data.data?.[0];
  if (!first?.b64_json && !first?.url) {
    throw new Error("NVIDIA image API returned no image data");
  }

  return {
    model: chosenModel,
    b64Json: first.b64_json,
    url: first.url,
    revisedPrompt: first.revised_prompt,
    dataUrl: first.b64_json ? `data:image/png;base64,${first.b64_json}` : first.url,
  };
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
  const map = getModelKeyMap();
  return IMAGE_MODELS.filter((id) => !!map[id]);
}
