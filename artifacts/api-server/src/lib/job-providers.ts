import http from "node:http";
import https from "node:https";
import tls from "node:tls";

const httpsAgent = new https.Agent({ ca: tls.rootCertificates });
const USER_AGENT = "DevBlog-Jobs/1.0 (+https://devblog.local/jobs)";

export type JobRegion = "global" | "pakistan" | "europe";

export type ExternalJob = {
  source: string;
  externalId: string;
  title: string;
  company: string;
  description: string;
  location: string;
  remote: boolean;
  salaryRange?: string;
  category: string;
  applyUrl: string;
  region: JobRegion;
  postedAt?: Date;
};

export type JobSourceId = "remoteok" | "remotive" | "arbeitnow" | "themuse" | "jooble" | "everjobs";

export type JobSourceMeta = {
  id: JobSourceId;
  label: string;
  description: string;
  region: JobRegion;
  requiresKey: boolean;
  /** Omitted from public job list until user picks this source filter */
  hiddenByDefault?: boolean;
};

/** Sources excluded from GET /jobs unless `?source=` is set explicitly */
export const HIDDEN_DEFAULT_JOB_SOURCES: JobSourceId[] = ["arbeitnow"];

export const JOB_SOURCES: JobSourceMeta[] = [
  { id: "remoteok", label: "RemoteOK", description: "Remote developer jobs", region: "global", requiresKey: false },
  { id: "remotive", label: "Remotive", description: "Tech and startup jobs", region: "global", requiresKey: false },
  {
    id: "arbeitnow",
    label: "Arbeitnow",
    description: "European opportunities (German listings — use Translate on job page)",
    region: "europe",
    requiresKey: false,
    hiddenByDefault: true,
  },
  { id: "themuse", label: "The Muse", description: "Company profiles & roles", region: "global", requiresKey: false },
  { id: "jooble", label: "Jooble", description: "Pakistan IT jobs (Jooble)", region: "pakistan", requiresKey: true },
  { id: "everjobs", label: "Ever Jobs", description: "160+ sources worldwide", region: "global", requiresKey: true },
];

const IT_KEYWORDS = [
  "developer", "engineer", "software", "devops", "frontend", "backend", "full stack", "fullstack",
  "react", "node", "nodejs", "python", "javascript", "typescript", "java", "golang", "rust",
  "data engineer", "data scientist", "machine learning", "ml ", "qa ", "quality assurance", "sre",
  "site reliability", "cloud", "kubernetes", "mobile", "ios", "android", "web dev", "programmer",
  "architect", "database", "sql", "postgres", "cyber", "security engineer", "platform engineer",
  "infrastructure", "it ", "it-", "tech lead", "engineering", "sdk", "api ", "blockchain", "crypto dev",
  ".net", "c++", "c#", "ruby", "php", "laravel", "django", "flask", "spring", "scala", "kotlin",
  "swift", "embedded", "firmware", "network engineer", "systems engineer", "product engineer",
];

const NON_IT_KEYWORDS = [
  "sales manager", "account executive", "customer support", "virtual assistant", "marketing manager",
  "recruiter", "hr ", "human resources", "nurse", "teacher", "accountant", "bookkeeper", "driver",
  "warehouse", "cashier", "food associate", "cleaning", "receptionist",
];

export function isItJob(title: string, description = "", tags: string[] = []): boolean {
  const text = [title, description, ...tags].join(" ").toLowerCase();
  if (NON_IT_KEYWORDS.some((kw) => text.includes(kw))) {
    const hasStrongIt = ["software", "developer", "engineer", "devops", "programmer"].some((kw) => text.includes(kw));
    if (!hasStrongIt) return false;
  }
  return IT_KEYWORDS.some((kw) => text.includes(kw));
}

const PAKISTAN_GEO_MARKERS = [
  "pakistan",
  "karachi",
  "lahore",
  "islamabad",
  "rawalpindi",
  "peshawar",
  "faisalabad",
  "multan",
  "sialkot",
  "quetta",
  "gujranwala",
  "hyderabad",
  "punjab",
  "sindh",
  "kpk",
  "balochistan",
];

/** Jooble's location param is unreliable for PK — match Pakistan from title + location text only. */
export function isPakistanJob(title: string, location: string): boolean {
  const geo = `${title} ${location}`.toLowerCase();
  return PAKISTAN_GEO_MARKERS.some((marker) => geo.includes(marker));
}

