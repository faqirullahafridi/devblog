import { cached } from "../memory-cache";
import { fetchJson } from "./http";
import { generateNimImage, isNvidiaNimConfigured, listNimImageModels, pickNimImageModel } from "./nvidia-nim";

export type StockImage = {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
  source: "unsplash" | "pexels";
};

async function searchUnsplash(query: string, limit: number): Promise<StockImage[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) return [];

  const data = await fetchJson<{
    results?: Array<{
      id: string;
      urls?: { regular?: string; small?: string };
      user?: { name?: string; links?: { html?: string } };
    }>;
  }>(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}`,
    { headers: { Authorization: `Client-ID ${key}` } },
  );

  return (data.results ?? []).map((photo) => ({
    id: `unsplash-${photo.id}`,
    url: photo.urls?.regular ?? "",
    thumb: photo.urls?.small ?? "",
    author: photo.user?.name ?? "Unknown",
    authorUrl: photo.user?.links?.html ?? "https://unsplash.com",
    source: "unsplash" as const,
  }));
}

async function searchPexels(query: string, limit: number): Promise<StockImage[]> {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) return [];

  const data = await fetchJson<{
    photos?: Array<{
      id: number;
      src?: { large?: string; medium?: string };
      photographer?: string;
      photographer_url?: string;
    }>;
  }>(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${limit}`, {
    headers: { Authorization: key },
  });

  return (data.photos ?? []).map((photo) => ({
    id: `pexels-${photo.id}`,
    url: photo.src?.large ?? "",
    thumb: photo.src?.medium ?? "",
    author: photo.photographer ?? "Unknown",
    authorUrl: photo.photographer_url ?? "https://pexels.com",
    source: "pexels" as const,
  }));
}

export async function searchStockImages(query: string, limit = 12): Promise<StockImage[]> {
  const q = query.trim() || "technology";
  return cached(`media:stock:${q}:${limit}`, 30 * 60_000, async () => {
    const per = Math.ceil(limit / 2);
    const [unsplash, pexels] = await Promise.allSettled([searchUnsplash(q, per), searchPexels(q, per)]);
    const items: StockImage[] = [];
    if (unsplash.status === "fulfilled") items.push(...unsplash.value);
    if (pexels.status === "fulfilled") items.push(...pexels.value);
    return items.slice(0, limit);
  });
}

export function picsumPlaceholderUrl(width: number, height: number, seed?: string): string {
  const w = Math.min(Math.max(width, 16), 2000);
  const h = Math.min(Math.max(height, 16), 2000);
  if (seed) return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
  return `https://picsum.photos/${w}/${h}`;
}

export type GeneratedImage = {
  model: string;
  prompt: string;
  url?: string;
  b64Json?: string;
  dataUrl?: string;
  revisedPrompt?: string;
};

/** Free text-to-image via NVIDIA NIM (build.nvidia.com) — FLUX, SD 3.5, Qwen-Image */
export async function generateAiImage(opts: {
  prompt: string;
  model?: string;
  size?: string;
}): Promise<GeneratedImage> {
  if (!isNvidiaNimConfigured()) {
    throw new Error("NVIDIA_API_KEY not configured. Get a free key at https://build.nvidia.com/models");
  }

  const { images, model } = await generateNimImage({
    prompt: opts.prompt,
    model: opts.model,
    size: opts.size,
  });

  const first = images[0];
  const dataUrl = first.b64Json ? `data:image/png;base64,${first.b64Json}` : undefined;

  return {
    model,
    prompt: opts.prompt,
    url: first.url,
    b64Json: first.b64Json,
    dataUrl,
    revisedPrompt: first.revisedPrompt,
  };
}

export function getAiImageProviders() {
  return {
    nvidia: {
      configured: isNvidiaNimConfigured(),
      models: listNimImageModels(),
      defaultModel: pickNimImageModel(),
      signupUrl: "https://build.nvidia.com/models?filters=usecase%3Ausecase_image_gen",
    },
  };
}
