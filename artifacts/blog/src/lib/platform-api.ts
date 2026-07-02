/** Platform feature API — typed fetch helpers with React Query keys */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = (err as { error?: string }).error || `Request failed (${res.status})`;
    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function apiFetchWithRetry<T>(path: string, init?: RequestInit, retries = 2): Promise<T> {
  let lastErr: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiFetch<T>(path, init);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      const status = (lastErr as Error & { status?: number }).status;
      const retryable = status === 503 || status === 502 || status === 504 || status === 500;
      if (attempt < retries && retryable) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

// ── AI ──────────────────────────────────────────────────────────────
export type AiMessage = { id: number; role: string; content: string; createdAt: string };
export type AiConversation = { id: number; title: string; mode: string; updatedAt: string; messages?: AiMessage[] };

export const aiKeys = {
  conversations: (mode?: string) => (mode ? (["ai", "conversations", mode] as const) : (["ai", "conversations"] as const)),
  conversation: (id: number) => ["ai", "conversation", id] as const,
  usage: ["ai", "usage"] as const,
  status: ["ai", "status"] as const,
  models: (mode: string) => ["ai", "models", mode] as const,
};

export function listAiConversations(mode?: string) {
  const q = mode ? `?mode=${encodeURIComponent(mode)}` : "";
  return apiFetch<AiConversation[]>(`/ai/conversations${q}`);
}

export function getAiConversation(id: number) {
  return apiFetchWithRetry<AiConversation & { messages: AiMessage[] }>(`/ai/conversations/${id}`);
}

export function deleteAiConversation(id: number) {
  return apiFetch<void>(`/ai/conversations/${id}`, { method: "DELETE" });
}

export function sendAiMessage(mode: string, message: string, conversationId?: number, modelId?: string) {
  return apiFetch<{
    conversationId: number;
    message: AiMessage;
    model?: { provider: string; name: string };
  }>(`/ai/chat/${mode}`, {
    method: "POST",
    body: JSON.stringify({ message, conversationId, modelId: modelId && modelId !== "auto" ? modelId : undefined }),
  });
}

export type AiStreamDone = {
  conversationId: number;
  message: AiMessage;
  model?: { provider: string; name: string };
  usage?: { tokensIn: number; tokensOut: number };
};

export async function streamAiMessage(
  mode: string,
  message: string,
  handlers: {
    onStart?: (conversationId: number) => void;
    onDelta: (chunk: string, fullText: string) => void;
    onDone: (data: AiStreamDone) => void;
    onError: (error: string) => void;
  },
  conversationId?: number,
  modelId?: string,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`/api/ai/chat/${mode}`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      message,
      conversationId,
      stream: true,
      modelId: modelId && modelId !== "auto" ? modelId : undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Streaming not supported");

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      for (const line of event.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6)) as {
            type: string;
            content?: string;
            conversationId?: number;
            message?: AiMessage;
            model?: { provider: string; name: string };
            usage?: { tokensIn: number; tokensOut: number };
            error?: string;
          };

          if (data.type === "start" && data.conversationId != null) {
            handlers.onStart?.(data.conversationId);
          } else if (data.type === "delta" && data.content) {
            fullText += data.content;
            handlers.onDelta(data.content, fullText);
          } else if (data.type === "done" && data.message && data.conversationId != null) {
            handlers.onDone({
              conversationId: data.conversationId,
              message: data.message,
              model: data.model,
              usage: data.usage,
            });
          } else if (data.type === "error" && data.error) {
            handlers.onError(data.error);
          }
        } catch {
          /* skip malformed SSE chunk */
        }
      }
    }
  }
}

export function getAiUsage() {
  return apiFetch<{ total: number; tokensIn: number; tokensOut: number }>("/ai/usage/me");
}

export type AiModelOption = {
  id: string;
  provider: string;
  model: string;
  label: string;
  category?: AiModelCategory;
};

export type AiStatus = {
  configured: boolean;
  provider: string;
  providers: Array<{ name: string; model: string }>;
  models?: AiModelOption[];
};

import { AI_MODEL_PICKER_OPTIONS } from "@/lib/ai-model-prefs";
import type { AiModelCategory } from "@/lib/ai-model-categories";

export function aiModelOptionId(provider: string, model: string): string {
  return `${provider}::${model}`;
}

const PICKER_CATEGORY: Record<string, AiModelCategory> = {
  auto: "chat",
  "category::chat": "chat",
  "category::code": "code",
  "category::image": "image",
};

function pickerOptionsAsModels(): AiModelOption[] {
  return AI_MODEL_PICKER_OPTIONS.map((o) => ({
    id: o.id,
    provider: o.id === "auto" ? "auto" : "category",
    model: o.id === "auto" ? "auto" : o.id.slice("category::".length),
    label: o.label,
    category: PICKER_CATEGORY[o.id] ?? "chat",
  }));
}

export function getAiStatus() {
  return apiFetch<AiStatus>("/ai/status");
}