const DEFAULT_JOOBLE_PAKISTAN_KEYWORDS = [
  "software engineer Pakistan",
  "software developer Pakistan",
  "web developer Pakistan",
  "python developer Pakistan",
  "developer Lahore Pakistan",
  "developer Karachi Pakistan",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function inferCategory(title: string, tags: string[] = []): string {
  const text = [title, ...tags].join(" ").toLowerCase();
  if (text.includes("react") || text.includes("frontend") || text.includes("front-end")) return "frontend";
  if (text.includes("node") || text.includes("backend") || text.includes("back-end")) return "backend";
  if (text.includes("full stack") || text.includes("fullstack")) return "full-stack";
  if (text.includes("python") || text.includes("django")) return "python";
  if (text.includes("devops") || text.includes("sre") || text.includes("kubernetes")) return "devops";
  if (text.includes("qa") || text.includes("quality") || text.includes("test engineer")) return "qa";
  if (text.includes("remote")) return "remote";
  return "full-stack";
}

export function sourceAttribution(source: JobSourceId): string {
  const links: Record<JobSourceId, string> = {
    remoteok: "[Remote OK](https://remoteok.com)",
    remotive: "[Remotive](https://remotive.com)",
    arbeitnow: "[Arbeitnow](https://www.arbeitnow.com)",
    themuse: "[The Muse](https://www.themuse.com)",
    jooble: "[Jooble](https://jooble.org)",
    everjobs: "[Ever Jobs](https://github.com/ever-jobs/ever-jobs)",
  };
  return `\n\n---\n*Job sourced via ${links[source]}.*`;
}

export async function fetchJson<T>(url: string, init?: { method?: string; headers?: Record<string, string>; body?: unknown }): Promise<T> {
  const payload = init?.body ? JSON.stringify(init.body) : undefined;
  const parsed = new URL(url);
  const isHttps = parsed.protocol === "https:";
  const lib = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: init?.method ?? "GET",
        agent: isHttps ? httpsAgent : undefined,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
          ...init?.headers,
        },
      },
      (res) => {
        let text = "";
        res.on("data", (chunk) => {
          text += chunk;
        });
        res.on("end", () => {
          if ((res.statusCode ?? 500) >= 400) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}: ${text.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(text) as T);
          } catch {
            reject(new Error(`Invalid JSON from ${url}`));
          }
        });
      },
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => {
      const heading = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return heading ? `\n\n${"#".repeat(Math.min(Number(level), 6))} ${heading}\n\n` : "\n\n";
    })
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
      const label = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return label ? `[${label}](${href})` : href;
    })
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => {
      const item = decodeHtmlEntities(inner.replace(/<[^>]+>/g, "").trim());
      return item ? `\n- ${item}` : "";
    })
    .replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "");

  return decodeHtmlEntities(text)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanArbeitnowBoilerplate(html: string): string {
  return html
    .replace(/<p>\s*Find[\s\S]*?Arbeitnow[\s\S]*?<\/p>/gi, "")
    .replace(/Find[\s\S]*?Jobs in Germany[\s\S]*?Arbeitnow/gi, "")
    .replace(/\s*on Arbeitnow\s*<\/a>?/gi, "")
    .trim();
}

function truncate(text: string, max = 4000): string {
  return text.length <= max ? text : `${text.slice(0, max)}…`;
}

