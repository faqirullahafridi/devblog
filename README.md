# Dev Blog Admin

A full-stack developer platform and blog — content CMS, in-browser tools, AI assistant, job board, community Q&A, coding challenges, and more. Built as a **pnpm monorepo** and deployed to **Vercel** with **Supabase PostgreSQL**.

## Features

### Blog & content
- Posts, categories, tags, search, and comments
- RSS feed (`/feed.xml`), sitemap, and robots.txt
- SEO metadata and JSON-LD
- Light / dark theme

### Developer platform
| Area | Routes | Description |
|------|--------|-------------|
| **Tools** | `/tools/*` | JSON formatter, JWT decoder, regex tester, hash/UUID generators, markdown preview, SQL formatter, and more |
| **Templates** | `/templates/*` | Browse, search, live demos, and downloadable UI styles |
| **References** | `/refs` | Quick-reference guides |
| **Snippets** | `/snippets` | Code snippet library |
| **Learning** | `/learn` | Structured learning paths |
| **Interview** | `/interview` | Interview prep content |
| **AI Assistant** | `/ai/*` | Chat, debug, explain, generate, convert (Groq / OpenAI / Ollama) |
| **Playground** | `/playground/*` | HTML/CSS/JS, Python, and SQL sandboxes with share links |
| **Roadmaps** | `/roadmaps` | Curated and AI-generated learning roadmaps |
| **Challenges** | `/challenges` | Coding challenges and leaderboard |
| **Jobs** | `/jobs` | Aggregated IT roles (RemoteOK, Remotive, The Muse, Jooble, etc.) |
| **Community** | `/community` | Q&A with tags and profiles |

### Admin panel (`/admin`)
- Session-based auth with PostgreSQL-backed sessions
- Dashboard, analytics, settings
- CRUD for posts, categories, comments, subscribers
- Platform management for jobs and challenges
- Optional Supabase Storage image uploads

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  artifacts/blog          React SPA (Vite + Wouter)      │
│  Port 3000 (dev)         TanStack Query + Tailwind 4    │
└──────────────────────────────┬──────────────────────────┘
                               │ /api/* (Vite proxy in dev)
┌──────────────────────────────▼──────────────────────────┐
│  artifacts/api-server    Express 5 REST API             │
│  Port 8080 (dev)         esbuild bundle → dist/index.mjs│
└──────────────────────────────┬──────────────────────────┘
                               │ Drizzle ORM
┌──────────────────────────────▼──────────────────────────┐
│  lib/db                  PostgreSQL (Supabase)          │
└─────────────────────────────────────────────────────────┘

Production (Vercel):
  Static frontend  →  artifacts/blog/dist/public
  Serverless API   →  api/index.ts (serverless-http wrapper)
  Cron             →  /api/jobs/sync/cron (daily job sync)
```

### Monorepo packages

| Package | Purpose |
|---------|---------|
| `artifacts/blog` | Public site + admin UI |
| `artifacts/api-server` | Express API server |
| `lib/db` | Drizzle schema, migrations, seeds |
| `lib/api-zod` | Shared Zod validation schemas |
| `lib/api-client-react` | Typed API client for the frontend |
| `lib/api-spec` | OpenAPI spec + Orval codegen |

## Tech stack

**Frontend:** React 19, TypeScript, Vite 7, Wouter, TanStack React Query, Tailwind CSS 4, Radix UI, Framer Motion, sql.js (SQL playground)

**Backend:** Node.js, Express 5, Drizzle ORM, PostgreSQL (`pg`), express-session, Pino logging

**Integrations (optional):** Groq / OpenAI / Ollama (AI), Resend (email), MyMemory (job translation), external job APIs

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+ (required — npm/yarn are blocked)
- PostgreSQL database ([Supabase](https://supabase.com/) recommended)

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Minimum for local development:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres
SESSION_SECRET=your-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=8080
BASE_PATH=/
```

See [`.env.example`](.env.example) for all options (AI keys, job APIs, email, storage, rate limits).

### 3. Set up the database

Push the schema to Postgres:

```bash
pnpm --filter @workspace/db run push
```

Optional — enable platform features (AI, playground, jobs, community):

```bash
pnpm --filter @workspace/db run migrate:platform
pnpm --filter @workspace/db run migrate:jobs
pnpm --filter @workspace/db run seed:platform
```

Optional — seed blog posts and template categories:

```bash
pnpm --filter @workspace/db run seed:posts
pnpm --filter @workspace/db run seed:template-categories
```

### 4. Run locally

Start the API and frontend in **separate terminals**:

```bash
# Terminal 1 — API on http://localhost:8080
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Blog on http://localhost:3000
pnpm --filter @workspace/blog run dev
```

The Vite dev server proxies `/api/*` to port 8080.

- **Public site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

> After changing API code, rebuild and restart the API server (`pnpm --filter @workspace/api-server run dev` runs build + start automatically).

### 5. Job sync (optional)

Enable external job aggregation in `.env`:

```env
JOBS_SYNC_ENABLED=true
JOBS_SYNC_INTERVAL_HOURS=24
```

On Vercel, jobs sync via cron instead — set `CRON_SECRET` and use the schedule in `vercel.json`.

## Deployment (Vercel)

1. Connect the repo to Vercel.
2. Add environment variables from `.env.example` (at minimum `DATABASE_URL`, `SESSION_SECRET`, `CRON_SECRET`).
3. Use `DATABASE_POOLER_URL` (Supabase port 6543) for serverless connection pooling.
4. Deploy — `vercel.json` configures build output, API rewrites, and daily job cron.

```bash
pnpm run build:vercel   # same command Vercel runs
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run build` | Typecheck and build all packages |
| `pnpm run build:vercel` | Production frontend build for Vercel |
| `pnpm --filter @workspace/blog run dev` | Start Vite dev server |
| `pnpm --filter @workspace/api-server run dev` | Build + start API server |
| `pnpm --filter @workspace/db run push` | Push Drizzle schema to database |
| `pnpm --filter @workspace/db run seed:platform` | Seed platform demo data |

## Project structure

```
.
├── api/                    # Vercel serverless entry (wraps Express app)
├── artifacts/
│   ├── blog/               # React frontend (Vite)
│   └── api-server/         # Express backend
├── lib/
│   ├── db/                 # Drizzle ORM + migrations + seeds
│   ├── api-zod/            # Shared Zod schemas
│   ├── api-client-react/   # Frontend API client
│   └── api-spec/           # OpenAPI + codegen
├── .env.example            # Environment variable reference
├── vercel.json             # Vercel deployment config
└── pnpm-workspace.yaml
```

## License

MIT
