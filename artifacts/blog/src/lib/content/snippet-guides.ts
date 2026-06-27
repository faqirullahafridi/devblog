export const SNIPPET_GUIDES: Record<string, string> = {
  "fetch-json-post": `## What this pattern does

This async helper sends a JSON POST request with \`fetch\`, includes cookies via \`credentials: "include"\`, and throws on non-OK responses before parsing JSON.

## When to use it

Use it for form submissions, mutations, or any API call that creates or updates data. Pair it with server-side validation and CSRF protection when cookies carry session state.

## How the code works

- \`method: "POST"\` and \`Content-Type: application/json\` tell the server to expect a JSON body.
- \`JSON.stringify(body)\` serializes your JavaScript object.
- \`credentials: "include"\` sends cookies on cross-origin requests when CORS allows it.
- \`if (!res.ok)\` treats HTTP errors as failures and surfaces the response text.
- \`res.json()\` parses the success payload.

## Common pitfalls

Forgetting \`Content-Type\` causes servers to misread the body. Throwing on \`res.ok\` alone misses network failures—wrap calls in \`try/catch\`. Large payloads need streaming or multipart, not raw JSON.

## Related

- [Learn: JSON APIs](/learn/web-apis/json-apis)
- [Fetch JSON GET snippet](/snippets/fetch-json-get)
- [Express CORS + cookies](/snippets/express-cors-session)`,

  debounce: `## What this pattern does

Debounce delays function execution until input stops changing for a set interval. Rapid calls reset the timer so only the final burst runs once.

## When to use it

Ideal for search boxes, window resize handlers, and auto-save fields where you want fewer API calls or DOM updates while the user is still typing or dragging.

## How the code works

- \`debounce(fn, ms)\` returns a new function that closes over \`timer\`.
- Each invocation \`clearTimeout(timer)\` cancels the pending run.
- \`setTimeout\` schedules \`fn(...args)\` after \`ms\` milliseconds of quiet time.
- Spread \`...args\` preserves the latest arguments from the final call.

## Common pitfalls

Debounce is wrong for scroll or game-loop events—use [throttle](/snippets/throttle) instead. The trailing edge only fires after silence; use a leading-edge variant if you need immediate feedback. Clear timers on unmount in React to avoid setState on unmounted components.

## Related

- [Debounced search hook](/snippets/react-debounced-search)
- [Learn: custom hooks](/learn/frontend-react/custom-hooks)`,

  "react-use-local-storage": `## What this pattern does

This React hook mirrors \`useState\` but persists values in \`localStorage\`, hydrating on first render and syncing on every update.

## When to use it

Use for user preferences (theme, sidebar state), draft form data, or non-sensitive UI settings that should survive page reloads.

## How the code works

- The lazy initializer reads \`localStorage.getItem(key)\` once and \`JSON.parse\`s it, falling back to \`initial\`.
- \`useEffect\` writes \`JSON.stringify(value)\` whenever \`key\` or \`value\` changes.
- Returns \`[value, setValue] as const\` for tuple typing in TypeScript.

## Common pitfalls

\`localStorage\` is synchronous and limited (~5 MB). SSR will throw if you access it during server render—guard with \`typeof window\`. Private mode may quota-block writes. Never store tokens or passwords here.

## Related

- [Learn: state with useState](/learn/frontend-react/state-usestate)
- [Learn: custom hooks](/learn/frontend-react/custom-hooks)`,

  "python-read-env": `## What this pattern does

Loads variables from a \`.env\` file with \`python-dotenv\`, then reads and validates a required \`DATABASE_URL\`.

## When to use it

Use in local development and small scripts where twelve-factor config belongs in environment variables, not hard-coded strings.

## How the code works

- \`load_dotenv()\` reads \`.env\` into \`os.environ\` without overwriting existing vars.
- \`os.getenv("DATABASE_URL")\` returns \`None\` if missing.
- The explicit \`RuntimeError\` fails fast at startup instead of mid-request.

## Common pitfalls

Commit \`.env.example\`, never \`.env\`. Production should inject vars via the host (Docker, Railway, etc.)—\`load_dotenv()\` is optional there. Validate types (ints, URLs) after reading strings.

## Related

- [Learn: env config](/learn/python-backend/env-config)
- [Node read env snippet](/snippets/node-read-env)
- [Learn: deployment basics](/learn/devops-git/deployment-basics)`,

  "python-requests-get": `## What this pattern does

Performs an HTTP GET with the \`requests\` library, enforces a timeout, raises on HTTP errors, and returns parsed JSON.

## When to use it

Use for calling REST APIs, webhooks, or internal services from Python scripts, Flask apps, or background jobs.

## How the code works

- \`requests.get(url, timeout=timeout)\` opens a connection with a deadline.
- \`raise_for_status()\` converts 4xx/5xx into \`HTTPError\`.
- \`res.json()\` deserializes the response body.

## Common pitfalls

No timeout hangs forever on bad networks. \`json()\` fails on empty or HTML error pages—check \`Content-Type\`. For retries, see [python-sleep-retry](/snippets/python-sleep-retry).

## Related

- [Learn: HTTP requests](/learn/python-backend/http-requests)
- [Python POST JSON](/snippets/python-post-json)
- [Learn: JSON APIs](/learn/web-apis/json-apis)`,

  "sql-upsert-postgres": `## What this pattern does

Inserts a row into \`subscribers\` or, if \`email\` already exists, updates \`confirmed\` and \`updated_at\` in one atomic statement.

## When to use it

Use for idempotent sign-ups, newsletter confirmations, or sync jobs where duplicate keys should update instead of error.

## How the code works

- \`INSERT INTO ... VALUES ($1, true)\` adds a new subscriber.
- \`ON CONFLICT (email)\` triggers when the unique constraint on \`email\` fires.
- \`DO UPDATE SET\` writes \`EXCLUDED.confirmed\` (the would-be insert value) and stamps \`updated_at\`.

## Common pitfalls

You need a unique index or constraint on the conflict target. \`EXCLUDED\` refers to the proposed row—typos in column names silently skip updates. Heavy upsert workloads may need \`ON CONFLICT DO NOTHING\` for deduplication only.

## Related

- [Learn: PostgreSQL tips](/learn/sql-databases/postgres-tips)
- [Learn: transactions](/learn/sql-databases/transactions)
- [SQL formatter tool](/tools/sql-formatter)`,

  "express-rate-limit": `## What this pattern does

In-memory Express middleware counts requests per IP inside a sliding time window and returns HTTP 429 when the limit is exceeded.

## When to use it

Protect login, contact, and public API routes from brute force and accidental overload. Suitable for single-process dev or small deployments.

## How the code works

- \`hits\` Map stores \`{ count, start }\` per \`req.ip\`.
- When \`now - entry.start > windowMs\`, the counter resets.
- Each request increments \`count\`; exceeding \`max\` short-circuits with 429.
- Otherwise \`next()\` continues the chain.

## Common pitfalls

In-memory maps do not share state across multiple server instances—use Redis in production. Proxies require trusting \`X-Forwarded-For\`. Attackers can rotate IPs; combine with auth and CAPTCHA for sensitive endpoints.

## Related

- [Learn: rate limiting](/learn/web-apis/rate-limiting)
- [Express auth middleware](/snippets/express-auth-middleware)`,

  "css-center-flex": `## What this pattern does

Flexbox centers content horizontally and vertically inside a container that spans at least the full viewport height.

## When to use it

Perfect for loading spinners, empty states, modals, and hero sections where one block should sit in the visual center.

## How the code works

- \`display: flex\` enables flex layout on the container.
- \`justify-content: center\` aligns along the main axis (horizontal by default).
- \`align-items: center\` aligns along the cross axis (vertical).
- \`min-height: 100vh\` ensures the flex container fills the viewport.

## Common pitfalls

Centering works on direct children only—nested content needs its own flex or grid. On mobile, \`100vh\` can jump when the browser chrome shows/hides; consider \`min-height: 100dvh\`.

## Related

- [CSS grid autofit snippet](/snippets/css-grid-autofit)
- [Learn: DOM & browser](/learn/javascript-fundamentals/dom-browser)`,

  "tailwind-responsive-grid": `## What this pattern does

A Tailwind CSS grid lays out cards in one column by default, two on \`sm\`, and three on \`lg\` breakpoints with consistent gap spacing.

## When to use it

Use for blog post grids, feature lists, pricing cards, or any repeating tile layout that should adapt without custom media queries.

## How the code works

- \`grid\` enables CSS Grid.
- \`gap-4\` adds uniform spacing between cells.
- \`sm:grid-cols-2\` applies two columns from the small breakpoint up.
- \`lg:grid-cols-3\` expands to three columns on large screens.

## Common pitfalls

Missing a default column count leaves one column on mobile—which is usually desired. Very wide cards may need \`max-w-*\` on the grid parent. Pair with semantic HTML inside each cell.

## Related

- [Tailwind card snippet](/snippets/tailwind-dark-card)
- [CSS grid autofit (no framework)](/snippets/css-grid-autofit)
- [Learn: components & props](/learn/frontend-react/components-props)`,

  "bash-backup-db": `## What this pattern does

A Bash script dumps a PostgreSQL database to a custom-format file named with today's date, failing immediately on any error.

## When to use it

Run before migrations, deploys, or on a cron schedule to protect production data. Custom format (\`-Fc\`) supports selective restore with \`pg_restore\`.

## How the code works

- \`set -euo pipefail\` exits on errors, unset vars, and pipe failures.
- \`pg_dump "$DATABASE_URL"\` connects via connection string.
- \`-Fc\` writes compressed custom format instead of plain SQL.
- \`-f "backup-$(date +%Y%m%d).dump"\` names the output file.

## Common pitfalls

Store backups off-server; local disks die with the server. \`DATABASE_URL\` must include credentials—never log it. Test restores regularly; backups you cannot restore are worthless.

## Related

- [Restore PostgreSQL snippet](/snippets/bash-restore-postgres)
- [Learn: backup & restore](/learn/sql-databases/backup-restore)
- [Learn: env secrets](/learn/devops-git/env-secrets)`,

  "jwt-decode-payload": `## What this pattern does

Client-side helper splits a JWT, Base64URL-decodes the payload segment, and parses JSON claims **without verifying the signature**.

## When to use it

Use only for display (show username, expiry countdown) or debugging. Never authorize actions based on decoded claims alone.

## How the code works

- \`token.split(".")\` separates header, payload, and signature.
- Base64URL padding fixes replace \`-\`→\`+\` and \`_\`→\`/\` before \`atob\`.
- \`JSON.parse\` turns the payload string into an object.

## Common pitfalls

Anyone can forge an unsigned payload—always verify server-side. Malformed tokens throw on \`JSON.parse\`; wrap in try/catch. Check \`exp\` before trusting expiry display.

## Related

- [JWT Decoder tool](/tools/jwt-decoder)
- [JWT verify HS256 snippet](/snippets/jwt-verify-hs256)
- [Learn: JWT auth](/learn/web-apis/auth-jwt)`,

  "regex-email-basic": `## What this pattern does

A regular expression tests whether a string looks like a valid email address, with a helper that trims whitespace first.

## When to use it

Quick client-side form hints or pre-filtering before server validation. Always re-validate on the server—regex cannot catch every RFC-compliant edge case.

## How the code works

- \`EMAIL_RE\` anchors the pattern: local part, \`@\`, domain, and TLD of 2+ letters.
- \`value.trim()\` removes accidental spaces.
- \`.test()\` returns boolean match result.

## Common pitfalls

Internationalized emails and plus-addressing may fail overly strict patterns. Regex alone does not prove the inbox exists. For interactive testing use the [regex tester](/tools/regex-tester).

## Related

- [Regex tester tool](/tools/regex-tester)
- [Accessible HTML form](/snippets/html-accessible-form)
- [Zod validation snippet](/snippets/typescript-zod-parse)`,

  "typescript-pick-omit": `## What this pattern does

TypeScript utility types derive safer views of an existing \`User\` type—hiding secrets with \`Omit\` or selecting fields with \`Pick\`.

## When to use it

Use when returning API responses, building DTOs, or typing components that should never receive a password field.

## How the code works

- \`User\` defines the full shape including \`password\`.
- \`Omit<User, "password">\` removes the password key from the type.
- \`Pick<User, "id">\` keeps only \`id\`.

## Common pitfalls

\`Omit\` does not delete runtime properties—you must still strip secrets in code. Nested secrets need custom mapped types. Renaming \`User\` fields breaks derived types silently at compile time.

## Related

- [Partial & Required snippet](/snippets/typescript-partial-required)
- [JSON → TypeScript tool](/tools/json-to-typescript)
- [Learn: TypeScript + React](/learn/frontend-react/typescript-react)`,

  "react-error-boundary": `## What this pattern does

A class-based React error boundary catches render-phase errors in child components and shows a fallback UI instead of a white screen.

## When to use it

Wrap route segments, data-heavy widgets, or third-party components so one failure does not crash the entire app.

## How the code works

- \`getDerivedStateFromError\` sets \`hasError: true\` when a child throws during render.
- \`render\` returns \`fallback\` or a default message when an error occurred.
- Otherwise it renders \`children\` normally.

## Common pitfalls

Boundaries do not catch event handlers, async code, or SSR errors—handle those separately. Log errors to monitoring in \`componentDidCatch\`. React 19+ may offer functional alternatives; class API remains widely supported.

## Related

- [Learn: error boundaries](/learn/frontend-react/error-boundaries)
- [useFetch hook](/snippets/react-use-fetch)`,

  "curl-json-api": `## What this pattern does

A cURL one-liner POSTs JSON to a local API contact endpoint with the correct \`Content-Type\` header.

## When to use it

Smoke-test endpoints, reproduce bugs, or document API examples in README files without writing a full client.

## How the code works

- \`-X POST\` sets the HTTP method.
- \`-H "Content-Type: application/json"\` declares the body format.
- \`-d '{...}'\` sends the raw JSON string as the body.
- Line continuations \`\\\` split long commands in shell scripts.

## Common pitfalls

Single quotes in JSON conflict with shell quoting—escape carefully or use \`@file.json\`. \`localhost\` vs \`127.0.0.1\` may differ for cookies. Add \`-v\` for debugging headers.

## Related

- [cURL GET with headers](/snippets/bash-curl-get-headers)
- [Learn: methods & headers](/learn/web-apis/methods-headers)
- [Learn: testing APIs](/learn/web-apis/testing-apis)`,

  "fetch-json-get": `## What this pattern does

Builds a GET URL with optional query parameters, fetches JSON with credentials, and throws on HTTP error statuses.

## When to use it

List endpoints, search APIs, and read-only resources where you need typed query params without manual string concatenation.

## How the code works

- \`URLSearchParams(params)\` serializes an object to \`key=value&...\`.
- Appends \`?qs\` only when params exist.
- \`fetch(full, { credentials: "include" })\` sends cookies.
- Non-OK responses throw with the status code; success returns parsed JSON.

## Common pitfalls

\`URLSearchParams\` stringifies values—nested objects need custom encoding. Caching and pagination belong in params or headers, not the path alone. Pair with [POST helper](/snippets/fetch-json-post) for full CRUD.

## Related

- [Fetch JSON POST](/snippets/fetch-json-post)
- [Learn: async/await & fetch](/learn/javascript-fundamentals/async-await-fetch)
- [Learn: REST design](/learn/web-apis/rest-design)`,

  throttle: `## What this pattern does

Throttle ensures a function runs at most once per interval, dropping calls that arrive too soon after the last execution.

## When to use it

Scroll listeners, resize handlers, drag events, and analytics beacons where you need regular updates without flooding the main thread.

## How the code works

- \`last\` stores the timestamp of the previous successful call.
- On each invocation, compare \`Date.now() - last\` to \`ms\`.
- If enough time passed, update \`last\` and call \`fn(...args)\`.
- Otherwise the call is ignored.

## Common pitfalls

The trailing call during rapid input may never fire—unlike debounce. For search, prefer [debounce](/snippets/debounce). Combine with \`{ passive: true }\` for scroll performance.

## Related

- [Debounce snippet](/snippets/debounce)
- [Debounced search hook](/snippets/react-debounced-search)`,

  "sleep-promise": `## What this pattern does

\`sleep(ms)\` returns a Promise that resolves after a delay, enabling \`await\` in async polling loops.

## When to use it

Retry logic, waiting for async resources, spacing out API calls, or testing timed behavior without blocking the event loop.

## How the code works

- \`new Promise((resolve) => setTimeout(resolve, ms))\` schedules resolution.
- \`pollUntilReady\` loops up to \`max\` times, calling \`check()\` and sleeping \`interval\` ms between attempts.
- Returns \`true\` when \`check\` succeeds, \`false\` on timeout.

## Common pitfalls

Busy-waiting in loops without \`await sleep\` freezes the UI. Always cap retries to avoid infinite loops. For production retries with backoff, see [python-sleep-retry](/snippets/python-sleep-retry).

## Related

- [Learn: async promises](/learn/javascript-fundamentals/async-promises)
- [Python sleep retry](/snippets/python-sleep-retry)`,

  "node-read-env": `## What this pattern does

Loads \`.env\` via \`dotenv/config\`, validates required variables, and parses \`PORT\` with a sensible default.

## When to use it

Every Node.js server entry point should fail fast on missing secrets instead of crashing mysteriously on first DB connection.

## How the code works

- \`import "dotenv/config"\` side-effects \`.env\` into \`process.env\` at startup.
- \`requireEnv(name)\` throws if a variable is empty or undefined.
- \`Number(process.env.PORT ?? 8080)\` coerces port with fallback.

## Common pitfalls

\`PORT\` as string \`"8080"\` works with \`Number\` but \`"abc"\` becomes \`NaN\`—validate. Never commit \`.env\`. In Docker, pass env vars at runtime, not bake them into images.

## Related

- [Python read env](/snippets/python-read-env)
- [Learn: env secrets](/learn/devops-git/env-secrets)
- [Learn: env config](/learn/python-backend/env-config)`,

  "express-cors-session": `## What this pattern does

Configures Express with CORS that reflects the request origin and allows credentialed cookie-based requests from a frontend dev server.

## When to use it

Local development when the React app runs on \`:5173\` and the API on \`:8080\`, and session cookies must cross origins.

## How the code works

- \`cors({ origin: true, credentials: true })\` echoes the \`Origin\` header and sets \`Access-Control-Allow-Credentials\`.
- \`express.json()\` parses JSON bodies for POST/PUT routes.
- Browsers require explicit credentials on both client (\`fetch\`) and server.

## Common pitfalls

\`origin: true\` is permissive—lock to specific domains in production. Wildcard \`*\` cannot be used with credentials. Preflight OPTIONS must succeed for non-simple requests.

## Related

- [Fetch JSON POST](/snippets/fetch-json-post)
- [Express auth middleware](/snippets/express-auth-middleware)
- [Learn: methods & headers](/learn/web-apis/methods-headers)`,

  "express-auth-middleware": `## What this pattern does

Middleware checks \`req.session.adminAuthenticated\` and returns 401 JSON when the admin session is missing, otherwise calls \`next()\`.

## When to use it

Protect admin-only routes like stats, post editing, and subscriber exports behind server-side session verification.

## How the code works

- Optional chaining \`req.session?.adminAuthenticated\` safely handles missing session.
- Early \`return res.status(401).json(...)\` stops the chain.
- \`next()\` passes control to the route handler when authenticated.

## Common pitfalls

Client-side route guards alone are not security—always enforce on the server. Session stores must be configured (memory is not production-safe). Return consistent error shapes for the frontend to handle.

## Related

- [Learn: JWT auth](/learn/web-apis/auth-jwt)
- [Express CORS + cookies](/snippets/express-cors-session)
- [JWT verify snippet](/snippets/jwt-verify-hs256)`,

  "jwt-verify-hs256": `## What this pattern does

Verifies an HS256 JWT by recomputing the HMAC signature with a shared secret and comparing with timing-safe equality before parsing claims.

## When to use it

Server-side token validation for session alternatives, microservice auth, or API gateways using symmetric secrets.

## How the code works

- Split token into \`header\`, \`payload\`, and \`sig\`.
- \`createHmac("sha256", secret).update(data)\` hashes \`header.payload\`.
- \`timingSafeEqual\` prevents timing attacks on signature comparison.
- Decode payload from Base64URL only after verification succeeds.

## Common pitfalls

Never verify client-side for authorization decisions displayed to users—that's decode only. Rotate secrets carefully. Prefer RS256 when multiple services verify but only one signs.

## Related

- [JWT Decoder tool](/tools/jwt-decoder)
- [JWT decode payload (client)](/snippets/jwt-decode-payload)
- [Learn: JWT auth](/learn/web-apis/auth-jwt)
- [cURL Bearer token](/snippets/bash-curl-bearer-token)`,

  "regex-url-validation": `## What this pattern does

A regex tests whether input matches a basic \`http://\` or \`https://\` URL pattern suitable for form validation.

## When to use it

Link fields, webhook URLs, and social profile inputs where you need a quick sanity check before server-side URL parsing.

## How the code works

- \`^https?:\\/\\/\` requires http or https scheme.
- \`[^\\s/$.?#][^\\s]*$\` matches host and path without spaces or illegal leading chars.
- \`i\` flag allows uppercase schemes.
- \`trim()\` removes surrounding whitespace.

## Common pitfalls

Regex misses \`localhost\`, IP literals, and international domains in edge cases. Use \`new URL()\` on the server for authoritative parsing. Test patterns in the [regex tester](/tools/regex-tester).

## Related

- [Regex tester tool](/tools/regex-tester)
- [Email validation regex](/snippets/regex-email-basic)
- [Learn: methods & headers](/learn/web-apis/methods-headers)`,

  "regex-password-strength": `## What this pattern does

Validates that a password has at least 8 characters including lowercase, uppercase, and a digit using lookahead assertions.

## When to use it

Registration and password-change forms as a client-side hint—always enforce the same rules server-side with a proper password hash.

## How the code works

- \`(?=.*[a-z])\` requires a lowercase letter.
- \`(?=.*[A-Z])\` requires uppercase.
- \`(?=.*\\d)\` requires a digit.
- \`.{8,}\` enforces minimum length after lookaheads pass.

## Common pitfalls

Regex does not measure entropy—"Password1" passes but is weak. Add length 12+, breach checks, and special characters for real security. Never log or store plaintext passwords.

## Related

- [Sanitize user input](/snippets/sanitize-user-input)
- [Regex tester tool](/tools/regex-tester)
- [Learn: auth JWT](/learn/web-apis/auth-jwt)`,

  "sanitize-user-input": `## What this pattern does

Strips HTML tags from untrusted strings and optionally clamps length to prevent oversized or markup-injection payloads.

## When to use it

Comments, contact forms, and any user text displayed as plain text or stored before server validation.

## How the code works

- \`/<[^>]*>/g\` removes angle-bracket tags globally.
- \`.trim()\` drops leading/trailing whitespace.
- \`clampLength\` composes strip + \`.slice(0, max)\` for size limits.

## Common pitfalls

Regex stripping is not a XSS sanitizer for rich HTML—use DOMPurify or escape on output. Attribute-based XSS (\`<img onerror>\`) may survive naive patterns. Always validate and encode contextually (HTML vs JSON vs SQL).

## Related

- [Zod validation](/snippets/typescript-zod-parse)
- [Accessible HTML form](/snippets/html-accessible-form)
- [Learn: forms](/learn/frontend-react/forms)`,

  "python-post-json": `## What this pattern does

POSTs a Python dict as JSON via \`requests\`, with timeout and automatic error raising on failed HTTP status.

## When to use it

Calling REST APIs, webhooks, or microservices from Flask workers, Celery tasks, or CLI tools.

## How the code works

- \`requests.post(url, json=payload)\` serializes the dict and sets \`Content-Type\`.
- \`timeout\` prevents indefinite hangs.
- \`raise_for_status()\` throws on 4xx/5xx.
- \`res.json()\` parses the response.

## Common pitfalls

Large files should use \`files=\` multipart, not JSON. Retries need idempotent endpoints—see [python-sleep-retry](/snippets/python-sleep-retry). Always use HTTPS in production.

## Related

- [Python GET requests](/snippets/python-requests-get)
- [Learn: HTTP requests](/learn/python-backend/http-requests)
- [Fetch JSON POST (JS)](/snippets/fetch-json-post)`,

  "python-flask-health": `## What this pattern does

Defines a minimal Flask \`GET /health\` route returning \`{"status": "ok"}\` for load balancers and uptime monitors.

## When to use it

Kubernetes liveness probes, PaaS health checks, and deployment scripts that verify the process is listening before routing traffic.

## How the code works

- \`Flask(__name__)\` creates the application instance.
- \`@app.get("/health")\` registers a GET handler (Flask 2+ syntax).
- \`jsonify\` returns JSON with correct \`Content-Type\`.

## Common pitfalls

A static "ok" does not prove DB connectivity—add dependency checks for readiness vs liveness. Do not expose sensitive info in health responses. Secure admin routes separately.

## Related

- [Learn: HTTP requests](/learn/python-backend/http-requests)
- [Learn: deployment basics](/learn/devops-git/deployment-basics)
- [cURL GET headers](/snippets/bash-curl-get-headers)`,

  "sql-select-join": `## What this pattern does

Selects published posts with category names via \`LEFT JOIN\`, ordered newest first with a limit of 20 rows.

## When to use it

Blog indexes, admin dashboards, and API list endpoints where posts may exist without a category.

## How the code works

- \`FROM posts p\` aliases the posts table.
- \`LEFT JOIN categories c ON c.id = p.category_id\` keeps posts even if category is null.
- \`WHERE p.status = 'published'\` filters draft content.
- \`ORDER BY p.created_at DESC LIMIT 20\` paginates by recency.

## Common pitfalls

\`INNER JOIN\` drops uncategorized posts. Missing indexes on \`category_id\` and \`status\` slow large tables—see [sql-create-index](/snippets/sql-create-index). Use parameterized queries in app code.

## Related

- [Learn: JOINs](/learn/sql-databases/joins)
- [SQL pagination](/snippets/sql-pagination)
- [SQL formatter tool](/tools/sql-formatter)`,

  "sql-create-index": `## What this pattern does

Creates two PostgreSQL indexes: one on \`posts.slug\` for lookups, and a composite on \`(status, created_at DESC)\` for filtered lists.

## When to use it

After identifying slow queries in \`EXPLAIN ANALYZE\`, especially slug routes and published post feeds.

## How the code works

- \`CREATE INDEX IF NOT EXISTS\` is idempotent across migrations.
- \`idx_posts_slug\` speeds \`WHERE slug = $1\`.
- \`idx_posts_status_created\` supports \`WHERE status = ... ORDER BY created_at DESC\`.

## Common pitfalls

Over-indexing slows writes. Index column order matters for composite indexes—match your \`WHERE\` and \`ORDER BY\`. \`REINDEX\` or \`CONCURRENTLY\` for zero-downtime on large tables.

## Related

- [Learn: indexes](/learn/sql-databases/indexes)
- [SQL SELECT JOIN](/snippets/sql-select-join)
- [Learn: PostgreSQL tips](/learn/sql-databases/postgres-tips)`,

  "sql-pagination": `## What this pattern does

Returns a page of published posts using \`LIMIT\` and \`OFFSET\` with parameterized placeholders \`$1\` and \`$2\`.

## When to use it

Classic page-number APIs (\`page=2&size=20\`) where simplicity matters more than cursor performance at huge scale.

## How the code works

- \`ORDER BY created_at DESC\` ensures stable newest-first ordering.
- \`LIMIT $1\` is the page size.
- \`OFFSET $2\` skips prior rows (\`(page - 1) * limit\` in application code).

## Common pitfalls

Large \`OFFSET\` scans and discards rows—use keyset pagination for millions of rows. Always pair with \`ORDER BY\` on an indexed column. Offset pagination duplicates/skips rows when data changes during browsing.

## Related

- [Learn: SELECT & WHERE](/learn/sql-databases/select-where)
- [SQL SELECT JOIN](/snippets/sql-select-join)
- [Create index snippet](/snippets/sql-create-index)`,

  "css-grid-autofit": `## What this pattern does

Pure CSS Grid creates a responsive card layout that automatically fits as many \`280px\` minimum columns as the container allows.

## When to use it

When you want Tailwind-like responsive grids without a utility framework, or need precise control in design systems.

## How the code works

- \`display: grid\` enables grid layout.
- \`gap: 1rem\` spaces items uniformly.
- \`repeat(auto-fit, minmax(280px, 1fr))\` grows/shrinks columns between 280px and equal fractions.

## Common pitfalls

\`auto-fit\` collapses empty tracks differently than \`auto-fill\`—test with few items. Very narrow viewports may still overflow if \`minmax\` minimum is too large. Combine with \`max-width\` on the container.

## Related

- [Tailwind responsive grid](/snippets/tailwind-responsive-grid)
- [CSS center flex](/snippets/css-center-flex)
- [Line-clamp truncation](/snippets/css-truncate-multiline)`,

  "css-truncate-multiline": `## What this pattern does

CSS line-clamp truncates block text to three lines with an ellipsis, hiding overflow beyond the limit.

## When to use it

Post excerpts, card descriptions, comment previews, and anywhere fixed-height lists need consistent row heights.

## How the code works

- \`display: -webkit-box\` enables the legacy flexbox clamp model.
- \`-webkit-line-clamp: 3\` limits visible lines.
- \`-webkit-box-orient: vertical\` stacks lines vertically.
- \`overflow: hidden\` clips excess content.

## Common pitfalls

WebKit prefix is still required for broad support—modern \`line-clamp\` shorthand helps in newer browsers. Does not add "Read more" automatically. Long unbreakable strings may overflow horizontally—add \`word-break\`.

## Related

- [Tailwind card snippet](/snippets/tailwind-dark-card)
- [Semantic HTML layout](/snippets/html-semantic-layout)`,

  "html-semantic-layout": `## What this pattern does

Structures a page with semantic landmarks—\`header\`, \`nav\`, \`main\`, \`article\`, \`section\`, \`aside\`, and \`footer\`—for accessibility and SEO.

## When to use it

Every public page template, blog post layout, and documentation site where screen readers and search engines need clear document outline.

## How the code works

- \`header\` + \`nav aria-label="Main"\` identifies primary navigation.
- \`main id="main"\` is the skip-link target for keyboard users.
- \`article\` wraps self-contained post content with \`h1\`.
- \`aside\` holds related links; \`footer\` closes the page chrome.

## Common pitfalls

Multiple \`h1\` elements confuse outline order—one per page or per \`article\`. Do not skip heading levels. Landmarks replace div soup but still need labels when duplicated.

## Related

- [Accessible HTML form](/snippets/html-accessible-form)
- [SEO meta tags](/snippets/html-meta-seo)
- [Learn: DOM & browser](/learn/javascript-fundamentals/dom-browser)`,

  "html-accessible-form": `## What this pattern does

An HTML form pairs every input with a \`label\`, uses correct \`type\` attributes, and declares \`required\` and validation constraints.

## When to use it

Contact pages, newsletter sign-ups, and admin forms where keyboard and screen-reader users must understand each field.

## How the code works

- \`label for="email"\` associates with \`input id="email"\`.
- \`type="email"\` triggers appropriate mobile keyboards and basic validation.
- \`autocomplete="email"\` helps password managers.
- \`textarea minlength="10"\` enforces client-side length before submit.

## Common pitfalls

Placeholder is not a label substitute. Error messages need \`aria-describedby\` and live regions. Server must re-validate—client \`required\` is bypassable.

## Related

- [Email regex snippet](/snippets/regex-email-basic)
- [Learn: forms](/learn/frontend-react/forms)
- [Zod validation](/snippets/typescript-zod-parse)`,

  "html-meta-seo": `## What this pattern does

Adds description, Open Graph, and canonical meta tags so search engines and social platforms show accurate previews.

## When to use it

Every indexable public page—blog posts, tool pages, and landing routes—in static HTML or SSR head management.

## How the code works

- \`meta name="description"\` feeds search snippets.
- \`og:title\`, \`og:description\`, and \`og:type\` control social cards.
- \`link rel="canonical"\` consolidates duplicate URLs for ranking.

## Common pitfalls

Duplicate or missing \`og:image\` yields bland shares—add a 1200×630 image. Description length ~150–160 chars avoids truncation. Canonical must match the preferred HTTPS URL.

## Related

- [Semantic HTML layout](/snippets/html-semantic-layout)
- [Learn: REST design](/learn/web-apis/rest-design)`,

  "tailwind-button-variants": `## What this pattern does

Two Tailwind button patterns—a filled primary and a bordered outline—using shared sizing and hover utilities.

## When to use it

CTAs, form submits, and dialog actions in Tailwind-based design systems that need consistent interactive affordances.

## How the code works

- \`inline-flex items-center\` aligns icon + text vertically.
- Primary uses \`bg-primary text-primary-foreground hover:opacity-90\`.
- Outline uses \`border hover:bg-muted\` for secondary actions.
- Shared \`rounded-md px-4 py-2 text-sm font-medium\` unify dimensions.

## Common pitfalls

Buttons need \`type="button"\` inside forms to avoid accidental submit. Focus rings (\`focus-visible:ring\`) are required for keyboard users. Contrast ratios must pass WCAG on \`primary\` tokens.

## Related

- [Tailwind dark card](/snippets/tailwind-dark-card)
- [Learn: components & props](/learn/frontend-react/components-props)
- [Accessible HTML form](/snippets/html-accessible-form)`,

  "tailwind-dark-card": `## What this pattern does

A bordered card component with rounded corners, subtle shadow, title, and muted supporting text using design-system Tailwind tokens.

## When to use it

Feature grids, snippet listings, dashboard widgets, and blog sidebars where content needs visual grouping.

## How the code works

- \`rounded-xl border\` defines the card shell.
- \`bg-card\` uses theme-aware background (light/dark).
- \`p-5 shadow-sm\` adds padding and depth.
- \`text-muted-foreground\` de-emphasizes secondary copy.

## Common pitfalls

Cards inside grids need consistent min-height or line-clamp for alignment—see [css-truncate-multiline](/snippets/css-truncate-multiline). Ensure \`bg-card\` tokens exist in your Tailwind config.

## Related

- [Tailwind responsive grid](/snippets/tailwind-responsive-grid)
- [Line-clamp CSS](/snippets/css-truncate-multiline)
- [Learn: TypeScript + React](/learn/frontend-react/typescript-react)`,

  "react-use-fetch": `## What this pattern does

A React hook fetches JSON from a URL, tracking \`data\`, \`error\`, and \`loading\` state with cleanup on unmount or URL change.

## When to use it

Simple read-only views—stats cards, profile panels, or static API resources—before reaching for React Query or SWR.

## How the code works

- \`useState\` holds the three state slices.
- \`useEffect\` runs fetch when \`url\` changes.
- \`cancelled\` flag prevents setState after unmount.
- \`credentials: "include"\` sends session cookies.

## Common pitfalls

No refetch on focus or cache—duplicate requests on strict mode double-mount in dev. POST mutations do not belong here. For search debouncing, combine with [react-debounced-search](/snippets/react-debounced-search).

## Related

- [Learn: effects & useEffect](/learn/frontend-react/effects-useeffect)
- [Fetch JSON GET](/snippets/fetch-json-get)
- [Error boundary](/snippets/react-error-boundary)`,

  "react-debounced-search": `## What this pattern does

\`useDebouncedValue\` delays propagating a fast-changing value (like search input) until the user pauses typing for \`ms\` milliseconds.

## When to use it

Search fields, filter inputs, and autosuggest where firing an API call on every keystroke wastes bandwidth and causes race conditions.

## How the code works

- Local \`debounced\` state initializes to the current \`value\`.
- \`useEffect\` schedules \`setDebounced(value)\` after \`ms\`.
- Cleanup \`clearTimeout\` cancels pending updates when \`value\` changes again.
- Consumers pass \`debounced\` to \`useFetch\` or filter logic.

## Common pitfalls

Debounce delay too short still hammers the API; too long feels laggy—300ms is a common default. Cancel in-flight fetches when debounced value changes to avoid stale results.

## Related

- [Debounce function](/snippets/debounce)
- [useFetch hook](/snippets/react-use-fetch)
- [Learn: custom hooks](/learn/frontend-react/custom-hooks)`,

  "typescript-zod-parse": `## What this pattern does

Defines a Zod schema for contact form fields and parses unknown request bodies into a typed \`ContactInput\`, throwing on validation failure.

## When to use it

API route handlers, server actions, and any boundary where untrusted JSON enters your application.

## How the code works

- \`z.object({...})\` declares shape and constraints (\`min\`, \`max\`, \`email()\`).
- \`z.infer<typeof contactSchema>\` derives the TypeScript type.
- \`.parse(body)\` validates and returns typed data or throws \`ZodError\`.

## Common pitfalls

\`.parse\` throws—catch and map to 400 responses. \`.safeParse\` returns result objects for cleaner control flow. Schemas must stay in sync with OpenAPI docs.

## Related

- [JSON formatter tool](/tools/json-formatter)
- [Sanitize user input](/snippets/sanitize-user-input)
- [Learn: JSON APIs](/learn/web-apis/json-apis)
- [JSON → TypeScript tool](/tools/json-to-typescript)`,

  "typescript-partial-required": `## What this pattern does

Combines \`Partial\`, \`Pick\`, and \`Required\` to model draft posts (optional fields) versus create payloads (title and body mandatory).

## When to use it

PATCH vs POST DTOs, form state typing, and API clients where only some fields are editable or required.

## How the code works

- \`PostDraft = Partial<Pick<Post, "title" | "excerpt" | "body">>\` makes those keys optional.
- \`PostCreate = Required<Pick<Post, "title" | "body">> & { excerpt?: string }\` forces title/body while excerpt stays optional.

## Common pitfalls

\`Partial\` makes every picked key optional—including empty objects that violate business rules. Enforce required fields at runtime with Zod. Nested objects need deeper mapped types.

## Related

- [Pick & Omit snippet](/snippets/typescript-pick-omit)
- [Zod parse snippet](/snippets/typescript-zod-parse)
- [Learn: TypeScript + React](/learn/frontend-react/typescript-react)`,

  "bash-curl-get-headers": `## What this pattern does

Two cURL examples: one dumps response headers and status while discarding the body, another fetches JSON with an \`Accept\` header.

## When to use it

Debugging CORS, cache headers, health checks, and verifying content negotiation without a GUI client.

## How the code works

- \`-sS\` silences progress but shows errors.
- \`-D -\` writes headers to stdout; \`-o /dev/null\` drops the body.
- Second command adds \`-H "Accept: application/json"\` for typed responses.

## Common pitfalls

\`-D -\` mixes headers into stdout—redirect to a file for scripts. Follow redirects with \`-L\` when testing canonical URLs. Rate limits may block repeated probes.

## Related

- [cURL JSON API](/snippets/curl-json-api)
- [cURL Bearer token](/snippets/bash-curl-bearer-token)
- [Learn: methods & headers](/learn/web-apis/methods-headers)
- [Learn: testing APIs](/learn/web-apis/testing-apis)`,

  "bash-curl-bearer-token": `## What this pattern does

Authenticated GET request using an \`Authorization: Bearer\` header with a JWT stored in \`$TOKEN\`.

## When to use it

Testing protected API routes, debugging auth middleware, and scripting admin tasks against staging environments.

## How the code works

- \`TOKEN="..."\` holds the JWT (prefer env var over hard-coding).
- \`-H "Authorization: Bearer $TOKEN"\` sends the standard auth header.
- \`-H "Accept: application/json"\` requests JSON responses.

## Common pitfalls

Tokens in shell history are a leak—use \`read\` or env vars. Expired JWTs return 401—refresh or re-login. Never commit real tokens to repos.

## Related

- [JWT verify HS256](/snippets/jwt-verify-hs256)
- [JWT Decoder tool](/tools/jwt-decoder)
- [Learn: JWT auth](/learn/web-apis/auth-jwt)`,

  "bash-restore-postgres": `## What this pattern does

Restores a custom-format PostgreSQL dump with \`pg_restore\`, dropping existing objects first when safe.

## When to use it

Disaster recovery, refreshing staging from production backups, or local dev database seeding.

## How the code works

- \`set -euo pipefail\` aborts on any failure.
- \`--clean --if-exists\` drops objects before recreating them.
- \`-d "$DATABASE_URL"\` targets the destination database.
- Final argument is the \`.dump\` file from \`pg_dump -Fc\`.

## Common pitfalls

\`--clean\` is destructive—triple-check the URL. Role/owner mismatches cause warnings; use \`--no-owner\` if needed. Restore to an empty DB first when testing.

## Related

- [PostgreSQL backup snippet](/snippets/bash-backup-db)
- [Learn: backup & restore](/learn/sql-databases/backup-restore)
- [Learn: env secrets](/learn/devops-git/env-secrets)`,

  "python-sleep-retry": `## What this pattern does

Retries a flaky HTTP GET with exponential backoff—doubling delay after each \`RequestException\` up to a max attempt count.

## When to use it

Calling unreliable third-party APIs, waking services after deploy, or handling transient 502/503 errors.

## How the code works

- Loop runs \`attempts\` times with initial \`delay = 0.5\`.
- \`requests.get\` + \`raise_for_status()\` on success returns immediately.
- On failure, sleep \`delay\` seconds then \`delay *= 2\`.
- Re-raises on the final failed attempt.

## Common pitfalls

Retrying non-idempotent POSTs can duplicate data—retry GETs only or use idempotency keys. Respect \`Retry-After\` headers. Cap total wait time for user-facing paths.

## Related

- [Python GET requests](/snippets/python-requests-get)
- [Sleep promise (JS)](/snippets/sleep-promise)
- [Learn: HTTP requests](/learn/python-backend/http-requests)
- [Learn: errors & debugging](/learn/javascript-fundamentals/errors-debugging)`,
};

