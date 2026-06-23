# Web Dev Blog Platform

A full-stack web development blog platform with a public-facing site and a complete admin dashboard for managing all content.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, serves at /api)
- `pnpm --filter @workspace/blog run dev` — run the blog frontend (serves at /)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)
- Required env: `SESSION_SECRET` — session signing secret (already set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS + Wouter (routing)
- API: Express 5 + express-session
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Markdown: react-markdown + react-syntax-highlighter + remark-gfm

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Database schema (categories, posts, comments, newsletter)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/blog/src/` — React frontend (pages + components)

## Architecture decisions

- Single Express API server shared by all artifacts, mounted at `/api`
- Session-based admin authentication (username + password stored in env vars)
- PostgreSQL used instead of SQLite — Replit provisions it automatically, same ease of use
- Contract-first OpenAPI spec drives all codegen (Zod schemas + React Query hooks)
- Markdown stored as raw text in DB, rendered client-side with react-markdown

## Product

- **Public site**: Homepage with featured posts, category pages (HTML/CSS, JavaScript, Python, Django, AI Tools), post reader with code highlighting and comments, search, newsletter signup
- **Admin panel** at `/admin`: Login-protected dashboard with stats, post CRUD editor (markdown), category management, analytics (views per post), subscriber list
- **SEO**: Clean URLs (`/post/:slug`, `/category/:slug`), per-post SEO title + meta description, sitemap endpoint at `/api/sitemap`

## Admin credentials

Default credentials (change via environment variables):
- Username: `admin` (env: `ADMIN_USERNAME`)
- Password: `admin123` (env: `ADMIN_PASSWORD`)

## User preferences

- Prefers minimal, developer-style UI
- Wants full control from admin panel without touching code

## Gotchas

- After any OpenAPI spec change, re-run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- The API server must be running for the frontend to load data
- Admin session cookies use `sameSite: "lax"` — works through the Replit proxy

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Drizzle schema: `lib/db/src/schema/index.ts`
- API routes: `artifacts/api-server/src/routes/`
