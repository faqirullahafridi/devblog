export type SnippetDef = {
  slug: string;
  title: string;
  description: string;
  language: string;
  tags: string[];
  code: string;
};

export const SNIPPETS: SnippetDef[] = [
  {
    slug: "fetch-json-post",
    title: "Fetch JSON POST",
    description: "POST JSON with credentials and error handling.",
    language: "javascript",
    tags: ["javascript", "fetch", "api"],
    code: `async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}`,
  },
  {
    slug: "debounce",
    title: "Debounce function",
    description: "Limit how often a function runs.",
    language: "javascript",
    tags: ["javascript", "utils"],
    code: `function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
  },
  {
    slug: "react-use-local-storage",
    title: "useLocalStorage hook",
    description: "Persist state in localStorage.",
    language: "typescript",
    tags: ["react", "typescript"],
    code: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}`,
  },
  {
    slug: "python-read-env",
    title: "Read environment variables",
    description: "Load .env with python-dotenv.",
    language: "python",
    tags: ["python", "env"],
    code: `import os
from dotenv import load_dotenv

load_dotenv()
database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL is required")`,
  },
  {
    slug: "python-requests-get",
    title: "HTTP GET with requests",
    description: "Simple GET with timeout and status check.",
    language: "python",
    tags: ["python", "http"],
    code: `import requests

def fetch_json(url: str, timeout: int = 10) -> dict:
    res = requests.get(url, timeout=timeout)
    res.raise_for_status()
    return res.json()`,
  },
  {
    slug: "sql-upsert-postgres",
    title: "PostgreSQL UPSERT",
    description: "Insert or update on conflict.",
    language: "sql",
    tags: ["sql", "postgres"],
    code: `INSERT INTO subscribers (email, confirmed)
VALUES ($1, true)
ON CONFLICT (email)
DO UPDATE SET confirmed = EXCLUDED.confirmed, updated_at = NOW();`,
  },
  {
    slug: "express-rate-limit",
    title: "Express rate limiter",
    description: "Basic in-memory rate limiting middleware.",
    language: "javascript",
    tags: ["nodejs", "express", "security"],
    code: `const hits = new Map();

function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key) ?? { count: 0, start: now };
    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count += 1;
    hits.set(key, entry);
    if (entry.count > max) return res.status(429).json({ error: "Too many requests" });
    next();
  };
}`,
  },
  {
    slug: "css-center-flex",
    title: "Center with Flexbox",
    description: "Perfect centering pattern.",
    language: "css",
    tags: ["css"],
    code: `.center {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}`,
  },
  {
    slug: "tailwind-responsive-grid",
    title: "Responsive Tailwind grid",
    description: "Auto-fit card grid.",
    language: "html",
    tags: ["html", "tailwind", "css"],
    code: `<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <!-- cards -->
</div>`,
  },
  {
    slug: "bash-backup-db",
    title: "PostgreSQL backup",
    description: "Dump database to file.",
    language: "bash",
    tags: ["bash", "postgres"],
    code: `#!/usr/bin/env bash
set -euo pipefail
pg_dump "$DATABASE_URL" -Fc -f "backup-$(date +%Y%m%d).dump"`,
  },
  {
    slug: "jwt-decode-payload",
    title: "Decode JWT payload (client)",
    description: "Read JWT claims without verifying signature.",
    language: "javascript",
    tags: ["jwt", "javascript"],
    code: `function decodeJwtPayload(token) {
  const [, payload] = token.split(".");
  return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
}`,
  },
  {
    slug: "regex-email-basic",
    title: "Email validation regex",
    description: "Simple email pattern for forms.",
    language: "javascript",
    tags: ["regex", "validation"],
    code: `const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;

function isValidEmail(value) {
  return EMAIL_RE.test(value.trim());
}`,
  },
  {
    slug: "typescript-pick-omit",
    title: "Pick & Omit types",
    description: "Derive types from existing interfaces.",
    language: "typescript",
    tags: ["typescript"],
    code: `type User = { id: number; email: string; password: string };

type PublicUser = Omit<User, "password">;
type UserId = Pick<User, "id">;`,
  },
  {
    slug: "react-error-boundary",
    title: "React error boundary",
    description: "Catch render errors in class component.",
    language: "typescript",
    tags: ["react", "typescript"],
    code: `import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? <p>Something went wrong.</p>;
    return this.props.children;
  }
}`,
  },
  {
    slug: "curl-json-api",
    title: "cURL JSON API call",
    description: "POST JSON from terminal.",
    language: "bash",
    tags: ["bash", "curl", "api"],
    code: `curl -X POST http://localhost:8080/api/contact \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Dev","email":"dev@example.com","message":"Hi"}'`,
  },
  {
    slug: "fetch-json-get",
    title: "Fetch JSON GET",
    description: "GET JSON with query params and error handling.",
    language: "javascript",
    tags: ["javascript", "fetch", "http", "api"],
    code: `async function getJson(url, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const full = qs ? \`\${url}?\${qs}\` : url;
  const res = await fetch(full, { credentials: "include" });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}`,
  },
  {
    slug: "throttle",
    title: "Throttle function",
    description: "Run at most once per interval (scroll, resize handlers).",
    language: "javascript",
    tags: ["javascript", "utils"],
    code: `function throttle(fn, ms = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}`,
  },
  {
    slug: "sleep-promise",
    title: "Sleep utility",
    description: "Pause async code for a number of milliseconds.",
    language: "javascript",
    tags: ["javascript", "utils"],
    code: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollUntilReady(check, { interval = 500, max = 10 } = {}) {
  for (let i = 0; i < max; i++) {
    if (await check()) return true;
    await sleep(interval);
  }
  return false;
}`,
  },
  {
    slug: "node-read-env",
    title: "Read env in Node.js",
    description: "Load and validate required environment variables.",
    language: "javascript",
    tags: ["nodejs", "env"],
    code: `import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(\`Missing required env: \${name}\`);
  return value;
}

const port = Number(process.env.PORT ?? 8080);
const databaseUrl = requireEnv("DATABASE_URL");`,
  },
  {
    slug: "express-cors-session",
    title: "Express CORS + cookies",
    description: "Allow credentialed requests from a dev frontend.",
    language: "javascript",
    tags: ["nodejs", "express", "api", "security"],
    code: `import cors from "cors";
import express from "express";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());`,
  },
  {
    slug: "express-auth-middleware",
    title: "Express auth middleware",
    description: "Protect routes with session-based admin auth.",
    language: "javascript",
    tags: ["nodejs", "express", "security"],
    code: `function requireAuth(req, res, next) {
  if (!req.session?.adminAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/stats/overview", requireAuth, async (req, res) => {
  // handler
});`,
  },
  {
    slug: "jwt-verify-hs256",
    title: "Verify JWT (Node.js)",
    description: "Validate HS256 tokens with a secret.",
    language: "typescript",
    tags: ["jwt", "nodejs", "security", "typescript"],
    code: `import { createHmac, timingSafeEqual } from "node:crypto";

function verifyJwt(token, secret) {
  const [header, payload, sig] = token.split(".");
  const data = \`\${header}.\${payload}\`;
  const expected = createHmac("sha256", secret).update(data).digest("base64url");
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid signature");
  }
  return JSON.parse(Buffer.from(payload, "base64url").toString());
}`,
  },
  {
    slug: "regex-url-validation",
    title: "URL validation regex",
    description: "Match http/https URLs in forms.",
    language: "javascript",
    tags: ["regex", "validation", "javascript"],
    code: `const URL_RE = /^https?:\\/\\/[^\\s/$.?#][^\\s]*$/i;

function isValidUrl(value) {
  return URL_RE.test(value.trim());
}`,
  },
  {
    slug: "regex-password-strength",
    title: "Password strength regex",
    description: "Require length, upper, lower, and digit.",
    language: "javascript",
    tags: ["regex", "validation", "security"],
    code: `const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;

function isStrongPassword(value) {
  return STRONG_PASSWORD_RE.test(value);
}`,
  },
  {
    slug: "sanitize-user-input",
    title: "Sanitize user input",
    description: "Strip HTML tags from untrusted strings.",
    language: "javascript",
    tags: ["security", "validation", "javascript"],
    code: `function stripHtml(input) {
  return input.replace(/<[^>]*>/g, "").trim();
}

function clampLength(input, max = 500) {
  return stripHtml(input).slice(0, max);
}`,
  },
  {
    slug: "python-post-json",
    title: "HTTP POST with requests",
    description: "Send JSON body and handle errors.",
    language: "python",
    tags: ["python", "http", "api"],
    code: `import requests

def post_json(url: str, payload: dict, timeout: int = 10) -> dict:
    res = requests.post(url, json=payload, timeout=timeout)
    res.raise_for_status()
    return res.json()`,
  },
  {
    slug: "python-flask-health",
    title: "Flask health endpoint",
    description: "Minimal API route for uptime checks.",
    language: "python",
    tags: ["python", "api", "http"],
    code: `from flask import Flask, jsonify

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})`,
  },
  {
    slug: "sql-select-join",
    title: "SELECT with LEFT JOIN",
    description: "Posts with category names.",
    language: "sql",
    tags: ["sql", "postgres"],
    code: `SELECT p.id, p.title, c.name AS category
FROM posts p
LEFT JOIN categories c ON c.id = p.category_id
WHERE p.status = 'published'
ORDER BY p.created_at DESC
LIMIT 20;`,
  },
  {
    slug: "sql-create-index",
    title: "Create index",
    description: "Speed up lookups on slug and status columns.",
    language: "sql",
    tags: ["sql", "postgres"],
    code: `CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts (status, created_at DESC);`,
  },
  {
    slug: "sql-pagination",
    title: "SQL pagination",
    description: "LIMIT/OFFSET pattern for list endpoints.",
    language: "sql",
    tags: ["sql"],
    code: `SELECT id, title, slug
FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;`,
  },
  {
    slug: "css-grid-autofit",
    title: "Responsive CSS grid",
    description: "Auto-fit card layout without a framework.",
    language: "css",
    tags: ["css"],
    code: `.card-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}`,
  },
  {
    slug: "css-truncate-multiline",
    title: "Line-clamp truncation",
    description: "Truncate long text to N lines.",
    language: "css",
    tags: ["css", "utils"],
    code: `.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}`,
  },
  {
    slug: "html-semantic-layout",
    title: "Semantic HTML layout",
    description: "Accessible page structure with landmarks.",
    language: "html",
    tags: ["html"],
    code: `<header><nav aria-label="Main">...</nav></header>
<main id="main">
  <article>
    <h1>Post title</h1>
    <section>...</section>
  </article>
  <aside aria-label="Related">...</aside>
</main>
<footer>...</footer>`,
  },
  {
    slug: "html-accessible-form",
    title: "Accessible HTML form",
    description: "Labels, types, and required fields.",
    language: "html",
    tags: ["html", "validation"],
    code: `<form action="/api/contact" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />
  <label for="message">Message</label>
  <textarea id="message" name="message" required minlength="10"></textarea>
  <button type="submit">Send</button>
</form>`,
  },
  {
    slug: "html-meta-seo",
    title: "SEO meta tags",
    description: "Description, Open Graph, and canonical URL.",
    language: "html",
    tags: ["html"],
    code: `<meta name="description" content="Short summary for search results." />
<meta property="og:title" content="Page title" />
<meta property="og:description" content="Social preview text" />
<meta property="og:type" content="website" />
<link rel="canonical" href="https://example.com/post/slug" />`,
  },
  {
    slug: "tailwind-button-variants",
    title: "Tailwind button styles",
    description: "Primary and outline button patterns.",
    language: "html",
    tags: ["html", "tailwind", "css"],
    code: `<button class="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
  Primary
</button>
<button class="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
  Outline
</button>`,
  },
  {
    slug: "tailwind-dark-card",
    title: "Tailwind card component",
    description: "Bordered card with title and muted text.",
    language: "html",
    tags: ["html", "tailwind"],
    code: `<div class="rounded-xl border bg-card p-5 shadow-sm">
  <h3 class="font-semibold">Card title</h3>
  <p class="mt-2 text-sm text-muted-foreground">Supporting description text.</p>
</div>`,
  },
  {
    slug: "react-use-fetch",
    title: "useFetch hook",
    description: "Load JSON in React with loading and error state.",
    language: "typescript",
    tags: ["react", "typescript", "fetch", "api"],
    code: `import { useEffect, useState } from "react";

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(url, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((json) => !cancelled && setData(json))
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [url]);

  return { data, error, loading };
}`,
  },
  {
    slug: "react-debounced-search",
    title: "Debounced search input",
    description: "Delay API calls while the user types.",
    language: "typescript",
    tags: ["react", "typescript", "utils"],
    code: `import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}`,
  },
  {
    slug: "typescript-zod-parse",
    title: "Zod request validation",
    description: "Parse and validate API request bodies.",
    language: "typescript",
    tags: ["typescript", "validation", "api"],
    code: `import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

type ContactInput = z.infer<typeof contactSchema>;

function parseContact(body: unknown): ContactInput {
  return contactSchema.parse(body);
}`,
  },
  {
    slug: "typescript-partial-required",
    title: "Partial & Required utilities",
    description: "Make specific keys optional or required.",
    language: "typescript",
    tags: ["typescript", "utils"],
    code: `type Post = {
  id: number;
  title: string;
  excerpt?: string;
  body: string;
};

type PostDraft = Partial<Pick<Post, "title" | "excerpt" | "body">>;
type PostCreate = Required<Pick<Post, "title" | "body">> & { excerpt?: string };`,
  },
  {
    slug: "bash-curl-get-headers",
    title: "cURL GET with headers",
    description: "Inspect response headers and status.",
    language: "bash",
    tags: ["bash", "curl", "http"],
    code: `curl -sS -D - -o /dev/null https://api.example.com/health
curl -sS -H "Accept: application/json" https://api.example.com/posts`,
  },
  {
    slug: "bash-curl-bearer-token",
    title: "cURL with Bearer token",
    description: "Authenticated GET using a JWT.",
    language: "bash",
    tags: ["bash", "curl", "jwt", "api", "http"],
    code: `TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -sS https://api.example.com/me \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Accept: application/json"`,
  },
  {
    slug: "bash-restore-postgres",
    title: "Restore PostgreSQL dump",
    description: "Restore a custom-format backup file.",
    language: "bash",
    tags: ["bash", "postgres"],
    code: `#!/usr/bin/env bash
set -euo pipefail
pg_restore --clean --if-exists -d "$DATABASE_URL" "backup-20260101.dump"`,
  },
  {
    slug: "python-sleep-retry",
    title: "Retry with backoff",
    description: "Retry flaky HTTP calls in Python.",
    language: "python",
    tags: ["python", "utils", "http"],
    code: `import time
import requests

def get_with_retry(url: str, attempts: int = 3) -> requests.Response:
    delay = 0.5
    for i in range(attempts):
        try:
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            return res
        except requests.RequestException:
            if i == attempts - 1:
                raise
            time.sleep(delay)
            delay *= 2
    raise RuntimeError("unreachable")`,
  },
];

export function getSnippetHref(slug: string) {
  return `/snippets/${slug}`;
}

export function getSnippetBySlug(slug: string) {
  return SNIPPETS.find((s) => s.slug === slug);
}

export const SNIPPET_SLUGS = SNIPPETS.map((s) => s.slug);

export const SNIPPET_LANGUAGES = [...new Set(SNIPPETS.map((s) => s.language))].sort();

export const SNIPPET_TAGS = [...new Set(SNIPPETS.flatMap((s) => s.tags))].sort();