export function getAiModels(mode: string) {
  return apiFetch<{ mode: string; models: AiModelOption[] }>(`/ai/models?mode=${encodeURIComponent(mode)}`);
}

/** Tries /ai/models, then /ai/status — works with older API builds missing the models route. */
export async function resolveAiModels(mode: string): Promise<{ mode: string; models: AiModelOption[]; source: "models" | "status" | "default" }> {
  try {
    const data = await getAiModels(mode);
    if (data.models?.length) return { ...data, source: "models" };
  } catch {
    /* /ai/models missing or failed — fall back to status */
  }

  try {
    const status = await getAiStatus();
    if (status.models?.length) {
      return { mode, models: status.models, source: "status" };
    }
    if (status.providers?.length) {
      return {
        mode,
        models: pickerOptionsAsModels(),
        source: "status",
      };
    }
  } catch {
    /* API unreachable */
  }

  return { mode, models: pickerOptionsAsModels(), source: "default" };
}

// ── Playground ──────────────────────────────────────────────────────
export type PlaygroundFile = { filename: string; content: string };
export type Playground = {
  id: number;
  slug: string;
  title: string;
  language: string;
  isPublic: boolean;
  authorName: string;
  views: number;
  files: PlaygroundFile[];
};

export const playgroundKeys = {
  list: (lang?: string) => ["playgrounds", lang] as const,
  detail: (slug: string) => ["playgrounds", slug] as const,
};

export function listPlaygrounds(params?: { language?: string; search?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.language) q.set("language", params.language);
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<{ playgrounds: Playground[]; total: number }>(`/playgrounds?${q}`);
}

export function getPlayground(slug: string) {
  return apiFetch<Playground>(`/playgrounds/${slug}`);
}

export function savePlayground(data: {
  title: string;
  language: string;
  isPublic?: boolean;
  authorName?: string;
  files: PlaygroundFile[];
  forkedFromId?: number;
}) {
  return apiFetch<Playground>("/playgrounds", { method: "POST", body: JSON.stringify(data) });
}

