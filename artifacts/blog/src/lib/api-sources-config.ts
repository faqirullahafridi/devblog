export type ApiPricing = "free" | "free-tier" | "optional-paid" | "self-hosted";

export type ApiSource = {
  id: string;
  name: string;
  pricing: ApiPricing;
  requiresKey: boolean;
  docsUrl: string;
  signupUrl?: string;
  envVars?: string[];
  idealFor: string;
  summary: string;
  howItWorks: string;
  freeLimits?: string;
};

export type ApiSourceCategory = {
  id: string;
  title: string;
  description: string;
  sources: ApiSource[];
};

export const API_SOURCES_PAGE = {
  title: "API Sources",
  description:
    "A curated directory of free and freemium public APIs — what each one does, typical env vars, limits, and how to integrate them safely from your backend.",
};

export const API_SOURCE_CATEGORIES: ApiSourceCategory[] = [
  {
    id: "ai",
    title: "AI & translation",
    description: "LLM inference, embeddings, and machine translation APIs.",
    sources: [
      api({ id: "zai", name: "Z.ai (GLM Flash)", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.z.ai/guides/overview/quick-start", signupUrl: "https://z.ai/model-api", envVars: ["ZAI_GLM_47_FLASH_KEY", "ZAI_API_KEY"], idealFor: "Free GLM chat in production", summary: "OpenAI-compatible GLM Flash models.", howItWorks: "POST {ZAI_BASE_URL}/chat/completions with Bearer token.", freeLimits: "Free GLM-4.x Flash tiers — see z.ai." }),
      api({ id: "groq", name: "Groq", pricing: "free-tier", requiresKey: true, docsUrl: "https://console.groq.com/docs", signupUrl: "https://console.groq.com", envVars: ["GROQ_API_KEY", "GROQ_MODEL"], idealFor: "Fast chatbots and code assistants", summary: "OpenAI-compatible LLM API with low latency.", howItWorks: "POST https://api.groq.com/openai/v1/chat/completions.", freeLimits: "Free tier with token caps — see console.groq.com." }),
      api({ id: "gemini", name: "Google Gemini (AI Studio)", pricing: "free-tier", requiresKey: true, docsUrl: "https://ai.google.dev/gemini-api/docs", signupUrl: "https://aistudio.google.com/apikey", envVars: ["GEMINI_API_KEY", "GEMINI_MODEL"], idealFor: "Multimodal chat and codegen", summary: "Google Gemini models with a generous free tier.", howItWorks: "OpenAI-compatible at generativelanguage.googleapis.com/v1beta/openai/chat/completions.", freeLimits: "RPM/TPM limits on free tier." }),
      api({ id: "nvidia", name: "NVIDIA NIM", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.api.nvidia.com/nim/reference/llm-apis", signupUrl: "https://build.nvidia.com/models", envVars: ["NVIDIA_API_KEY", "NVIDIA_CHAT_KEY", "NVIDIA_CODE_KEY", "NVIDIA_REASONING_KEY", "NVIDIA_IMAGE_KEY", "NVIDIA_CHAT_MODEL", "NVIDIA_CODE_MODEL", "NVIDIA_IMAGE_MODEL"], idealFor: "Free open LLMs, code models, and FLUX image gen", summary: "80+ open models — chat, code, reasoning, and text-to-image with per-purpose keys.", howItWorks: "Chat: POST integrate.api.nvidia.com/v1/chat/completions. Images: POST /v1/images/generations (FLUX, SD 3.5, Qwen-Image).", freeLimits: "Free serverless API credits on build.nvidia.com; no card required." }),
      api({ id: "sambanova", name: "SambaNova Cloud", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.sambanova.ai/docs/en/features/openai-compatibility", signupUrl: "https://cloud.sambanova.ai/", envVars: ["SAMBANOVA_API_KEY", "SAMBANOVA_MODEL"], idealFor: "Fast Llama and DeepSeek inference", summary: "OpenAI-compatible cloud inference on SambaNova chips.", howItWorks: "POST https://api.sambanova.ai/v1/chat/completions.", freeLimits: "Free SambaCloud tier with rate limits." }),
      api({ id: "cerebras", name: "Cerebras", pricing: "free-tier", requiresKey: true, docsUrl: "https://inference-docs.cerebras.ai/resources/openai", signupUrl: "https://cloud.cerebras.ai/", envVars: ["CEREBRAS_API_KEY", "CEREBRAS_MODEL"], idealFor: "Ultra-fast open-model inference", summary: "OpenAI-compatible API on Cerebras wafer-scale hardware.", howItWorks: "POST https://api.cerebras.ai/v1/chat/completions.", freeLimits: "Generous free tier — see cloud.cerebras.ai." }),
      api({ id: "ollama", name: "Ollama", pricing: "free", requiresKey: false, docsUrl: "https://github.com/ollama/ollama/blob/main/docs/api.md", signupUrl: "https://ollama.com", envVars: ["OLLAMA_BASE_URL", "OLLAMA_MODEL"], idealFor: "Local or private LLM hosting", summary: "Run open models locally or via Ollama Cloud.", howItWorks: "OpenAI-compatible endpoint at localhost:11434 or ollama.com/v1.", freeLimits: "Local use is unlimited on your hardware; free cloud models available." }),
      api({ id: "huggingface", name: "Hugging Face Inference", pricing: "free-tier", requiresKey: true, docsUrl: "https://huggingface.co/docs/inference-providers", signupUrl: "https://huggingface.co/settings/tokens", envVars: ["HF_TOKEN", "HF_MODEL"], idealFor: "Open models via unified router", summary: "Routes to Groq, Together, Cerebras, and more.", howItWorks: "POST https://router.huggingface.co/v1/chat/completions.", freeLimits: "Free monthly credits with rate limits." }),
      api({ id: "openrouter", name: "OpenRouter", pricing: "free-tier", requiresKey: true, docsUrl: "https://openrouter.ai/docs/quickstart", signupUrl: "https://openrouter.ai/", envVars: ["OPENROUTER_API_KEY", "OPENROUTER_MODEL"], idealFor: "One key for 300+ models", summary: "OpenAI-compatible aggregator for many providers.", howItWorks: "POST https://openrouter.ai/api/v1/chat/completions.", freeLimits: "Many :free models; pay-as-you-go for others." }),
      api({ id: "modelscope", name: "ModelScope (Alibaba)", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.modelscope.cn/docs/model-service/API-Inference/intro", signupUrl: "https://www.modelscope.cn/my/myaccesstoken", envVars: ["MODELSCOPE_API_KEY", "MODELSCOPE_MODEL"], idealFor: "Qwen and China-hosted open models", summary: "Alibaba model hub with OpenAI-compatible inference.", howItWorks: "POST https://api-inference.modelscope.cn/v1/chat/completions.", freeLimits: "~2,000 requests/day free." }),
      api({ id: "siliconflow", name: "SiliconFlow", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.siliconflow.com/en/userguide/quickstart", signupUrl: "https://cloud.siliconflow.cn/", envVars: ["SILICONFLOW_API_KEY", "SILICONFLOW_MODEL"], idealFor: "DeepSeek, Qwen, GLM at low cost", summary: "OpenAI-compatible hosted open models.", howItWorks: "POST https://api.siliconflow.com/v1/chat/completions.", freeLimits: "Large free token grants on signup." }),
      api({ id: "mistral", name: "Mistral AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.mistral.ai/", signupUrl: "https://console.mistral.ai/", envVars: ["MISTRAL_API_KEY", "MISTRAL_MODEL"], idealFor: "EU-friendly LLM workloads", summary: "Mistral chat and embed models.", howItWorks: "POST https://api.mistral.ai/v1/chat/completions.", freeLimits: "Experiment tier on signup." }),
      api({ id: "cohere", name: "Cohere", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.cohere.com/docs/compatibility-api", signupUrl: "https://dashboard.cohere.com/", envVars: ["COHERE_API_KEY", "COHERE_MODEL"], idealFor: "RAG, rerank, and classify", summary: "OpenAI-compatible layer plus native embed/rerank.", howItWorks: "POST https://api.cohere.ai/compatibility/v1/chat/completions.", freeLimits: "Trial key with monthly cap." }),
      api({ id: "moonshot", name: "Moonshot AI (Kimi)", pricing: "optional-paid", requiresKey: true, docsUrl: "https://platform.moonshot.ai/docs/api/overview", signupUrl: "https://platform.moonshot.ai/", envVars: ["MOONSHOT_API_KEY", "MOONSHOT_MODEL"], idealFor: "Long-context Chinese/English chat", summary: "Kimi models via OpenAI-compatible API.", howItWorks: "POST https://api.moonshot.ai/v1/chat/completions.", freeLimits: "Pay-as-you-go; trial credits may apply." }),
      api({ id: "minimax", name: "MiniMax", pricing: "free-tier", requiresKey: true, docsUrl: "https://platform.minimax.io/docs/api-reference/text-openai-api", signupUrl: "https://www.minimax.io/platform", envVars: ["MINIMAX_API_KEY", "MINIMAX_MODEL"], idealFor: "Agentic coding and multimodal", summary: "MiniMax-M3 and M2.x via OpenAI SDK.", howItWorks: "POST https://api.minimax.io/v1/chat/completions.", freeLimits: "Trial credits on signup." }),
      api({ id: "fireworks", name: "Fireworks AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.fireworks.ai/tools-sdks/openai-compatibility", signupUrl: "https://fireworks.ai/", envVars: ["FIREWORKS_API_KEY", "FIREWORKS_MODEL"], idealFor: "Llama, DeepSeek, serverless LLMs", summary: "OpenAI-compatible serverless inference.", howItWorks: "POST https://api.fireworks.ai/inference/v1/chat/completions.", freeLimits: "Starter credits; pay per token after." }),
      api({ id: "featherless", name: "Featherless AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://featherless.ai/docs/api-overview-and-common-options", signupUrl: "https://featherless.ai/", envVars: ["FEATHERLESS_API_KEY", "FEATHERLESS_MODEL"], idealFor: "4000+ open-source LLMs", summary: "OpenAI-compatible access to huge model catalog.", howItWorks: "POST https://api.featherless.ai/v1/chat/completions.", freeLimits: "Free credits on signup." }),
      api({ id: "novita", name: "Novita AI", pricing: "optional-paid", requiresKey: true, docsUrl: "https://novita.ai/docs/guides/llm-api", signupUrl: "https://novita.ai/", envVars: ["NOVITA_API_KEY", "NOVITA_MODEL"], idealFor: "Cheap open-model hosting", summary: "OpenAI-compatible LLM and image APIs.", howItWorks: "POST https://api.novita.ai/openai/v1/chat/completions.", freeLimits: "Pay-as-you-go; competitive open-model rates." }),
      api({ id: "hyperbolic", name: "Hyperbolic", pricing: "optional-paid", requiresKey: true, docsUrl: "https://www.hyperbolic.ai/docs/inference/text-apis", signupUrl: "https://app.hyperbolic.xyz/", envVars: ["HYPERBOLIC_API_KEY", "HYPERBOLIC_MODEL"], idealFor: "Open models at low per-token cost", summary: "OpenAI-compatible text, image, and vision APIs.", howItWorks: "POST https://api.hyperbolic.xyz/v1/chat/completions.", freeLimits: "Signup credits; then pay-per-use." }),
      api({ id: "together", name: "Together AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.together.ai/", signupUrl: "https://api.together.xyz/", envVars: ["TOGETHER_API_KEY", "TOGETHER_MODEL"], idealFor: "Llama, Mixtral, and open-weight LLMs", summary: "OpenAI-compatible hosted open models.", howItWorks: "POST https://api.together.xyz/v1/chat/completions.", freeLimits: "Starter credits on signup." }),
      api({ id: "deepinfra", name: "DeepInfra", pricing: "optional-paid", requiresKey: true, docsUrl: "https://docs.deepinfra.com/chat/overview", signupUrl: "https://deepinfra.com/", envVars: ["DEEPINFRA_API_KEY", "DEEPINFRA_MODEL"], idealFor: "100+ open models at low cost", summary: "Drop-in OpenAI replacement for open models.", howItWorks: "POST https://api.deepinfra.com/v1/openai/chat/completions.", freeLimits: "Low per-token rates; no permanent free tier." }),
      api({ id: "deepseek", name: "DeepSeek", pricing: "optional-paid", requiresKey: true, docsUrl: "https://platform.deepseek.com/api-docs/", signupUrl: "https://platform.deepseek.com/", envVars: ["DEEPSEEK_API_KEY", "DEEPSEEK_MODEL"], idealFor: "Low-cost coding assistants", summary: "DeepSeek Coder and chat models.", howItWorks: "POST https://api.deepseek.com/chat/completions.", freeLimits: "Very low paid rates; promotional credits." }),
      api({ id: "openai", name: "OpenAI", pricing: "optional-paid", requiresKey: true, docsUrl: "https://platform.openai.com/docs/api-reference", signupUrl: "https://platform.openai.com", envVars: ["OPENAI_API_KEY", "OPENAI_MODEL"], idealFor: "Production-grade GPT apps", summary: "GPT chat, embeddings, and image APIs.", howItWorks: "POST https://api.openai.com/v1/chat/completions.", freeLimits: "Pay-as-you-go; trial credits for new accounts." }),
      api({ id: "baseten", name: "Baseten", pricing: "optional-paid", requiresKey: true, docsUrl: "https://docs.baseten.co/inference/model-apis/overview", signupUrl: "https://www.baseten.co/", envVars: ["BASETEN_API_KEY", "BASETEN_MODEL"], idealFor: "Hosted GLM, Kimi, DeepSeek", summary: "OpenAI-compatible Model APIs and custom deploys.", howItWorks: "POST https://inference.baseten.co/v1/chat/completions.", freeLimits: "Pay per token; deploy your own models." }),
      api({ id: "lepton", name: "Lepton / DGX Cloud Lepton", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.nvidia.com/dgx-cloud/lepton/", signupUrl: "https://www.lepton.ai/", envVars: ["LEPTON_API_KEY", "LEPTON_MODEL"], idealFor: "Serverless open-model endpoints", summary: "OpenAI-compatible inference (now NVIDIA DGX Cloud Lepton).", howItWorks: "POST https://api.lepton.ai/v1/chat/completions.", freeLimits: "Free credits on signup." }),
      api({ id: "inference-net", name: "Inference.net", pricing: "optional-paid", requiresKey: true, docsUrl: "https://docs.inference.net/api/api-quickstart", signupUrl: "https://inference.net/", envVars: ["INFERENCE_API_KEY", "INFERENCE_MODEL"], idealFor: "Deploy and observe custom models", summary: "OpenAI-compatible hosted and deployed models.", howItWorks: "POST https://api.inference.net/v1/chat/completions.", freeLimits: "Pay-as-you-go; Catalyst gateway for observability." }),
      api({ id: "lambda", name: "Lambda AI", pricing: "optional-paid", requiresKey: true, docsUrl: "https://docs.lambda.ai/public-cloud/lambda-inference-api/", signupUrl: "https://lambda.ai/", envVars: ["LAMBDA_API_KEY", "LAMBDA_MODEL"], idealFor: "Low-cost open-model inference", summary: "OpenAI-compatible inference on Lambda GPUs.", howItWorks: "POST https://api.lambda.ai/v1/chat/completions.", freeLimits: "Pay per token; competitive pricing." }),
      api({ id: "nebius", name: "Nebius AI Studio", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.tokenfactory.nebius.com/api-reference/introduction", signupUrl: "https://studio.nebius.ai/", envVars: ["NEBIUS_API_KEY", "NEBIUS_MODEL"], idealFor: "EU-hosted Llama and Qwen", summary: "OpenAI-compatible Token Factory / AI Studio API.", howItWorks: "POST https://api.studio.nebius.ai/v1/chat/completions.", freeLimits: "Trial credits on signup." }),
      api({ id: "cloudflare-ai", name: "Cloudflare Workers AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/", signupUrl: "https://developers.cloudflare.com/workers-ai/", envVars: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"], idealFor: "Edge LLM on Cloudflare", summary: "OpenAI-compatible Workers AI and AI Gateway.", howItWorks: "POST https://api.cloudflare.com/client/v4/accounts/{id}/ai/v1/chat/completions.", freeLimits: "Free daily Neurons on Workers AI plan." }),
      api({ id: "replicate", name: "Replicate", pricing: "optional-paid", requiresKey: true, docsUrl: "https://replicate.com/docs/reference/http", signupUrl: "https://replicate.com/", envVars: ["REPLICATE_API_TOKEN"], idealFor: "Run any open model via predictions API", summary: "HTTP predictions API; OpenAI proxy via Lifeboat.", howItWorks: "POST /v1/predictions or OpenAI proxy at openai-proxy.replicate.com/v1.", freeLimits: "Pay per second of GPU time." }),
      api({ id: "fal", name: "Fal AI", pricing: "free-tier", requiresKey: true, docsUrl: "https://fal.ai/docs/examples/integrations/use-llms", signupUrl: "https://fal.ai/", envVars: ["FAL_KEY"], idealFor: "Image, video, and any-llm endpoints", summary: "Queue-based multimodal API; OpenRouter bridge for chat.", howItWorks: "POST https://fal.run/fal-ai/any-llm or OpenRouter-compatible endpoint.", freeLimits: "Free credits on signup." }),
      api({ id: "modal", name: "Modal", pricing: "free-tier", requiresKey: true, docsUrl: "https://modal.com/docs", signupUrl: "https://modal.com/", envVars: ["MODAL_TOKEN_ID", "MODAL_TOKEN_SECRET"], idealFor: "Custom GPU functions and deploys", summary: "Serverless GPU platform — bring your own endpoint.", howItWorks: "Deploy a custom OpenAI-compatible handler on Modal.", freeLimits: "$30/mo free compute credits." }),
      api({ id: "openpipe", name: "OpenPipe", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.openpipe.ai/getting-started/openpipe-sdk", signupUrl: "https://openpipe.ai/", envVars: ["OPENPIPE_API_KEY"], idealFor: "Fine-tune, log, and evaluate LLM calls", summary: "OpenAI-compatible proxy and fine-tuned model hosting.", howItWorks: "POST https://api.openpipe.ai/api/v1/chat/completions.", freeLimits: "Free tier for logging; fine-tune plans vary." }),
      api({ id: "mymemory", name: "MyMemory Translation", pricing: "free-tier", requiresKey: false, docsUrl: "https://mymemory.translated.net/doc/spec.php", signupUrl: "https://mymemory.translated.net", envVars: ["MYMEMORY_EMAIL"], idealFor: "Translate user-generated content", summary: "Free machine translation REST API.", howItWorks: "GET with q, langpair, optional registered email.", freeLimits: "~5k chars/day anonymous; ~50k with email." }),
      api({ id: "libretranslate", name: "LibreTranslate", pricing: "free", requiresKey: false, docsUrl: "https://libretranslate.com/docs/", signupUrl: "https://libretranslate.com/", idealFor: "Self-hosted translation", summary: "Open-source translation API.", howItWorks: "POST text with source/target language codes.", freeLimits: "Public instance rate-limited; self-host for scale." }),
    ],
  },
  {
    id: "jobs",
    title: "Job boards",
    description: "Public job listing APIs for career sites and aggregators.",
    sources: [
      api({ id: "remoteok", name: "RemoteOK", pricing: "free", requiresKey: false, docsUrl: "https://remoteok.com/api", idealFor: "Remote tech job boards", summary: "Public JSON feed of remote jobs.", howItWorks: "GET returns array of job objects.", freeLimits: "No key; respect rate limits." }),
      api({ id: "remotive", name: "Remotive", pricing: "free", requiresKey: false, docsUrl: "https://remotive.com/api/remote-jobs", idealFor: "Startup and remote role listings", summary: "Public remote jobs JSON API.", howItWorks: "GET /api/remote-jobs with optional category filter.", freeLimits: "Public endpoint." }),
      api({ id: "arbeitnow", name: "Arbeitnow", pricing: "free", requiresKey: false, docsUrl: "https://www.arbeitnow.com/api/job-board-api", idealFor: "European job listings", summary: "EU-focused job board API.", howItWorks: "Paginated job-board-api endpoint.", freeLimits: "Public; many listings in German." }),
      api({ id: "themuse", name: "The Muse", pricing: "free-tier", requiresKey: false, docsUrl: "https://www.themuse.com/developers/api/v2", signupUrl: "https://www.themuse.com/developers/api/v2", envVars: ["THE_MUSE_API_KEY"], idealFor: "Company profiles and roles", summary: "Job listings with company culture data.", howItWorks: "REST v2 with optional API key.", freeLimits: "Works without key; key may raise limits." }),
      api({ id: "jooble", name: "Jooble", pricing: "free-tier", requiresKey: true, docsUrl: "https://jooble.org/api/about", signupUrl: "https://jooble.org/api/about", envVars: ["JOOBLE_API_KEY"], idealFor: "Regional job search aggregation", summary: "Job aggregator with keyword search.", howItWorks: "POST search with keywords and location.", freeLimits: "Free API key after registration." }),
      api({ id: "everjobs", name: "Ever Jobs", pricing: "self-hosted", requiresKey: true, docsUrl: "https://github.com/ever-jobs/ever-jobs", envVars: ["EVER_JOBS_BASE_URL", "EVER_JOBS_API_KEY"], idealFor: "Self-hosted multi-source job API", summary: "Open-source aggregator for 160+ sources.", howItWorks: "Run the service; consume its REST API.", freeLimits: "Free to self-host." }),
    ],
  },
  {
    id: "email",
    title: "Email",
    description: "Transactional and marketing email APIs.",
    sources: [
      api({ id: "resend", name: "Resend", pricing: "free-tier", requiresKey: true, docsUrl: "https://resend.com/docs", signupUrl: "https://resend.com", envVars: ["RESEND_API_KEY"], idealFor: "Newsletters and transactional mail", summary: "Developer-first email API.", howItWorks: "POST /emails with JSON body and API key.", freeLimits: "100 emails/day on free plan." }),
      api({ id: "sendgrid", name: "SendGrid", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.sendgrid.com/", signupUrl: "https://signup.sendgrid.com/", envVars: ["SENDGRID_API_KEY"], idealFor: "Password resets and receipts", summary: "Twilio SendGrid mail API.", howItWorks: "REST v3 mail/send with dynamic templates.", freeLimits: "100 emails/day forever free." }),
      api({ id: "mailgun", name: "Mailgun", pricing: "free-tier", requiresKey: true, docsUrl: "https://documentation.mailgun.com/", signupUrl: "https://signup.mailgun.com/", envVars: ["MAILGUN_API_KEY"], idealFor: "Send + receive email", summary: "Mailgun REST API.", howItWorks: "Domain verification then REST send.", freeLimits: "Trial sends then pay-as-you-go." }),
      api({ id: "brevo", name: "Brevo", pricing: "free-tier", requiresKey: true, docsUrl: "https://developers.brevo.com/", signupUrl: "https://www.brevo.com/", envVars: ["BREVO_API_KEY"], idealFor: "Marketing + transactional hybrid", summary: "Email, SMS, and CRM contacts.", howItWorks: "SMTP or REST with contact lists.", freeLimits: "300 emails/day free." }),
      api({ id: "postmark", name: "Postmark", pricing: "free-tier", requiresKey: true, docsUrl: "https://postmarkapp.com/developer", signupUrl: "https://postmarkapp.com/", envVars: ["POSTMARK_SERVER_TOKEN"], idealFor: "High-deliverability app mail", summary: "Transactional email focused.", howItWorks: "REST send with message streams.", freeLimits: "100 emails/month free." }),
    ],
  },
  {
    id: "database",
    title: "Database, cache & storage",
    description: "Hosted databases, Redis caches, and object storage.",
    sources: [
      api({ id: "supabase", name: "Supabase", pricing: "free-tier", requiresKey: true, docsUrl: "https://supabase.com/docs", signupUrl: "https://supabase.com", envVars: ["DATABASE_URL", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"], idealFor: "Postgres + auth + storage in one", summary: "Postgres, Storage, Auth, and Realtime.", howItWorks: "Connection string for SQL; REST for storage/auth.", freeLimits: "500 MB DB + 1 GB storage on free plan." }),
      api({ id: "neon", name: "Neon Postgres", pricing: "free-tier", requiresKey: false, docsUrl: "https://neon.tech/docs/introduction", signupUrl: "https://neon.tech/", envVars: ["DATABASE_URL"], idealFor: "Serverless Postgres branches", summary: "Branching PostgreSQL.", howItWorks: "Standard Postgres connection string.", freeLimits: "0.5 GB storage; scale-to-zero." }),
      api({ id: "turso", name: "Turso", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.turso.tech/", signupUrl: "https://turso.tech/", envVars: ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN"], idealFor: "Edge SQLite", summary: "Distributed libSQL.", howItWorks: "HTTP or libsql driver.", freeLimits: "9 GB total; 500 DBs free." }),
      api({ id: "upstash-redis", name: "Upstash Redis", pricing: "free-tier", requiresKey: true, docsUrl: "https://upstash.com/docs/redis", signupUrl: "https://upstash.com/", envVars: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"], idealFor: "Rate limits, sessions, hot caches", summary: "Serverless Redis with REST.", howItWorks: "HTTP REST or Redis protocol.", freeLimits: "10k commands/day free." }),
      api({ id: "cloudflare-r2", name: "Cloudflare R2", pricing: "free-tier", requiresKey: true, docsUrl: "https://developers.cloudflare.com/r2/", signupUrl: "https://dash.cloudflare.com/", envVars: ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"], idealFor: "Media and file storage", summary: "S3-compatible; zero egress fees.", howItWorks: "S3 API with Cloudflare credentials.", freeLimits: "10 GB/month free." }),
      api({ id: "mongodb-atlas", name: "MongoDB Atlas", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.mongodb.com/docs/atlas/", signupUrl: "https://www.mongodb.com/atlas", envVars: ["MONGODB_URI"], idealFor: "Document-oriented apps", summary: "Managed MongoDB M0 cluster.", howItWorks: "Driver + connection string.", freeLimits: "512 MB forever free." }),
      api({ id: "firebase", name: "Firebase", pricing: "free-tier", requiresKey: true, docsUrl: "https://firebase.google.com/docs", signupUrl: "https://console.firebase.google.com/", envVars: ["FIREBASE_PROJECT_ID"], idealFor: "Mobile backends and realtime data", summary: "Auth, Firestore, Hosting, FCM.", howItWorks: "Client SDKs + Admin SDK on Spark plan.", freeLimits: "Spark plan quotas." }),
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Traffic and product analytics scripts and APIs.",
    sources: [
      api({ id: "plausible", name: "Plausible", pricing: "free-tier", requiresKey: false, docsUrl: "https://plausible.io/docs", signupUrl: "https://plausible.io", envVars: ["PLAUSIBLE_DOMAIN"], idealFor: "Privacy-friendly site stats", summary: "Lightweight analytics without cookies.", howItWorks: "Script tag or self-hosted instance.", freeLimits: "Paid SaaS or self-host for free." }),
      api({ id: "google-analytics", name: "Google Analytics 4", pricing: "free-tier", requiresKey: false, docsUrl: "https://developers.google.com/analytics", signupUrl: "https://analytics.google.com", envVars: ["GA_MEASUREMENT_ID"], idealFor: "Standard web analytics", summary: "GA4 measurement and reporting.", howItWorks: "gtag.js with measurement ID.", freeLimits: "Free for most sites." }),
    ],
  },
  {
    id: "developer",
    title: "Developer & Git",
    description: "Repos, packages, and HTTP testing utilities.",
    sources: [
      api({ id: "github", name: "GitHub REST API", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.github.com/en/rest", signupUrl: "https://github.com/settings/tokens", envVars: ["GITHUB_TOKEN"], idealFor: "CI bots, repo stats, issue sync", summary: "Repos, issues, PRs, Actions.", howItWorks: "PAT or GitHub App token in Authorization header.", freeLimits: "5,000 req/hr authenticated." }),
      api({ id: "gitlab", name: "GitLab API", pricing: "free-tier", requiresKey: true, docsUrl: "https://docs.gitlab.com/ee/api/", signupUrl: "https://gitlab.com/-/user_settings/personal_access_tokens", envVars: ["GITLAB_TOKEN"], idealFor: "GitLab automation", summary: "Projects, pipelines, MRs.", howItWorks: "Private token + REST v4.", freeLimits: "Tier-based rate limits." }),
      api({ id: "npm-registry", name: "npm Registry", pricing: "free", requiresKey: false, docsUrl: "https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md", idealFor: "Package version lookups", summary: "Public npm metadata.", howItWorks: "GET registry.npmjs.org/{package}.", freeLimits: "Unlimited reads; be respectful." }),
      api({ id: "httpbin", name: "HTTPBin", pricing: "free", requiresKey: false, docsUrl: "https://httpbin.org/", idealFor: "HTTP client debugging", summary: "Echo server for requests.", howItWorks: "GET/POST /get, /post, etc.", freeLimits: "Demo only; not for production load." }),
      api({ id: "jsonplaceholder", name: "JSONPlaceholder", pricing: "free", requiresKey: false, docsUrl: "https://jsonplaceholder.typicode.com/", idealFor: "Frontend prototyping", summary: "Fake REST CRUD API.", howItWorks: "Standard REST verbs on static JSON.", freeLimits: "Fake data only." }),
    ],
  },
  {
    id: "geo",
    title: "Maps, geo & IP",
    description: "Geocoding, countries, weather, and IP lookup.",
    sources: [
      api({ id: "openweather", name: "OpenWeatherMap", pricing: "free-tier", requiresKey: true, docsUrl: "https://openweathermap.org/api", signupUrl: "https://home.openweathermap.org/users/sign_up", envVars: ["OPENWEATHER_API_KEY"], idealFor: "Weather widgets", summary: "Current weather and forecasts.", howItWorks: "GET with lat/lon and API key.", freeLimits: "1,000 calls/day free." }),
      api({ id: "restcountries", name: "REST Countries", pricing: "free", requiresKey: false, docsUrl: "https://restcountries.com/", idealFor: "Country pickers and flags", summary: "Country metadata JSON.", howItWorks: "GET /v3.1/alpha/{code}.", freeLimits: "Public fair use." }),
      api({ id: "nominatim", name: "Nominatim (OSM)", pricing: "free", requiresKey: false, docsUrl: "https://nominatim.org/release-docs/develop/api/Overview/", idealFor: "Address geocoding", summary: "OpenStreetMap search/geocode.", howItWorks: "GET search?q= with User-Agent.", freeLimits: "1 req/sec on public server." }),
      api({ id: "ip-api", name: "ip-api.com", pricing: "free-tier", requiresKey: false, docsUrl: "http://ip-api.com/docs/", idealFor: "IP → location for analytics", summary: "IP geolocation JSON.", howItWorks: "GET /json/{ip}.", freeLimits: "45 req/min; non-commercial free." }),
      api({ id: "geojs", name: "GeoJS", pricing: "free", requiresKey: false, docsUrl: "https://www.geojs.io/docs/v1/", idealFor: "Simple IP country lookup", summary: "Minimal geo API.", howItWorks: "GET get.geojs.io/v1/ip/geo/{ip}.json", freeLimits: "Public free tier." }),
    ],
  },
  {
    id: "finance",
    title: "Finance & crypto",
    description: "Exchange rates, stocks, and cryptocurrency prices.",
    sources: [
      api({ id: "coingecko", name: "CoinGecko", pricing: "free-tier", requiresKey: false, docsUrl: "https://www.coingecko.com/en/api/documentation", signupUrl: "https://www.coingecko.com/en/api", envVars: ["COINGECKO_API_KEY"], idealFor: "Crypto price tickers", summary: "10k+ coin prices.", howItWorks: "GET /simple/price.", freeLimits: "10–30 calls/min demo tier." }),
      api({ id: "frankfurter", name: "Frankfurter", pricing: "free", requiresKey: false, docsUrl: "https://www.frankfurter.app/docs/", idealFor: "Currency conversion", summary: "ECB exchange rates.", howItWorks: "GET latest?from=USD&to=EUR.", freeLimits: "No key; open data." }),
      api({ id: "exchangerate", name: "ExchangeRate-API", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.exchangerate-api.com/docs/overview", signupUrl: "https://www.exchangerate-api.com/", envVars: ["EXCHANGERATE_API_KEY"], idealFor: "Multi-currency apps", summary: "160+ currency rates.", howItWorks: "GET with API key; daily updates on free.", freeLimits: "1,500 req/month free." }),
      api({ id: "alphavantage", name: "Alpha Vantage", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.alphavantage.co/documentation/", signupUrl: "https://www.alphavantage.co/support/#api-key", envVars: ["ALPHA_VANTAGE_API_KEY"], idealFor: "Stock and forex charts", summary: "Market time series data.", howItWorks: "GET with function= and symbol=.", freeLimits: "25 req/day free." }),
    ],
  },
  {
    id: "news",
    title: "News & content",
    description: "Headlines and developer community feeds.",
    sources: [
      api({ id: "newsapi", name: "NewsAPI.org", pricing: "free-tier", requiresKey: true, docsUrl: "https://newsapi.org/docs", signupUrl: "https://newsapi.org/register", envVars: ["NEWS_API_KEY"], idealFor: "News digests and dashboards", summary: "80k+ news sources.", howItWorks: "GET /v2/top-headlines.", freeLimits: "100 req/day dev tier." }),
      api({ id: "gnews", name: "GNews", pricing: "free-tier", requiresKey: true, docsUrl: "https://gnews.io/docs/v4", signupUrl: "https://gnews.io/", envVars: ["GNEWS_API_KEY"], idealFor: "Keyword news search", summary: "Article search API.", howItWorks: "REST v4 with token.", freeLimits: "100 req/day free." }),
      api({ id: "hackernews", name: "Hacker News", pricing: "free", requiresKey: false, docsUrl: "https://github.com/HackerNews/API", idealFor: "Tech news readers", summary: "Official Firebase HN API.", howItWorks: "Fetch topstories then item/{id}.json.", freeLimits: "Public; use caching." }),
      api({ id: "devto", name: "Dev.to", pricing: "free", requiresKey: true, docsUrl: "https://developers.forem.com/api", signupUrl: "https://dev.to/settings/extensions", envVars: ["DEVTO_API_KEY"], idealFor: "Cross-posting and widgets", summary: "Forem articles API.", howItWorks: "api-key header on REST routes.", freeLimits: "Generous for personal use." }),
      api({ id: "reddit", name: "Reddit", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.reddit.com/dev/api/", signupUrl: "https://www.reddit.com/prefs/apps", envVars: ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET"], idealFor: "Subreddit feeds", summary: "OAuth2 Reddit API.", howItWorks: "App credentials → token → /r/{sub}/hot.json.", freeLimits: "100 QPM with OAuth." }),
    ],
  },
  {
    id: "media",
    title: "Images & media",
    description: "Stock photos, placeholders, and GIFs.",
    sources: [
      api({ id: "unsplash", name: "Unsplash", pricing: "free-tier", requiresKey: true, docsUrl: "https://unsplash.com/documentation", signupUrl: "https://unsplash.com/oauth/applications", envVars: ["UNSPLASH_ACCESS_KEY"], idealFor: "Hero images and galleries", summary: "Free high-quality photos.", howItWorks: "Search/random endpoints; attribution required.", freeLimits: "50 req/hr demo tier." }),
      api({ id: "pexels", name: "Pexels", pricing: "free-tier", requiresKey: true, docsUrl: "https://www.pexels.com/api/documentation/", signupUrl: "https://www.pexels.com/api/", envVars: ["PEXELS_API_KEY"], idealFor: "Stock photos and video", summary: "Curated free media.", howItWorks: "Authorization header with key.", freeLimits: "200 req/hr default." }),
      api({ id: "picsum", name: "Lorem Picsum", pricing: "free", requiresKey: false, docsUrl: "https://picsum.photos/", idealFor: "Placeholder images", summary: "Random photos by dimensions.", howItWorks: "GET /800/600 returns JPEG.", freeLimits: "Free CDN." }),
      api({ id: "giphy", name: "Giphy", pricing: "free-tier", requiresKey: true, docsUrl: "https://developers.giphy.com/docs/api/", signupUrl: "https://developers.giphy.com/", envVars: ["GIPHY_API_KEY"], idealFor: "GIF search in chat", summary: "GIF search API.", howItWorks: "API key on search/trending.", freeLimits: "100 calls/hr beta key." }),
    ],
  },
  {
    id: "auth",
    title: "Auth & identity",
    description: "OAuth and identity platforms with free developer tiers.",
    sources: [
      api({ id: "clerk", name: "Clerk", pricing: "free-tier", requiresKey: true, docsUrl: "https://clerk.com/docs", signupUrl: "https://clerk.com/", envVars: ["CLERK_SECRET_KEY"], idealFor: "React/Next.js user auth", summary: "Drop-in auth components.", howItWorks: "Frontend components + JWT verification.", freeLimits: "10,000 MAU free." }),
      api({ id: "auth0", name: "Auth0", pricing: "free-tier", requiresKey: true, docsUrl: "https://auth0.com/docs/api", signupUrl: "https://auth0.com/signup", envVars: ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID"], idealFor: "Enterprise-style OAuth", summary: "Universal Login + Management API.", howItWorks: "OIDC/OAuth2 flows.", freeLimits: "7,500 MAU free." }),
      api({ id: "google-oauth", name: "Google OAuth", pricing: "free", requiresKey: true, docsUrl: "https://developers.google.com/identity/protocols/oauth2", signupUrl: "https://console.cloud.google.com/", envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], idealFor: "Sign in with Google", summary: "Google account OAuth.", howItWorks: "Authorization code flow.", freeLimits: "Free with quotas." }),
      api({ id: "github-oauth", name: "GitHub OAuth", pricing: "free", requiresKey: true, docsUrl: "https://docs.github.com/en/apps/oauth-apps", signupUrl: "https://github.com/settings/developers", envVars: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"], idealFor: "Sign in with GitHub", summary: "OAuth App login for developers.", howItWorks: "Redirect to github.com/login/oauth/authorize.", freeLimits: "Free for OAuth apps." }),
    ],
  },
  {
    id: "demo",
    title: "Demo & learning APIs",
    description: "No-key APIs ideal for tutorials, tests, and hackathons.",
    sources: [
      api({ id: "pokeapi", name: "PokéAPI", pricing: "free", requiresKey: false, docsUrl: "https://pokeapi.co/docs/v2", idealFor: "REST learning projects", summary: "Pokémon data API.", howItWorks: "GET /api/v2/pokemon/{name}.", freeLimits: "Fair use; cache locally." }),
      api({ id: "swapi", name: "SWAPI", pricing: "free", requiresKey: false, docsUrl: "https://swapi.dev/documentation", idealFor: "Pagination tutorials", summary: "Star Wars data API.", howItWorks: "Follow next links in JSON.", freeLimits: "Public read-only." }),
      api({ id: "nasa", name: "NASA Open APIs", pricing: "free", requiresKey: true, docsUrl: "https://api.nasa.gov/", signupUrl: "https://api.nasa.gov/", envVars: ["NASA_API_KEY"], idealFor: "Space dashboards", summary: "APOD, Mars photos, asteroids.", howItWorks: "api_key query param on endpoints.", freeLimits: "1,000 req/hr with key." }),
      api({ id: "jokeapi", name: "JokeAPI", pricing: "free", requiresKey: false, docsUrl: "https://v2.jokeapi.dev/", idealFor: "Demo apps", summary: "Programming jokes JSON.", howItWorks: "GET /joke/Programming.", freeLimits: "120 req/min." }),
      api({ id: "randomuser", name: "RandomUser.me", pricing: "free", requiresKey: false, docsUrl: "https://randomuser.me/documentation", idealFor: "Mock profile UI", summary: "Fake user avatars and data.", howItWorks: "GET /api/?results=N.", freeLimits: "Demo use only." }),
    ],
  },
];

function api(o: ApiSource): ApiSource {
  return o;
}

export function getAllApiSources(): ApiSource[] {
  return API_SOURCE_CATEGORIES.flatMap((c) => c.sources);
}

export function getApiSourceStats() {
  const all = getAllApiSources();
  return {
    total: all.length,
    freeNoKey: all.filter((s) => !s.requiresKey && s.pricing !== "optional-paid").length,
    requiresKey: all.filter((s) => s.requiresKey).length,
    categories: API_SOURCE_CATEGORIES.length,
  };
}

export function getPricingLabel(pricing: ApiPricing): string {
  switch (pricing) {
    case "free":
      return "Free — no key";
    case "free-tier":
      return "Free tier";
    case "optional-paid":
      return "Paid (optional)";
    case "self-hosted":
      return "Self-hosted";
  }
}
