/** Platform feature API — typed fetch helpers with React Query keys */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ── AI ──────────────────────────────────────────────────────────────
export type AiMessage = { id: number; role: string; content: string; createdAt: string };
export type AiConversation = { id: number; title: string; mode: string; updatedAt: string; messages?: AiMessage[] };

export const aiKeys = {
  conversations: ["ai", "conversations"] as const,
  conversation: (id: number) => ["ai", "conversation", id] as const,
  usage: ["ai", "usage"] as const,
};

export function listAiConversations() {
  return apiFetch<AiConversation[]>("/ai/conversations");
}

export function getAiConversation(id: number) {
  return apiFetch<AiConversation & { messages: AiMessage[] }>(`/ai/conversations/${id}`);
}

export function sendAiMessage(mode: string, message: string, conversationId?: number) {
  return apiFetch<{ conversationId: number; message: AiMessage }>(`/ai/chat/${mode}`, {
    method: "POST",
    body: JSON.stringify({ message, conversationId }),
  });
}

export function getAiUsage() {
  return apiFetch<{ total: number; tokensIn: number; tokensOut: number }>("/ai/usage/me");
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