export function updatePlayground(slug: string, data: {
  title?: string;
  isPublic?: boolean;
  files?: PlaygroundFile[];
  language?: string;
}) {
  return apiFetch<Playground>(`/playgrounds/${slug}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function sharePlayground(slug: string) {
  return apiFetch<{ shareToken: string; expiresAt: string }>(`/playgrounds/${slug}/share`, { method: "POST" });
}

export function getPlaygroundByShareToken(token: string) {
  return apiFetch<Playground>(`/playgrounds/share/${token}`);
}

export async function forkPlayground(slug: string) {
  const source = await getPlayground(slug);
  return savePlayground({
    title: `${source.title} (fork)`,
    language: source.language,
    isPublic: false,
    files: source.files,
    forkedFromId: source.id,
  });
}

// ── Roadmaps ────────────────────────────────────────────────────────
export type RoadmapPayload = {
  goal: string;
  currentLevel: string;
  title: string;
  summary: string;
  totalWeeks: number;
  steps: Array<{ key: string; title: string; description: string; learnHref?: string; estimatedWeeks: number }>;
  resources: Array<{ title: string; href: string; type: string }>;
};

export function getRoadmapOptions() {
  return apiFetch<{ levels: string[]; goals: Array<{ slug: string; label: string }> }>("/roadmaps/options");
}

export function generateRoadmap(currentLevel: string, goal: string) {
  return apiFetch<{ slug: string; payload: RoadmapPayload; title: string }>("/roadmaps/generate", {
    method: "POST",
    body: JSON.stringify({ currentLevel, goal }),
  });
}

export function getRoadmap(slug: string) {
  return apiFetch<{ slug: string; payload: RoadmapPayload; progress: Array<{ itemKey: string; completed: boolean }>; isOwner: boolean }>(
    `/roadmaps/${slug}`,
  );
}

export function updateRoadmapProgress(slug: string, itemKey: string, completed: boolean) {
  return apiFetch<{ ok: boolean }>(`/roadmaps/${slug}/progress`, {
    method: "POST",
    body: JSON.stringify({ itemKey, completed }),
  });
}

// ── Challenges ──────────────────────────────────────────────────────
export type Challenge = {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
  starterCode: string;
  testCases: Array<{ input: string; expected: string }>;
  points: number;
  isDaily?: boolean;
  solutionCode?: string;
};

export function listChallenges(params?: { difficulty?: string; category?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.difficulty) q.set("difficulty", params.difficulty);
  if (params?.category) q.set("category", params.category);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<{ challenges: Challenge[]; total: number }>(`/challenges?${q}`);
}

export function getChallenge(slug: string) {
  return apiFetch<Challenge>(`/challenges/${slug}`);
}

export function getDailyChallenge() {
  return apiFetch<Challenge>("/challenges/daily");
}

export function submitChallenge(slug: string, code: string, authorName?: string) {
  return apiFetch<{ submission: unknown; result: { passed: boolean; results: unknown[]; error?: string } }>(
    `/challenges/${slug}/submit`,
    { method: "POST", body: JSON.stringify({ code, authorName }) },
  );
}

export function getLeaderboard() {
  return apiFetch<Array<{ authorName: string; totalPoints: number; challengesSolved: number }>>("/challenges/leaderboard");
}

// ── Jobs ────────────────────────────────────────────────────────────
export type Job = {
  id: number;
  slug: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  remote: boolean;
  salaryRange?: string | null;
  category: string;
  applyUrl: string;
  source?: string | null;
  region?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt?: string;
  bookmarked?: boolean;
  related?: Job[];
  mayNeedTranslation?: boolean;
};

export type JobSource = {
  id: string;
  label: string;
  description: string;
  region: string;
  requiresKey: boolean;
  hiddenByDefault?: boolean;
};

export function listJobSources() {
  return apiFetch<JobSource[]>("/jobs/sources");
}

export function listJobs(params?: {
  category?: string;
  search?: string;
  remote?: boolean;
  source?: string;
  region?: string;
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.search) q.set("search", params.search);
  if (params?.remote) q.set("remote", "true");
  if (params?.source) q.set("source", params.source);
  if (params?.region) q.set("region", params.region);
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  return apiFetch<{ jobs: Job[]; total: number; page: number; limit: number }>(`/jobs?${q}`);
}

export function getJob(slug: string) {
  return apiFetch<Job>(`/jobs/${slug}`);
}

export function toggleJobBookmark(slug: string) {
  return apiFetch<{ bookmarked: boolean }>(`/jobs/${slug}/bookmark`, { method: "POST" });
}

export function translateJobField(slug: string, field: "description" | "requirements" = "description") {
  return apiFetch<{ field: string; text: string; translated: boolean }>(`/jobs/${slug}/translate`, {
    method: "POST",
    body: JSON.stringify({ field }),
  });
}

export function listAdminJobsManual(params?: { search?: string }) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  return apiFetch<{ jobs: Array<Job & { isActive: boolean; expiresAt?: string | null }>; total: number }>(
    `/jobs/admin?${q}`,
  );
}

export function createJobManual(data: Record<string, unknown>) {
  return apiFetch<Job>("/jobs", { method: "POST", body: JSON.stringify(data) });
}

export function updateJobManual(id: number, data: Record<string, unknown>) {
  return apiFetch<Job>(`/jobs/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function listAdminChallengesManual(params?: { search?: string }) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  return apiFetch<{ challenges: Array<Challenge & { solutionCode?: string }>; total: number }>(
    `/challenges/admin?${q}`,
  );
}

export function createChallengeManual(data: Record<string, unknown>) {
  return apiFetch<Challenge>("/challenges", { method: "POST", body: JSON.stringify(data) });
}

export function updateChallengeManual(id: number, data: Record<string, unknown>) {
  return apiFetch<Challenge>(`/challenges/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// ── Community ───────────────────────────────────────────────────────
export type CommunityQuestion = {
  id: number;
  slug: string;
  title: string;
  body: string;
  authorName: string;
  tags: string[];
  views: number;
  score: number;
  status: string;
  createdAt: string;
  answers?: Array<{ id: number; body: string; authorName: string; score: number; isAccepted: boolean; createdAt: string }>;
};

export function listCommunityQuestions(params?: { search?: string; tag?: string; page?: number }) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.tag) q.set("tag", params.tag);
  if (params?.page) q.set("page", String(params.page));
  return apiFetch<{ questions: CommunityQuestion[]; total: number }>(`/community/questions?${q}`);
}

export function getCommunityQuestion(id: number) {
  return apiFetch<CommunityQuestion>(`/community/questions/${id}`);
}

export function createCommunityQuestion(data: { title: string; body: string; tags?: string[]; authorName?: string }) {
  return apiFetch<CommunityQuestion>("/community/questions", { method: "POST", body: JSON.stringify(data) });
}

export function postCommunityAnswer(questionId: number, body: string, authorName?: string) {
  return apiFetch<unknown>(`/community/questions/${questionId}/answers`, {
    method: "POST",
    body: JSON.stringify({ body, authorName }),
  });
}

export function voteCommunity(targetType: "question" | "answer", targetId: number, value: 1 | -1) {
  return apiFetch<{ ok: boolean }>("/community/vote", {
    method: "POST",
    body: JSON.stringify({ targetType, targetId, value }),
  });
}

// ── Admin platform stats ────────────────────────────────────────────
export function getAiAdminStats() {
  return apiFetch<{ totals: unknown; daily: unknown[]; topModes: unknown[] }>("/ai/stats");
}

export function getPlaygroundAdminStats() {
  return apiFetch<{ totals: unknown; popular: unknown[] }>("/playgrounds/stats");
}

export function getRoadmapAdminStats() {
  return apiFetch<{ totalRoadmaps: number; completedSteps: number; topGoals: unknown[] }>("/roadmaps/stats");
}

export function getChallengeAdminStats() {
  return apiFetch<{ challenges: number; submissions: number }>("/challenges/stats");
}

export function getCommunityReports(status = "pending") {
  return apiFetch<unknown[]>(`/community/moderation/reports?status=${status}`);
}
