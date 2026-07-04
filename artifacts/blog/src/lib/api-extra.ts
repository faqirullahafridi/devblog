/** API helpers for endpoints not yet in OpenAPI codegen */

export async function submitContact(data: { name: string; email: string; message: string }) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to send");
  }
  return res.json();
}

export async function getRelatedPosts(slug: string, limit = 3) {
  const res = await fetch(`/api/posts/slug/${slug}/related?limit=${limit}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export async function searchPosts(search: string, limit = 6) {
  const res = await fetch(
    `/api/posts?search=${encodeURIComponent(search)}&status=published&limit=${limit}`,
    { credentials: "include" },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data as { posts?: unknown[] }).posts ?? [];
}

export async function getPopularPosts(limit = 6) {
  const res = await fetch(`/api/posts/popular?limit=${limit}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

export type HomeFeed = {
  featured: unknown[];
  recent: unknown[];
  popular: unknown[];
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export async function getHomeFeed(): Promise<HomeFeed> {
  const res = await fetch("/api/posts/home-feed", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load home feed");
  const data = (await res.json()) as Partial<HomeFeed>;
  return {
    featured: asArray(data.featured),
    recent: asArray(data.recent),
    popular: asArray(data.popular),
  };
}

export async function getPostsByTag(tagSlug: string, page = 1, limit = 10) {
  const res = await fetch(
    `/api/posts?tag=${encodeURIComponent(tagSlug)}&status=published&page=${page}&limit=${limit}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json() as Promise<{ posts: unknown[]; total: number; page: number; limit: number }>;
}

export async function uploadImage(file: File): Promise<string> {
  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("Image must be under 4 MB. Resize it or use an external image URL.");
  }

  const data = await readFileAsBase64(file);
  const res = await fetch("/api/uploads/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      data,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Upload failed");
  }
  const json = (await res.json()) as { url: string };
  return json.url;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read image file"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export async function resolveImageUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const res = await fetch("/api/media/resolve-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url: trimmed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Could not resolve image URL");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export type AdminLoginResponse = {
  authenticated: boolean;
  username: string | null;
  otpRequired?: boolean;
  message?: string;
  error?: string;
};

export type AdminAuthResponse = {
  authenticated: boolean;
  username: string | null;
  expiresAt?: number | null;
  error?: string;
};

export async function requestAdminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json()) as AdminLoginResponse;
  if (!res.ok) throw new Error(data.error || "Invalid credentials");
  return data;
}

export async function verifyAdminOtp(username: string, otp: string): Promise<AdminAuthResponse> {
  const res = await fetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, otp }),
  });
  const data = (await res.json()) as AdminAuthResponse;
  if (!res.ok) throw new Error(data.error || "Invalid verification code");
  return data;
}

export async function requestPasswordResetOtp(username: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username }),
  });
  const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Failed to request reset code");
  return { success: Boolean(data.success), message: data.message };
}

export async function resetPasswordWithOtp(
  username: string,
  otp: string,
  newPassword: string,
): Promise<{ success: boolean }> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, otp, newPassword }),
  });
  const data = (await res.json()) as { success?: boolean; error?: string };
  if (!res.ok) throw new Error(data.error || "Failed to reset password");
  return { success: Boolean(data.success) };
}

export async function sendNewsletter(data: { subject: string; html: string; postSlug?: string }) {
  const res = await fetch("/api/newsletter/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json().catch(() => ({}))) as { error?: string; sent?: number; total?: number };
  if (!res.ok) throw new Error(body.error || "Failed to send newsletter");
  return body;
}

export async function confirmNewsletter(token: string) {
  const res = await fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Invalid token");
  return res.json();
}

export type DevHeadline = {
  id: string;
  title: string;
  url: string;
  source: "hackernews" | "devto";
  score?: number;
  comments?: number;
  author?: string;
};

export async function getDevHeadlines(limit = 8): Promise<{ items: DevHeadline[] }> {
  const res = await fetch(`/api/feeds/dev-headlines?limit=${limit}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load dev headlines");
  return res.json();
}

export type GitHubUser = {
  authenticated: boolean;
  user: {
    id?: string;
    login?: string;
    name?: string;
    avatar?: string;
  } | null;
};

export async function getGitHubUser(): Promise<GitHubUser> {
  const res = await fetch("/api/auth/github/me", { credentials: "include" });
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
}

export async function logoutGitHub(): Promise<void> {
  await fetch("/api/auth/github/logout", { method: "POST", credentials: "include" });
}

export type SiteUserAuth = {
  authenticated: boolean;
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
  } | null;
};

export async function getSiteUser(): Promise<SiteUserAuth> {
  const res = await fetch("/api/auth/user/me", { credentials: "include" });
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
}

export async function signupSiteUser(data: {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}): Promise<SiteUserAuth> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as SiteUserAuth & { error?: string };
  if (!res.ok) throw new Error(body.error || "Could not create account");
  return body;
}

export async function loginSiteUser(data: { login: string; password: string }): Promise<SiteUserAuth> {
  const res = await fetch("/api/auth/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as SiteUserAuth & { error?: string };
  if (!res.ok) throw new Error(body.error || "Sign-in failed");
  return body;
}

export async function logoutSiteUser(): Promise<void> {
  await fetch("/api/auth/user/logout", { method: "POST", credentials: "include" });
}

export async function getIntegrationsStatus() {
  const res = await fetch("/api/integrations/status", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load integrations status");
  return res.json();
}
