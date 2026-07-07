import { getSiteUrl } from "./resend";

const INDEXNOW_API = "https://api.indexnow.org/indexnow";

export function getIndexNowKey(): string {
  return process.env.INDEXNOW_KEY?.trim() || "";
}

export function getIndexNowKeyLocation(siteUrl: string, key: string): string {
  return `${siteUrl.replace(/\/$/, "")}/${key}.txt`;
}

function tagSlug(tag: string): string {
  return String(tag)
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/^-|-$/g, "");
}

type PostLike = {
  status?: string | null;
  slug?: string | null;
  publishAt?: string | Date | null;
  categorySlug?: string | null;
  tags?: string[] | null;
};

export function isPostPubliclyVisible(post: PostLike | null | undefined): boolean {
  if (!post || post.status !== "published") return false;
  if (post.publishAt) {
    const at = new Date(post.publishAt);
    if (!Number.isNaN(at.getTime()) && at > new Date()) return false;
  }
  return Boolean(post.slug);
}

export function urlsForPublishedPost(post: PostLike): string[] {
  const site = getSiteUrl().replace(/\/$/, "");
  const urls = [`${site}/post/${post.slug}`, `${site}/`];
  if (post.categorySlug) urls.push(`${site}/category/${post.categorySlug}`);
  for (const tag of post.tags ?? []) {
    const slug = tagSlug(tag);
    if (slug) urls.push(`${site}/tag/${slug}`);
  }
  return [...new Set(urls)];
}

export async function submitIndexNowUrls(urlList: string[]) {
  const key = getIndexNowKey();
  if (!key || !urlList.length) return { ok: false as const, skipped: true as const };

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  let host: string;
  try {
    host = new URL(siteUrl).host;
  } catch {
    return { ok: false as const, error: "Invalid SITE_URL" };
  }

  const body = {
    host,
    key,
    keyLocation: getIndexNowKeyLocation(siteUrl, key),
    urlList: urlList.slice(0, 10_000),
  };

  try {
    const res = await fetch(INDEXNOW_API, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    if (res.ok || res.status === 202) {
      return { ok: true as const, status: res.status };
    }
    const text = await res.text().catch(() => "");
    console.warn("[indexnow] submit failed", res.status, text);
    return { ok: false as const, status: res.status, error: text };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[indexnow] submit error", message);
    return { ok: false as const, error: message };
  }
}

/** Fire-and-forget: notify Bing/Yandex/etc. when a post is publicly visible. */
export function notifyIndexNowForPost(post: PostLike | null | undefined): void {
  if (!isPostPubliclyVisible(post)) return;
  const urls = urlsForPublishedPost(post!);
  void submitIndexNowUrls(urls);
}
