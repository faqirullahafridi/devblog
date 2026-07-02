import { isKvConfigured } from "../kv-store";
import { getActiveAiProvider } from "../ai-service";

export type IntegrationStatus = {
  id: string;
  name: string;
  configured: boolean;
  note?: string;
};

function env(...keys: string[]): boolean {
  return keys.some((k) => Boolean(process.env[k]?.trim()));
}

export function getIntegrationsStatus(): IntegrationStatus[] {
  return [
    { id: "zai", name: "Z.ai GLM", configured: env("ZAI_API_KEY", "ZAI_GLM_47_FLASH_KEY", "ZAI_GLM_45_FLASH_KEY", "ZAI_GLM_46V_FLASH_KEY") },
    { id: "groq", name: "Groq", configured: env("GROQ_API_KEY") },
    { id: "gemini", name: "Google Gemini", configured: env("GEMINI_API_KEY") },
    { id: "nvidia", name: "NVIDIA NIM", configured: env("NVIDIA_API_KEY") || env("NVIDIA_CHAT_KEY") || env("NVIDIA_CODE_KEY") || env("NVIDIA_IMAGE_KEY"), note: "Chat + FLUX/SD image gen at build.nvidia.com" },
    { id: "sambanova", name: "SambaNova", configured: env("SAMBANOVA_API_KEY") },
    { id: "cerebras", name: "Cerebras", configured: env("CEREBRAS_API_KEY") },
    { id: "ollama", name: "Ollama", configured: env("OLLAMA_API_KEY", "OLLAMA_BASE_URL") },
    { id: "huggingface", name: "Hugging Face", configured: env("HF_TOKEN") },
    { id: "openrouter", name: "OpenRouter", configured: env("OPENROUTER_API_KEY") },
    { id: "modelscope", name: "ModelScope", configured: env("MODELSCOPE_API_KEY") },
    { id: "siliconflow", name: "SiliconFlow", configured: env("SILICONFLOW_API_KEY") },
    { id: "mistral", name: "Mistral AI", configured: env("MISTRAL_API_KEY"), note: "API reference only — not in free chat chain" },
    { id: "cohere", name: "Cohere", configured: env("COHERE_API_KEY"), note: "API reference / embeddings — not in free chat chain" },
    { id: "together", name: "Together AI", configured: env("TOGETHER_API_KEY"), note: "API reference only — not in free chat chain" },
    { id: "deepseek", name: "DeepSeek", configured: env("DEEPSEEK_API_KEY"), note: "Chat via DEEPSEEK_API_KEY" },
    { id: "openai", name: "OpenAI", configured: env("OPENAI_API_KEY"), note: "Chat via OPENAI_API_KEY" },
    { id: "mymemory", name: "MyMemory", configured: true, note: "Always available; MYMEMORY_EMAIL raises quota" },
    { id: "libretranslate", name: "LibreTranslate", configured: true, note: "Public fallback; LIBRETRANSLATE_URL for self-host" },
    { id: "resend", name: "Resend", configured: env("RESEND_API_KEY") },
    { id: "sendgrid", name: "SendGrid", configured: env("SENDGRID_API_KEY") },
    { id: "brevo", name: "Brevo", configured: env("BREVO_API_KEY") },
    { id: "upstash", name: "Upstash Redis", configured: isKvConfigured() },
    { id: "supabase", name: "Supabase", configured: env("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY") },
    { id: "github-oauth", name: "GitHub OAuth", configured: env("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET") },
    { id: "unsplash", name: "Unsplash", configured: env("UNSPLASH_ACCESS_KEY") },
    { id: "pexels", name: "Pexels", configured: env("PEXELS_API_KEY") },
    { id: "devto", name: "Dev.to", configured: true, note: "Public feed; DEVTO_API_KEY optional" },
    { id: "hackernews", name: "Hacker News", configured: true },
    { id: "newsapi", name: "NewsAPI", configured: env("NEWS_API_KEY") },
    { id: "gnews", name: "GNews", configured: env("GNEWS_API_KEY") },
    { id: "coingecko", name: "CoinGecko", configured: true, note: "Demo tier; COINGECKO_API_KEY optional" },
    { id: "frankfurter", name: "Frankfurter", configured: true },
    { id: "restcountries", name: "REST Countries", configured: true },
    { id: "geojs", name: "GeoJS / ip-api", configured: true },
    { id: "npm", name: "npm Registry", configured: true },
    { id: "picsum", name: "Lorem Picsum", configured: true },
  ];
}

export function getIntegrationsSummary() {
  const items = getIntegrationsStatus();
  const aiProvider = getActiveAiProvider();
  return {
    total: items.length,
    configured: items.filter((i) => i.configured).length,
    aiProvider,
    kv: isKvConfigured() ? "upstash" : "memory",
    items,
  };
}
