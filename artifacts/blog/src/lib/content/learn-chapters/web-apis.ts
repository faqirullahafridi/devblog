import type { LearnChapter } from "../types";

export const webApisChapters: LearnChapter[] = [
  {
    pathSlug: "web-apis",
    slug: "http-intro",
    title: "Introduction to HTTP",
    description: "How the web request–response cycle works and why HTTP is the foundation of modern APIs.",
    level: "beginner",
    minutes: 8,
    content: `## What HTTP actually is

Every time you open a webpage, submit a form, or call an API from your app, you are using **HTTP** (Hypertext Transfer Protocol). HTTP is an application-layer protocol: it defines how clients (browsers, mobile apps, scripts) ask servers for resources and how servers reply. The protocol itself is text-based and stateless—each request is independent unless you add cookies, tokens, or server-side sessions on top.

Understanding HTTP is essential because REST APIs, GraphQL gateways, webhooks, and CDN caching all sit on the same foundation. Once you can read a request and response as structured messages rather than magic network calls, debugging becomes straightforward.

## The request–response cycle

A typical interaction follows four steps:

1. **DNS lookup** — The client resolves a hostname (e.g. \`api.example.com\`) to an IP address.
2. **TCP/TLS connection** — For HTTPS, the client opens a secure channel before sending HTTP data.
3. **HTTP request** — The client sends a method, path, headers, and optional body.
4. **HTTP response** — The server returns a status code, headers, and often a body (HTML, JSON, etc.).

The connection may be reused (HTTP/1.1 keep-alive) or multiplexed (HTTP/2 and HTTP/3), but the logical message shape stays familiar.

## Anatomy of an HTTP request

An HTTP request has three main parts:

\`\`\`http
GET /posts?limit=10 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbG...
\`\`\`

- **Request line** — Method, path (and query string), HTTP version.
- **Headers** — Metadata: host, content type, auth, caching directives.
- **Body** — Optional payload for POST, PUT, PATCH; omitted for most GET requests.

## Anatomy of an HTTP response

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60

{"items":[...],"total":42}
\`\`\`

The **status line** includes a numeric code (200) and reason phrase (OK). Headers describe the body; the body carries the actual data.

## URLs and resources

HTTP operates on **resources** identified by URLs. A well-designed API maps nouns to paths: \`/users/42\`, \`/posts/7/comments\`. Query parameters filter or paginate: \`/posts?tag=javascript&page=2\`.

Versioning often appears in the path (\`/v1/users\`) or in headers (\`Accept: application/vnd.myapi.v2+json\`). Consistency matters more than which style you pick.

## HTTPS and trust

Production APIs should use **HTTPS**. TLS encrypts traffic and verifies server identity via certificates. Never send passwords or tokens over plain HTTP. Browsers mark HTTP sites as insecure; many platforms block mixed content.

## Stateless by design

HTTP does not remember previous requests. **Statelessness** simplifies scaling: any server can handle any request if it has the data and credentials. Applications add state through cookies, JWTs in \`Authorization\` headers, or server-side sessions stored in Redis or a database.

## What to learn next

With this mental model in place, you can inspect real traffic in browser DevTools (Network tab), compare methods and headers, and reason about why an API returns 404 versus 401. The following chapters build on these primitives: verbs, status codes, REST conventions, and authentication patterns.`,
  },
  {
    pathSlug: "web-apis",
    slug: "methods-headers",
    title: "HTTP Methods & Headers",
    description: "GET, POST, PUT, PATCH, DELETE—and the headers that control caching, content, and auth.",
    level: "beginner",
    minutes: 10,
    content: `## HTTP methods (verbs)

Methods tell the server **what kind of operation** you intend. REST APIs map them to CRUD operations, but semantics matter more than the acronym.

| Method | Typical use | Safe | Idempotent |
|--------|-------------|------|------------|
| GET | Read data | Yes | Yes |
| POST | Create or non-idempotent action | No | No |
| PUT | Replace entire resource | No | Yes |
| PATCH | Partial update | No | No* |
| DELETE | Remove resource | No | Yes |

**Safe** methods should not change server state (GET should not delete data). **Idempotent** methods produce the same effect if repeated—calling DELETE twice might return 404 the second time, but the resource stays deleted.

POST is the wildcard: login, file upload, "run report," or create when the client does not choose the ID. PUT replaces the whole document; PATCH sends only changed fields.

## Choosing the right method

Bad: \`GET /users/5/delete\` — GET must not mutate state; crawlers could trigger deletes.

Good: \`DELETE /users/5\` — Clear intent, cache-safe separation.

For updates, prefer PATCH when clients send partial JSON; use PUT when the contract is "send the full resource every time."

## Essential request headers

**Host** — Required in HTTP/1.1; identifies the virtual host.

**Content-Type** — Describes the body. APIs use \`application/json\`. File uploads use \`multipart/form-data\`.

**Accept** — What response formats the client understands: \`application/json\`, \`text/html\`.

**Authorization** — Credentials: \`Bearer <token>\`, \`Basic <base64>\`, or custom schemes.

**User-Agent** — Client identity (browser or \`MyApp/1.0\`).

**If-None-Match / ETag** — Conditional GET for caching; server returns 304 if unchanged.

## Essential response headers

**Content-Type** — Format of the body; must match what you parse.

**Cache-Control** — \`no-store\`, \`max-age=3600\`, \`private\` vs \`public\`—controls CDN and browser caching.

**Location** — On 201 Created, often points to the new resource URL.

**Set-Cookie** — Session cookies; use \`HttpOnly\`, \`Secure\`, \`SameSite\` in production.

**Access-Control-Allow-Origin** — CORS; required when browsers call your API from another origin.

## CORS in brief

Browsers block cross-origin reads unless the server opts in. Preflight \`OPTIONS\` requests check allowed methods and headers before POST with custom headers. Server-side clients (curl, backend services) ignore CORS; only browsers enforce it.

## Content negotiation

Clients and servers agree on format via \`Accept\` and \`Content-Type\`. APIs often standardize on JSON and ignore exotic negotiation; still, returning \`415 Unsupported Media Type\` for wrong \`Content-Type\` is good hygiene.

## Practical debugging

In DevTools or with \`curl -v\`, read the full request:

\`\`\`bash
curl -v -X PATCH https://api.example.com/posts/1 \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"title":"Updated"}'
\`\`\`

Verify method, headers, and body separately. Many bugs are wrong \`Content-Type\`, missing auth, or using POST where GET was enough.

## Summary

Methods express intent; headers carry metadata that shapes security, caching, and parsing. Mastering this table and a dozen common headers covers most day-to-day API work and interviews.`,
  },
  {
    pathSlug: "web-apis",
    slug: "status-codes",
    title: "HTTP Status Codes",
    description: "Read and return the right 2xx, 4xx, and 5xx codes so clients behave predictably.",
    level: "beginner",
    minutes: 10,
    content: `## Why status codes matter

An HTTP **status code** is a three-digit number in the response line. It tells clients whether to parse the body, retry, redirect, or show an error—without reading JSON first. Consistent use across your API reduces special-case logic in mobile apps and frontend code.

Codes group by first digit:

- **1xx** — Informational (rare in REST APIs)
- **2xx** — Success
- **3xx** — Redirection
- **4xx** — Client error (fix the request or auth)
- **5xx** — Server error (retry may help)

## Success: 2xx

**200 OK** — Generic success; GET, PATCH, or DELETE with a body.

**201 Created** — Resource created; include \`Location\` header and often the new entity in the body.

**204 No Content** — Success with no body; common for DELETE or updates where the client needs no payload.

Avoid returning 200 with an error object in JSON—that forces every client to inspect the body. Use 4xx/5xx instead.

## Redirection: 3xx

**301 Moved Permanently** — URL changed forever; update bookmarks and links.

**302 / 307** — Temporary redirect; method may or may not be preserved (307 preserves it).

**304 Not Modified** — Conditional GET succeeded; use cached copy. Saves bandwidth with ETags.

## Client errors: 4xx

**400 Bad Request** — Malformed JSON, invalid query syntax, or missing required field.

**401 Unauthorized** — Authentication missing or invalid (bad token, expired session). Clients should prompt login or refresh tokens.

**403 Forbidden** — Authenticated but not allowed (wrong role, suspended account). Retrying without permission change will not help.

**404 Not Found** — Resource does not exist—or you hide existence for security (sometimes 404 instead of 403).

**409 Conflict** — Duplicate email, optimistic locking failure, or state machine violation.

**422 Unprocessable Entity** — Syntax valid but semantics fail validation (field-level errors in body).

**429 Too Many Requests** — Rate limited; include \`Retry-After\` when possible.

## Server errors: 5xx

**500 Internal Server Error** — Unexpected bug; log server-side, return generic message to clients.

**502 Bad Gateway** — Upstream proxy received invalid response.

**503 Service Unavailable** — Overload or maintenance; clients may retry with backoff.

**504 Gateway Timeout** — Upstream too slow.

Never expose stack traces in 500 responses in production.

## Mapping errors to your API

Return a consistent JSON error shape:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Email is invalid",
    "details": [{ "field": "email", "issue": "format" }]
  }
}
\`\`\`

Pair **422** with validation details, **401** with \`WWW-Authenticate\` when using Basic auth, **429** with rate-limit headers (\`X-RateLimit-Remaining\`).

## Idempotency and codes

Repeating PUT or DELETE should return the same logical outcome: second DELETE might be **204** or **404** depending on style—document your choice. POST create twice might make two resources (**201** each)—use idempotency keys for payments.

## Client handling patterns

- **401** → refresh token or redirect to login
- **403** → show "no permission," do not retry blindly
- **404** → remove stale UI state
- **429** → exponential backoff
- **503** → retry with jitter

## Takeaway

Status codes are your API's first sentence. Pick the smallest accurate code, add a helpful body, and clients—including future you—will integrate faster and fail more gracefully.`,
  },
  {
    pathSlug: "web-apis",
    slug: "rest-design",
    title: "REST API Design",
    description: "Resources, nouns, pagination, and conventions that make APIs intuitive to use.",
    level: "intermediate",
    minutes: 12,
    content: `## What REST means in practice

**REST** (Representational State Transfer) is an architectural style, not a strict standard. In day-to-day work it means: model your domain as **resources** (nouns), address them with URLs, manipulate them with HTTP methods, and transfer state as representations (usually JSON).

You do not need HATEOAS links in every response to call something RESTful. You do need predictable URLs, correct verbs, and stable error behavior.

## Resource-oriented URLs

Design around collections and items:

\`\`\`
GET    /posts              # list
POST   /posts              # create
GET    /posts/{id}         # read one
PATCH  /posts/{id}         # partial update
DELETE /posts/{id}         # delete
GET    /posts/{id}/comments # nested collection
\`\`\`

Use **plural nouns** (\`/users\`, not \`/user\`). Keep verbs out of paths unless they represent sub-resources (\`/posts/123/publish\` as RPC is acceptable when it fits the domain).

## Filtering, sorting, pagination

List endpoints should accept query parameters:

\`\`\`
GET /posts?tag=api&sort=-published_at&limit=20&cursor=eyJpZCI6MTIzfQ
\`\`\`

**Offset pagination** (\`page=2&limit=20\`) is simple but slow on large tables. **Cursor pagination** scales better and avoids duplicates when data shifts during browsing.

Return metadata:

\`\`\`json
{
  "data": [...],
  "pagination": { "next_cursor": "...", "has_more": true }
}
\`\`\`

## Request and response shapes

Prefer flat, explicit JSON. Avoid wrapping everything in \`{ "data": { "data": ... } }\` unless you need a envelope for errors and metadata.

Use ISO 8601 for dates (\`2024-06-01T12:00:00Z\`). Use strings for IDs that may exceed JavaScript safe integers.

Document nullable fields and enums. Version breaking changes (\`/v2\`) or use additive evolution with optional fields.

## Idempotency and safety

Payment and order APIs often accept **Idempotency-Key** headers so retried POSTs do not double-charge. Design write endpoints with network failure in mind—clients will retry.

## Hypermedia and OpenAPI

Optional \`_links\` objects help discoverability; **OpenAPI** (Swagger) specs help humans and codegen. Publish spec + examples alongside implementation.

## RPC vs REST

Sometimes **RPC-style** endpoints are clearer: \`POST /reports/generate\`. That is fine for actions that are not CRUD on a single resource. Mix styles consciously; do not create \`POST /getUserById\`.

## Security by design

- Authenticate all non-public routes
- Authorize per resource (user 5 cannot read user 6's orders)
- Validate input at the boundary
- Rate limit expensive endpoints

## Naming and consistency checklist

- Same field names in requests and responses (\`user_id\` vs \`userId\`—pick one convention)
- Same error JSON everywhere
- Same pagination on all list routes
- Document deprecations with \`Sunset\` headers or changelog

## Evolution without breaking clients

Add fields, do not rename. Mark deprecated fields in docs. Use feature flags for large shifts. Monitor 404/400 spikes after deploys.

Well-designed REST APIs feel boring: you can guess the next endpoint because the patterns repeat. That boredom is a compliment.`,
  },
  {
    pathSlug: "web-apis",
    slug: "json-apis",
    title: "JSON APIs",
    description: "Serialize data correctly, validate payloads, and avoid common JSON pitfalls.",
    level: "beginner",
    minutes: 10,
    content: `## JSON as the lingua franca

Most modern APIs speak **JSON** (JavaScript Object Notation). It is human-readable, well supported in every language, and maps naturally to objects and arrays. HTTP already carries bytes; JSON gives those bytes structure that both servers and clients agree on.

A typical API response:

\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Learning HTTP",
  "published": true,
  "tags": ["http", "api"],
  "author": { "id": 1, "name": "Alex" }
}
\`\`\`

Always set \`Content-Type: application/json; charset=utf-8\` on JSON bodies.

## Parsing and producing safely

In JavaScript, \`JSON.parse\` throws on invalid input—wrap in try/catch or validate before parse. \`JSON.stringify\` drops \`undefined\`, converts \`Date\` to ISO strings only if you convert dates yourself, and rejects BigInt unless you add a replacer.

On the server, parse the body once at the middleware layer, then pass typed objects to handlers. Reject non-JSON \`Content-Type\` early with **415**.

## Validation at the boundary

Never trust client JSON. Use schemas:

- **Zod**, **Joi**, or **Pydantic** on the server
- **OpenAPI** generators for contract tests
- Return **422** with field paths: \`body.email must be email\`

Validate types, ranges, required fields, and string lengths before touching the database.

## Null vs omitted fields

Decide policy:

- **Omitted** — "unchanged" in PATCH
- **null** — "explicitly empty" (no author)

Document the difference. Inconsistent null handling breaks mobile clients.

## Numbers, dates, and IDs

JSON numbers are IEEE doubles—integers beyond \`2^53-1\` lose precision in JavaScript. Use **strings** for large IDs or money (or integers in minor units with clear docs).

Dates should be **UTC ISO 8601 strings**, not ambiguous \`06/01/2024\`.

## Nested vs flat responses

Nested objects read well for single resources; lists may use **embedding** or **linking**:

\`\`\`json
{
  "id": 1,
  "author_id": 5,
  "author": { "id": 5, "name": "Sam" }
}
\`\`\`

For many items, avoid N+1 bloat—offer \`?include=author\` sparingly or separate \`/authors/5\`.

## Error and success envelopes

Two popular patterns:

**Direct** — \`200\` + resource object; errors use 4xx/5xx + \`{ "error": ... }\`.

**Envelope** — \`{ "ok": true, "data": ... }\` always—some mobile teams prefer uniform parsing.

Pick one; mixing confuses SDK generation.

## Streaming and large payloads

For huge arrays, use **pagination** or **NDJSON** streams instead of multi-megabyte single responses. Compress with gzip at the reverse proxy.

## JSON Schema and tooling

Publish JSON Schema or OpenAPI components so consumers can validate fixtures in CI. Tools like Postman, Insomnia, and your blog's JSON formatter help debug pretty-printing and syntax errors during development.

## Common pitfalls

- Trailing commas (invalid in JSON)
- Single quotes (invalid—use double quotes)
- Duplicate keys (last wins—do not rely on it)
- Logging full bodies with passwords or PII

JSON is simple on the surface; discipline at validation and typing layers keeps APIs reliable as they grow.`,
  },
  {
    pathSlug: "web-apis",
    slug: "auth-jwt",
    title: "Authentication & JWT",
    description: "Sessions, bearer tokens, JWT structure, and secure patterns for API auth.",
    level: "intermediate",
    minutes: 12,
    content: `## Authentication vs authorization

**Authentication** answers "who are you?" **Authorization** answers "what may you do?" APIs usually authenticate via tokens or cookies, then authorize via roles, scopes, or resource ownership checks on each handler.

Return **401** when credentials are missing or invalid; **403** when the user is known but not permitted.

## Session cookies

Traditional web apps store a **session ID** in an \`HttpOnly\` cookie; the server looks up session data in Redis or a database. Browsers send cookies automatically on same-site requests. CSRF protection matters for cookie-based forms (SameSite cookies, CSRF tokens).

Good for server-rendered sites; mobile and SPA APIs often prefer tokens in headers.

## Bearer tokens and JWT

A **JWT** (JSON Web Token) is three Base64url segments: header, payload, signature.

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.signature
\`\`\`

The payload holds claims such as \`sub\` (subject), \`exp\` (expiry), \`iat\` (issued at), and custom roles. The signature proves integrity if you verify with the correct secret or public key.

Clients send:

\`\`\`http
Authorization: Bearer eyJhbGciOi...
\`\`\`

## Signing algorithms

- **HS256** — Shared secret; simple for monoliths
- **RS256** — Private key signs, public key verifies; better for microservices

Never put secrets in the JWT payload—it is only encoded, not encrypted. Anyone can decode and read claims.

## Access and refresh tokens

Short-lived **access tokens** (15 minutes) limit exposure. **Refresh tokens** (days, stored securely) obtain new access tokens without re-login. Rotate refresh tokens on use; revoke on logout.

Store refresh tokens hashed in the database; never log them.

## Validation checklist

On every protected route:

1. Extract token from header or cookie
2. Verify signature and \`exp\` (and \`nbf\` if used)
3. Check issuer (\`iss\`) and audience (\`aud\`) if multi-tenant
4. Load user permissions; enforce on the resource

Use established libraries—do not hand-roll crypto.

## OAuth 2 and OpenID Connect

Third-party login ("Sign in with Google") uses **OAuth 2** flows. Your API receives an authorization code, exchanges it for tokens, and maps \`sub\` to a local user. **OpenID Connect** adds identity claims (\`id_token\`).

For your own API, **client credentials** suit service-to-service; **authorization code + PKCE** suits public clients (SPAs, mobile).

## Security practices

- HTTPS only
- Short TTL on access tokens
- Do not store JWTs in \`localStorage\` if XSS is a risk—prefer HttpOnly cookies or secure native storage
- Invalidate sessions on password change
- Scope tokens minimally (\`read:posts\` not \`admin\`)

## Debugging JWTs

Use a JWT decoder tool to inspect claims during development—never paste production tokens into untrusted sites. Confirm clock skew does not invalidate \`exp\`.

## API keys

Simple **API keys** in headers suit server-to-server integrations. Treat keys like passwords: hash at rest, rotate, rate limit, and scope per key.

Auth is easy to get almost right—which is dangerously wrong. Verify tokens on every request, fail closed, and separate who you are from what you can do.`,
  },
  {
    pathSlug: "web-apis",
    slug: "rate-limiting",
    title: "Rate Limiting & Throttling",
    description: "Protect APIs from abuse, ensure fair usage, and communicate limits to clients.",
    level: "intermediate",
    minutes: 10,
    content: `## Why rate limit

Public and partner APIs face brute-force login attempts, scrapers, accidental infinite loops, and noisy neighbors on shared infrastructure. **Rate limiting** caps how many requests a client may make in a time window—protecting availability, controlling cost, and encouraging efficient integration.

Without limits, one bad cron job can saturate your database connection pool.

## Dimensions to limit

- **Per IP** — Simple for anonymous traffic; brittle behind NAT
- **Per API key or user ID** — Fair for authenticated clients
- **Per endpoint** — Stricter on expensive routes (\`/search\`, \`/export\`)
- **Global** — Circuit breaker when the whole service is hot

Combine tiers: anonymous 100/hour, authenticated 10,000/hour.

## Algorithms

**Fixed window** — Count requests per minute; simple but allows bursts at window edges.

**Sliding window** — Smoother; more state or approximation (Redis sorted sets).

**Token bucket** — Allows controlled bursts while maintaining average rate—popular in gateways.

**Leaky bucket** — Processes at steady rate; good for outbound calls.

Redis + Lua scripts or dedicated middleware (Express rate-limit, Kong, Cloudflare) implement these at scale.

## HTTP response when limited

Return **429 Too Many Requests** with:

\`\`\`http
Retry-After: 60
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1719853200
\`\`\`

Document limits in developer docs. Surprises create support tickets.

## Graceful degradation

When overloaded, prefer shedding read traffic or queueing writes before total failure. **503** with \`Retry-After\` beats silent timeouts.

## Quotas vs rate limits

**Rate limits** are short-term (requests per second). **Quotas** are long-term (10,000 emails per month on a billing plan). Enforce both at the billing/account layer.

## Implementation sketch

\`\`\`javascript
// Pseudocode: sliding window in Redis
const key = \`rl:\${userId}:\${Math.floor(Date.now() / 60000)}\`;
const count = await redis.incr(key);
await redis.expire(key, 120);
if (count > LIMIT) throw new RateLimitError();
\`\`\`

Run limit checks early in middleware—before heavy DB work.

## Bypass and exemptions

Health checks and internal services may use separate keys or IP allowlists. Monitor for stolen keys abusing high limits.

## Client best practices

Honor **429** and \`Retry-After\`. Use exponential backoff with jitter. Cache GET responses. Batch writes where the API supports bulk endpoints.

## Observability

Dashboard rate-limit hits per route and per client. Spikes often indicate bugs or attacks before they become outages.

Rate limiting is product policy expressed in HTTP. Clear headers and docs turn frustration into predictable integration.`,
  },
  {
    pathSlug: "web-apis",
    slug: "testing-apis",
    title: "Testing APIs",
    description: "Manual exploration, automated contracts, and CI patterns for reliable APIs.",
    level: "intermediate",
    minutes: 10,
    content: `## Layers of API testing

Quality comes from stacking approaches:

1. **Manual exploration** — curl, Postman, or HTTP client during development
2. **Unit tests** — Handler logic with mocked databases
3. **Integration tests** — Real HTTP server + test database
4. **Contract tests** — Consumer and provider agree on OpenAPI shapes
5. **End-to-end** — Critical flows in staging mirroring production

Each layer catches different failures; integration tests catch wrong status codes that mocks miss.

## Manual tools

**curl** is universal:

\`\`\`bash
curl -s -o /dev/null -w "%{http_code}" \\
  -H "Authorization: Bearer $TOKEN" \\
  https://api.example.com/posts
\`\`\`

Save requests as shell scripts or \`.http\` files for the team. Inspect headers with \`-v\`; send JSON with \`-d @body.json\`.

GUI clients help organize collections, environments (\`{{baseUrl}}\`), and share examples with non-developers.

## Writing integration tests

Spin up the app (or use a test container), seed data, call endpoints, assert status + JSON:

\`\`\`javascript
const res = await fetch("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: \`Bearer \${token}\` },
  body: JSON.stringify({ title: "Test" }),
});
expect(res.status).toBe(201);
const body = await res.json();
expect(body.title).toBe("Test");
\`\`\`

Use isolated databases per test run; truncate tables or wrap tests in transactions that roll back.

## Contract and schema testing

Generate tests from **OpenAPI**: required fields, types, enum values. **Schemathesis** fuzzes APIs from specs and finds 500s on edge inputs.

When the spec says 404 for missing IDs, CI should fail if the server returns 200 with \`null\`.

## Auth in tests

Factory functions create users and tokens. Test both happy path and **401/403** cases. Expired token fixtures verify clock handling.

## Performance and load

**k6** or **Locust** simulate concurrent users for SLA validation—not every PR, but before launches. Watch p95 latency and error rates, not just averages.

## Mocking external services

Use wire mocks or recorded cassettes for payment gateways and email APIs. Do not hit real Stripe in unit tests.

## CI pipeline habits

- Run integration tests on every push
- Block merge on OpenAPI drift (spec matches code)
- Smoke test staging after deploy (\`GET /health\`, create-read-delete fixture resource)

## Debugging failures

Log correlation IDs in tests. On failure, print response body and headers—not just status. Flaky tests often share database state; fix isolation first.

## Documentation as tests

Example requests in docs should run in CI (executable documentation). Drift between docs and behavior erodes trust faster than missing features.

Testing APIs is testing contracts with the outside world. Invest in repeatable HTTP scenarios and your deploys become boring—in the best way.`,
  },
];