function safeDate(value?: Date | string | number): Date | undefined {
  if (value == null) return undefined;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function fetchRemoteOkJobs(): Promise<ExternalJob[]> {
  const raw = await fetchJson<Array<Record<string, unknown>>>("https://remoteok.com/api?tags=dev");
  const jobs: ExternalJob[] = [];

  for (const item of raw) {
    if (!item.id || item.id === "0" || typeof item.position !== "string") continue;
    const tags = Array.isArray(item.tags) ? item.tags.map(String) : [];
    const title = String(item.position);
    const description = truncate(stripHtml(String(item.description ?? "")));
    if (!isItJob(title, description, tags)) continue;

    jobs.push({
      source: "remoteok",
      externalId: String(item.id),
      title,
      company: String(item.company ?? "Unknown"),
      description: `${description || title}${sourceAttribution("remoteok")}`,
      location: String(item.location ?? "Remote"),
      remote: true,
      salaryRange: item.salary ? String(item.salary) : undefined,
      category: inferCategory(title, tags),
      applyUrl: String(item.url ?? item.apply_url ?? `https://remoteok.com/remote-jobs/${item.id}`),
      region: "global",
      postedAt: safeDate(item.date ? String(item.date) : item.epoch ? Number(item.epoch) * 1000 : undefined),
    });
  }

  return jobs;
}

export async function fetchRemotiveJobs(): Promise<ExternalJob[]> {
  const data = await fetchJson<{ jobs?: Array<Record<string, unknown>> }>("https://remotive.com/api/remote-jobs");
  const jobs: ExternalJob[] = [];

  for (const item of data.jobs ?? []) {
    const title = String(item.title ?? "");
    const description = truncate(stripHtml(String(item.description ?? "")));
    const tags = String(item.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!isItJob(title, description, tags)) continue;

    jobs.push({
      source: "remotive",
      externalId: String(item.id),
      title,
      company: String(item.company_name ?? "Unknown"),
      description: `${description || title}${sourceAttribution("remotive")}`,
      location: String(item.candidate_required_location ?? "Remote"),
      remote: true,
      salaryRange: item.salary ? String(item.salary) : undefined,
      category: inferCategory(title, tags),
      applyUrl: String(item.url),
      region: "global",
      postedAt: safeDate(String(item.publication_date ?? "")),
    });
  }

  return jobs;
}

export async function fetchArbeitnowJobs(): Promise<ExternalJob[]> {
  const jobs: ExternalJob[] = [];
  const seen = new Set<string>();
  const maxPages = Number(process.env.JOBS_ARBEITNOW_MAX_PAGES ?? 30);

  for (let page = 1; page <= maxPages; page++) {
    const data = await fetchJson<{
      data?: Array<Record<string, unknown>>;
      links?: { next?: string | null };
    }>(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);

    for (const item of data.data ?? []) {
      const externalId = String(item.slug ?? item.url);
      if (seen.has(externalId)) continue;
      seen.add(externalId);

      const title = String(item.title ?? "");
      const tags = Array.isArray(item.tags) ? item.tags.map(String) : [];
      const rawDescription = cleanArbeitnowBoilerplate(String(item.description ?? title));
      const description = truncate(stripHtml(rawDescription));
      if (!isItJob(title, description, tags)) continue;

      const remote = Boolean(item.remote) || String(item.location ?? "").toLowerCase().includes("remote");

      jobs.push({
        source: "arbeitnow",
        externalId,
        title,
        company: String(item.company_name ?? "Unknown"),
        description: `${description}${sourceAttribution("arbeitnow")}`,
        location: String(item.location ?? "Europe"),
        remote,
        category: inferCategory(title, tags),
        applyUrl: String(item.url),
        region: "europe",
        postedAt: safeDate(String(item.created_at ?? "")),
      });
    }

    if (!data.links?.next || (data.data?.length ?? 0) === 0) break;
  }

  return jobs;
}

export async function fetchTheMuseJobs(): Promise<ExternalJob[]> {
  const categories = ["Software Engineering", "Data and Analytics"];
  const jobs: ExternalJob[] = [];
  const seen = new Set<string>();
  const apiKey = process.env.THE_MUSE_API_KEY?.trim();
  const maxPages = Number(process.env.JOBS_MUSE_MAX_PAGES ?? 25);

  for (const category of categories) {
    for (let page = 0; page < maxPages; page++) {
      const url = `https://www.themuse.com/api/public/jobs?page=${page}&category=${encodeURIComponent(category)}&descending=true`;
      const data = await fetchJson<{
        results?: Array<Record<string, unknown>>;
        page_count?: number;
        total?: number;
      }>(url, {
        headers: apiKey ? { "X-Muse-Api-Key": apiKey } : {},
      });

      if (!data.results?.length) break;

      for (const item of data.results) {
        const externalId = String(item.id);
        if (seen.has(externalId)) continue;
        seen.add(externalId);

        const title = String(item.name ?? "");
        const company = (item.company as { name?: string } | undefined)?.name ?? "Unknown";
        const locations = (item.locations as Array<{ name?: string }> | undefined)?.map((l) => l.name).filter(Boolean) ?? [];
        const description = truncate(stripHtml(String(item.contents ?? title)));
        const tags = Array.isArray(item.tags) ? item.tags.map(String) : [];
        if (!isItJob(title, description, tags)) continue;

        jobs.push({
          source: "themuse",
          externalId,
          title,
          company,
          description: `${description}${sourceAttribution("themuse")}`,
          location: locations.join(", ") || "Various",
          remote: locations.some((l) => l?.toLowerCase().includes("remote")) || description.toLowerCase().includes("remote"),
          category: inferCategory(title, tags),
          applyUrl: `https://www.themuse.com/jobs/${item.id}`,
          region: "global",
          postedAt: safeDate(String(item.publication_date ?? "")),
        });
      }

      if (data.page_count != null && page + 1 >= data.page_count) break;
    }
  }

  return jobs;
}

export async function fetchJoobleJobs(): Promise<ExternalJob[]> {
  const apiKey = process.env.JOOBLE_API_KEY?.trim();
  if (!apiKey) return [];

  const searchKeywords =
    process.env.JOOBLE_SEARCH_KEYWORDS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? DEFAULT_JOOBLE_PAKISTAN_KEYWORDS;

  const jobs: ExternalJob[] = [];
  const seen = new Set<string>();
  const maxPages = Number(process.env.JOBS_JOOBLE_MAX_PAGES ?? 3);

  for (const keywords of searchKeywords) {
    for (let page = 1; page <= maxPages; page++) {
      let data: { jobs?: Array<Record<string, unknown>> };
      try {
        data = await fetchJson<{ jobs?: Array<Record<string, unknown>> }>(`https://jooble.org/api/${apiKey}`, {
          method: "POST",
          body: {
            keywords,
            page: String(page),
            companysearch: "false",
          },
        });
      } catch {
        break;
      }

      if (!data.jobs?.length) break;

      for (const item of data.jobs) {
        const externalId = String(item.id ?? item.link);
        if (seen.has(externalId)) continue;

        const title = String(item.title ?? "");
        const location = String(item.location ?? "Remote");
        const snippet = stripHtml(String(item.snippet ?? ""));

        if (!isPakistanJob(title, location)) continue;
        if (!isItJob(title, snippet)) continue;

        seen.add(externalId);
        jobs.push({
          source: "jooble",
          externalId,
          title,
          company: String(item.company ?? "Unknown"),
          description: `${truncate(snippet || title)}${sourceAttribution("jooble")}`,
          location,
          remote:
            location.toLowerCase().includes("remote") ||
            snippet.toLowerCase().includes("remote") ||
            title.toLowerCase().includes("remote"),
          salaryRange: item.salary ? String(item.salary) : undefined,
          category: inferCategory(title),
          applyUrl: String(item.link),
          region: "pakistan",
          postedAt: safeDate(String(item.updated ?? "")),
        });
      }

      if (data.jobs.length < 20) break;
      await delay(250);
    }
  }

  return jobs;
}

export async function fetchEverJobsJobs(): Promise<ExternalJob[]> {
  const baseUrl = (process.env.EVER_JOBS_BASE_URL?.trim() || "").replace(/\/$/, "");
  if (!baseUrl) return [];

  const headers: Record<string, string> = {};
  const apiKey = process.env.EVER_JOBS_API_KEY?.trim();
  if (apiKey) headers["x-api-key"] = apiKey;

  const data = await fetchJson<{ jobs?: Array<Record<string, unknown>>; data?: Array<Record<string, unknown>> }>(
    `${baseUrl}/api/jobs/search`,
    {
      method: "POST",
      headers,
      body: {
        searchTerm: "software engineer developer devops frontend backend python react IT",
        siteType: ["jooble", "indeed", "google", "linkedin", "remoteok", "remotive"],
        resultsWanted: Number(process.env.JOBS_EVERJOBS_MAX_RESULTS ?? 100),
      },
    },
  );

  const rows = data.jobs ?? data.data ?? [];
  const jobs: ExternalJob[] = [];

  for (const item of rows) {
    const title = String(item.title ?? item.jobTitle ?? "");
    const description = truncate(stripHtml(String(item.description ?? item.snippet ?? title)));
    if (!isItJob(title, description)) continue;

    jobs.push({
      source: "everjobs",
      externalId: String(item.id ?? item.jobUrl ?? item.link ?? `${title}-${item.company}`),
      title,
      company: String(item.company ?? item.companyName ?? "Unknown"),
      description: `${description}${sourceAttribution("everjobs")}`,
      location: String(item.location ?? item.jobLocation ?? "Various"),
      remote: Boolean(item.isRemote) || description.toLowerCase().includes("remote"),
      salaryRange: item.salary ? String(item.salary) : undefined,
      category: inferCategory(title),
      applyUrl: String(item.jobUrl ?? item.link ?? item.url),
      region: "global",
      postedAt: safeDate(String(item.datePosted ?? "")),
    });
  }

  return jobs;
}

export const JOB_FETCHERS: Array<{ source: JobSourceId; fn: () => Promise<ExternalJob[]>; enabled: () => boolean }> = [
  { source: "jooble", fn: fetchJoobleJobs, enabled: () => !!process.env.JOOBLE_API_KEY?.trim() },
  { source: "remoteok", fn: fetchRemoteOkJobs, enabled: () => true },
  { source: "remotive", fn: fetchRemotiveJobs, enabled: () => true },
  { source: "arbeitnow", fn: fetchArbeitnowJobs, enabled: () => true },
  { source: "themuse", fn: fetchTheMuseJobs, enabled: () => true },
  { source: "everjobs", fn: fetchEverJobsJobs, enabled: () => !!process.env.EVER_JOBS_BASE_URL?.trim() },
];

export async function fetchAllExternalJobs(): Promise<{ jobs: ExternalJob[]; errors: Array<{ source: string; error: string }> }> {
  const jobs: ExternalJob[] = [];
  const errors: Array<{ source: string; error: string }> = [];

  for (const { source, fn, enabled } of JOB_FETCHERS) {
    if (!enabled()) continue;
    try {
      const result = await fn();
      jobs.push(...result);
    } catch (err) {
      errors.push({ source, error: err instanceof Error ? err.message : "Fetch failed" });
    }
  }

  return { jobs, errors };
}
