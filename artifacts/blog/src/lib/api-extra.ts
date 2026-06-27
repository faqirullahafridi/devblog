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

export async function getHomeFeed(): Promise<HomeFeed> {
  const res = await fetch("/api/posts/home-feed", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load home feed");
  return res.json();
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
  const buffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const res = await fetch("/api/uploads/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      data: base64,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Upload failed");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function sendNewsletter(data: { subject: string; html: string; postSlug?: string }) {
  const res = await fetch("/api/newsletter/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to send newsletter");
  return res.json();
}

export async function confirmNewsletter(token: string) {
  const res = await fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Invalid token");
  return res.json();
}