function buildGenericSnippetGuide(language: string, tags: string[]): string {
  const tagList = tags.length > 0 ? tags.join(", ") : "general";
  const learnLinks: string[] = [];

  if (tags.includes("react") || language === "typescript" && tags.includes("react")) {
    learnLinks.push("[Learn: Frontend React](/learn/frontend-react/intro)");
  }
  if (tags.includes("python") || language === "python") {
    learnLinks.push("[Learn: Python backend](/learn/python-backend/intro)");
  }
  if (tags.includes("sql") || tags.includes("postgres")) {
    learnLinks.push("[Learn: SQL databases](/learn/sql-databases/sql-intro)");
  }
  if (tags.includes("fetch") || tags.includes("api") || tags.includes("http")) {
    learnLinks.push("[Learn: Web APIs](/learn/web-apis/http-intro)");
  }
  if (tags.includes("bash") || tags.includes("curl")) {
    learnLinks.push("[Learn: Terminal basics](/learn/devops-git/terminal-basics)");
  }
  if (tags.includes("jwt")) {
    learnLinks.push("[JWT Decoder tool](/tools/jwt-decoder)");
  }
  if (tags.includes("regex")) {
    learnLinks.push("[Regex tester tool](/tools/regex-tester)");
  }
  if (tags.includes("css") || tags.includes("tailwind") || tags.includes("html")) {
    learnLinks.push("[Learn: DOM & browser](/learn/javascript-fundamentals/dom-browser)");
  }
  if (tags.includes("nodejs") || tags.includes("express")) {
    learnLinks.push("[Learn: JSON APIs](/learn/web-apis/json-apis)");
  }

  const uniqueLinks = [...new Set(learnLinks)];
  const relatedSection =
    uniqueLinks.length > 0
      ? `\n\n## Related\n\n${uniqueLinks.map((l) => `- ${l}`).join("\n")}`
      : `\n\n## Related\n\n- [All snippets](/snippets)\n- [Developer tools](/tools)`;

  return `## About this snippet

This **${language}** snippet covers **${tagList}** patterns you can copy into your project and adapt to your stack.

## How to use it

1. Read the code block and identify inputs, outputs, and side effects.
2. Copy the snippet into your module and adjust names, types, and error handling.
3. Add tests or manual checks for the happy path and common failure modes.

## Tips

- Match existing project conventions for imports, formatting, and lint rules.
- Prefer established libraries (validation, HTTP clients, auth) in production over minimal examples.
- Never paste secrets—use environment variables and server-side validation.

## Common pitfalls

Snippets are starting points, not drop-in production modules. Edge cases (SSR, multi-instance deploys, accessibility) often need extra work beyond the minimal example.${relatedSection}`;
}

export function getSnippetGuide(slug: string, language: string, tags: string[]): string {
  return SNIPPET_GUIDES[slug] ?? buildGenericSnippetGuide(language, tags);
}
