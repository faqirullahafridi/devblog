import { cached } from "../memory-cache";
import { fetchJson } from "./http";

export type DevHeadline = {
  id: string;
  title: string;
  url: string;
  source: "hackernews" | "devto";
  score?: number;
  comments?: number;
  author?: string;
};

const HN_API = "https://hacker-news.firebaseio.com/v0";

async function fetchHackerNews(limit = 8): Promise<DevHeadline[]> {
  const ids = await fetchJson<number[]>(`${HN_API}/topstories.json`);
  const top = ids.slice(0, limit);
  const settled = await Promise.allSettled(
    top.map(async (id) => {
      const item = await fetchJson<{
        title?: string;
        url?: string;
        score?: number;
        descendants?: number;
        by?: string;
      }>(`${HN_API}/item/${id}.json`);
      return {
        id: `hn-${id}`,
        title: item.title ?? "Untitled",
        url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
        source: "hackernews" as const,
        score: item.score,
        comments: item.descendants,
        author: item.by,
      };
    }),
  );

  return settled
    .filter((r): r is PromiseFulfilledResult<DevHeadline> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((item) => item.title);
}

async function fetchDevTo(limit = 8): Promise<DevHeadline[]> {
  const key = process.env.DEVTO_API_KEY?.trim();
  const headers: Record<string, string> = {};
  if (key) headers["api-key"] = key;

  const articles = await fetchJson<
    Array<{
      id: number;
      title: string;
      url: string;
      positive_reactions_count?: number;
      comments_count?: number;
      user?: { username?: string };
    }>
  >(`https://dev.to/api/articles?per_page=${limit}`, { headers });

  return articles.map((a) => ({
    id: `devto-${a.id}`,
    title: a.title,
    url: a.url,
    source: "devto" as const,
    score: a.positive_reactions_count,
    comments: a.comments_count,
    author: a.user?.username,
  }));
}

export async function getDevHeadlines(limit = 8): Promise<DevHeadline[]> {
  return cached(`feeds:dev-headlines:v2:${limit}`, 10 * 60_000, async () => {
    const perSource = Math.ceil(limit / 2);
    const [hn, devto] = await Promise.allSettled([fetchHackerNews(perSource), fetchDevTo(perSource)]);
    const items: DevHeadline[] = [];
    if (hn.status === "fulfilled") items.push(...hn.value);
    if (devto.status === "fulfilled") items.push(...devto.value);
    return items.slice(0, limit);
  });
}

export type TechNewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt?: string;
};

async function fetchNewsApi(limit = 6): Promise<TechNewsItem[]> {
  const key = process.env.NEWS_API_KEY?.trim();
  if (!key) return [];

  const data = await fetchJson<{
    articles?: Array<{ title?: string; url?: string; source?: { name?: string }; publishedAt?: string }>;
  }>(
    `https://newsapi.org/v2/top-headlines?category=technology&pageSize=${limit}&language=en&apiKey=${encodeURIComponent(key)}`,
  );

  return (data.articles ?? [])
    .filter((a) => a.title && a.url)
    .map((a) => ({
      title: a.title!,
      url: a.url!,
      source: a.source?.name ?? "NewsAPI",
      publishedAt: a.publishedAt,
    }));
}

async function fetchGNews(limit = 6): Promise<TechNewsItem[]> {
  const key = process.env.GNEWS_API_KEY?.trim();
  if (!key) return [];

  const data = await fetchJson<{
    articles?: Array<{ title?: string; url?: string; source?: { name?: string }; publishedAt?: string }>;
  }>(
    `https://gnews.io/api/v4/search?q=software+developer&max=${limit}&lang=en&token=${encodeURIComponent(key)}`,
  );

  return (data.articles ?? [])
    .filter((a) => a.title && a.url)
    .map((a) => ({
      title: a.title!,
      url: a.url!,
      source: a.source?.name ?? "GNews",
      publishedAt: a.publishedAt,
    }));
}

export async function getTechNews(limit = 6): Promise<TechNewsItem[]> {
  return cached(`feeds:tech-news:${limit}`, 15 * 60_000, async () => {
    const [newsapi, gnews] = await Promise.allSettled([fetchNewsApi(limit), fetchGNews(limit)]);
    const items: TechNewsItem[] = [];
    if (newsapi.status === "fulfilled") items.push(...newsapi.value);
    if (gnews.status === "fulfilled") items.push(...gnews.value);
    return items.slice(0, limit);
  });
}
