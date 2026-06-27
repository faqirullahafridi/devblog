export const INTERVIEW_GUIDES: Record<string, string> = {
  javascript: `## Overview

JavaScript is the default language for browser scripting and a core skill for frontend, full-stack, and Node.js roles. Interviewers expect you to explain how the language executes, how async code works, and how prototypes and closures differ from class-based OOP in other languages.

## Core concepts to master

**Types and equality.** Know primitive vs reference types, truthy/falsy values, and why \`===\` is preferred over \`==\`. Be ready to explain \`null\` vs \`undefined\` and \`typeof\` quirks.

**Scope and closures.** Understand block scope (\`let\`/\`const\`), function scope (\`var\`), hoisting, and the temporal dead zone. Closures appear in callbacks, module patterns, and React hooks — explain them with a concrete example like a counter or memoized function.

**The event loop.** JS runs on a single thread. The call stack executes synchronous code; the event loop drains microtasks (Promises) before macrotasks (\`setTimeout\`, I/O). This explains why \`Promise.then\` runs before \`setTimeout(0)\`.

**\`this\` binding.** Regular functions get \`this\` from how they are called; arrow functions inherit lexical \`this\`. Know \`call\`, \`apply\`, and \`bind\`.

**Prototypes and classes.** Objects delegate to prototypes on property lookup. ES6 classes are syntactic sugar over constructor functions and prototypes.

## Async patterns

Promises chain with \`.then\`/\`.catch\`; \`async/await\` is syntactic sugar over Promises. Know error handling in both styles. Mention \`Promise.all\` vs \`Promise.allSettled\` for parallel work.

## DOM and browser APIs (frontend roles)

Event bubbling vs capturing, \`preventDefault\`, and delegation. Know \`fetch\` basics, CORS at a high level, and localStorage vs sessionStorage.

## Common pitfalls interviewers probe

Mutating objects passed by reference, stale closures in loops (fix with \`let\` or \`forEach\`), and assuming \`async\` functions always run in parallel (they await sequentially unless you use \`Promise.all\`).

## ES6+ features worth knowing

Destructuring, spread/rest, template literals, optional chaining, and nullish coalescing appear in modern codebases daily. \`Map\` and \`Set\` solve cases where object keys or array uniqueness are awkward. Modules (\`import\`/\`export\`) replace global script tags and enable tree-shaking in bundlers.

## Interview focus areas

Expect live coding: flatten an array, implement \`Promise.all\`, or debug a closure loop. Whiteboard questions often trace output order mixing sync code, Promises, and \`setTimeout\`. For senior roles, discuss memory leaks (detached DOM nodes, forgotten listeners) and performance (debounce, requestAnimationFrame).

## How to prepare

Review MDN docs for one concept daily. Implement small utilities: debounce, deep clone (with caveats), \`Promise.all\` polyfill behavior. Practice explaining the event loop on a whiteboard. Read existing code in the repo you are interviewing for and trace one user action end-to-end. Time yourself on 20-minute coding exercises without autocomplete.`,

  python: `## Overview

Python interviews focus on readability, standard library fluency, and backend concerns: data structures, OOP, decorators, generators, and how CPython executes code. You should write idiomatic Python and explain trade-offs clearly.

## Data structures and builtins

Lists are mutable sequences; tuples are immutable and hashable. Dicts preserve insertion order (3.7+). Sets give O(1) membership. Know list/dict/set comprehensions and when they beat explicit loops for clarity.

**Mutability.** Passing a list to a function passes a reference — in-place changes affect the caller. Default mutable arguments (\`def f(x=[])\`) are a classic trap; use \`None\` and assign inside the function.

## Functions and OOP

Explain \`*args\` and \`**kwargs\` for flexible APIs. Decorators wrap functions at definition time — know how to write one with \`functools.wraps\`. Understand \`@staticmethod\`, \`@classmethod\`, and instance methods.

Classes use \`__init__\` for setup; dunder methods (\`__str__\`, \`__repr__\`, \`__eq__\`) show Pythonic design. Mention dataclasses for simple data containers.

## Iteration and memory

Generators yield values lazily — useful for large datasets and pipelines. \`yield from\` delegates to sub-generators. Know the difference between iterator, iterable, and generator.

## Concurrency

The GIL limits true parallelism in threads for CPU-bound work; use \`multiprocessing\` or run C extensions that release the GIL. For I/O-bound work, \`asyncio\` or threads work well. Know when to choose each.

## Error handling and testing

Use specific exceptions, not bare \`except:\`. Context managers (\`with open(...)\`) handle cleanup. Mention \`pytest\`, fixtures, and mocking external services.

## Standard library highlights

\`collections\` (Counter, defaultdict, deque), \`itertools\`, \`pathlib\`, \`json\`, \`typing\` / type hints. Know \`if __name__ == "__main__"\` for script entry points.

## Packaging and tooling

Know \`venv\` or \`poetry\` for isolated environments. \`pip install -r requirements.txt\` vs \`pyproject.toml\` for modern projects. Type hints with \`mypy\` or \`pyright\` show professionalism in larger codebases. Familiarity with \`requests\`, \`httpx\`, or \`aiohttp\` for HTTP clients is common in backend interviews.

## Interview focus areas

Live exercises often involve parsing logs, counting with \`Counter\`, or writing a decorator that caches results. Be ready to discuss time complexity of list vs set lookups. Backend roles may ask about WSGI/ASGI, Django vs FastAPI trade-offs, or how you would structure a small REST service with tests.

## How to prepare

Solve LeetCode easy/medium in Python to practice clean loops and dict/set patterns. Read PEP 8 style. Build a small CLI or API with FastAPI or Flask and explain request lifecycle. Be ready to whiteboard a decorator or context manager from scratch. Review one open-source Python module and explain its public API.`,

  sql: `## Overview

SQL interviews test whether you can read and write correct queries, design sensible schemas, and reason about performance. Expect SELECT/JOIN/GROUP BY questions, normalization basics, and index trade-offs.

## Query fundamentals

SELECT chooses columns; FROM defines sources; WHERE filters rows before grouping; GROUP BY aggregates; HAVING filters groups; ORDER BY sorts; LIMIT paginates. Know execution order differs from written order — filters before aggregates matter.

**JOINs.** INNER returns matches only. LEFT keeps all left rows. RIGHT and FULL exist but LEFT + swap is common. Understand when NULLs appear in join results.

**Subqueries vs CTEs.** Common Table Expressions (\`WITH\`) improve readability and can be optimized similarly to subqueries. Window functions (\`ROW_NUMBER\`, \`RANK\`, \`SUM() OVER\`) solve ranking and running totals without self-joins.

## Schema design

Primary keys uniquely identify rows. Foreign keys enforce referential integrity. Normalization reduces redundancy (1NF–3NF at minimum); denormalize deliberately for read-heavy analytics.

**Constraints.** NOT NULL, UNIQUE, CHECK, DEFAULT. Understand composite keys and surrogate vs natural keys.

## Indexes and performance

B-tree indexes speed equality and range lookups on indexed columns. Composite indexes follow left-prefix rules — index \`(a, b)\` helps \`WHERE a = ?\` and \`WHERE a = ? AND b = ?\` but not \`WHERE b = ?\` alone.

Avoid SELECT * in hot paths. EXPLAIN / EXPLAIN ANALYZE shows scan vs index seek. N+1 query problems in apps are fixed with JOINs or batch loading.

## Transactions

ACID: Atomicity, Consistency, Isolation, Durability. Isolation levels (READ COMMITTED, REPEATABLE READ, SERIALIZABLE) trade consistency for concurrency. Know deadlocks and why short transactions help.

## Practical scenarios

"Second highest salary" — subquery or window function. "Users who never ordered" — LEFT JOIN WHERE right IS NULL. Running totals — window functions. Pagination — LIMIT/OFFSET vs keyset pagination for large tables.

## Data types and NULL behavior

Understand VARCHAR vs TEXT, INT vs BIGINT, TIMESTAMP WITH TIME ZONE vs without. NULL comparisons require \`IS NULL\`, not \`= NULL\`. Aggregates like \`COUNT(*)\` vs \`COUNT(column)\` treat NULLs differently — a common trick question.

## Interview focus areas

Expect to write JOIN queries on the spot, explain why a query is slow, or design a schema for a blog, e-commerce cart, or booking system. Know when to add an index and when a partial index helps (\`WHERE status = 'active'\`). ORM users should still read the SQL their tools generate.

## How to prepare

Practice on PostgreSQL or SQLite. Write queries without an ORM first, then compare to ORM output. Review one slow query with EXPLAIN. Memorize JOIN diagrams and one example per join type. Complete five window-function exercises (rank, dedupe, running total).`,

  react: `## Overview

React interviews assess component design, hooks, rendering behavior, and performance intuition. You should explain how UI updates flow from state changes and how to avoid unnecessary re-renders without over-engineering.

## Components and JSX

Components are functions (or classes in legacy code) that return UI descriptions. JSX transpiles to \`React.createElement\`. Props are read-only; state is local and triggers re-renders when updated.

**Composition over inheritance.** Use children, render props, or compound components instead of deep class hierarchies.

## Hooks (essential)

\`useState\` — local state; updates are asynchronous and batched in event handlers. \`useEffect\` — side effects after paint; dependency array controls when it runs; cleanup prevents leaks. \`useRef\` — mutable box that persists without re-render; DOM refs and previous values.

\`useMemo\` and \`useCallback\` memoize values and functions — use when profiling shows benefit, not by default. \`useContext\` shares data without prop drilling.

**Rules of hooks.** Only call at top level of React functions, not in loops or conditions.

## Rendering model

State change → re-render component → reconcile virtual DOM → commit DOM updates. Keys help reconcile lists correctly — stable IDs, not index when items reorder.

Controlled inputs tie value to state; uncontrolled use refs. Prefer controlled for validation and single source of truth.

## State management

Lift state to the lowest common ancestor. Context for theme/auth; Zustand/Redux for complex global state. Server state often belongs in TanStack Query or similar — cache, refetch, stale-while-revalidate.

## Performance

React.memo for pure components, virtualization for long lists, code splitting with \`lazy\` + \`Suspense\`. Avoid inline object/function props that break memoization unless intentional.

## Testing and patterns

React Testing Library — test behavior, not implementation. Error boundaries catch render errors in children.

## Accessibility and forms

Semantic HTML (\`label\`, \`button\`, \`nav\`) matters in production React apps. Associate labels with inputs; manage focus on modal open/close. Form libraries (React Hook Form, Formik) reduce boilerplate — know why controlled inputs still underpin them.

## Interview focus areas

Debug a broken \`useEffect\`, fix a list key warning, or implement a debounced search input. Explain reconciliation without jargon first, then introduce virtual DOM if asked. Framework-agnostic employers still test JS fundamentals — closures in callbacks and stale state in async handlers appear often.

## How to prepare

Build a small app with forms, fetching, and routing. Explain why a specific \`useEffect\` dependency array is correct. Trace one click from event handler to DOM update. Read React docs on "You Might Not Need an Effect." Rebuild one component from scratch without copying boilerplate.`,

  "system-design-basics": `## Overview

Junior and mid-level system design interviews test structured thinking, not memorized architectures. You should clarify requirements, estimate scale, draw a simple diagram, and discuss trade-offs in plain language.

## Framework for answers

1. **Requirements** — functional (features) and non-functional (latency, availability, consistency).
2. **Estimates** — users, QPS, storage (back-of-envelope: 1M DAU × 10 actions/day ≈ ~115 writes/sec average, higher at peak).
3. **High-level design** — clients, load balancer, app servers, database, cache, queue.
4. **Deep dives** — pick 2–3 components (API design, data model, caching strategy).
5. **Bottlenecks** — single points of failure, hot keys, thundering herd.

## Scaling patterns

**Vertical scaling** — bigger machine; simple but limited. **Horizontal scaling** — more instances; needs stateless app servers and load balancing.

**Load balancers** distribute traffic (round-robin, least connections). Health checks remove unhealthy nodes.

**Caching** — browser, CDN (static assets), application cache (Redis). Cache-aside: read cache, on miss read DB and populate. Set TTLs; plan invalidation on writes.

**Database** — SQL for transactions and relations; read replicas for read-heavy workloads; sharding when single DB limits hit. NoSQL for flexible schema, high write throughput, or document models — know CAP at a high level.

## Reliability

Replication and failover for databases. Message queues (SQS, RabbitMQ, Kafka) decouple producers and consumers, absorb spikes, and enable async processing.

**Rate limiting** protects APIs — token bucket or sliding window per user/IP.

## Common designs (practice these)

URL shortener, paste bin, rate-limited API, news feed (pull vs push), chat messaging, file upload to object storage (S3) with metadata in DB.

## What interviewers want

Clear communication, reasonable assumptions stated aloud, and awareness that every choice has trade-offs. It is fine to say "I would validate this metric before building."

## Observability and ops basics

Logs, metrics, and traces help debug production systems. Mention health check endpoints for load balancers, structured logging (JSON), and alerting on error rates. You do not need deep DevOps expertise — show you think about operability.

## Interview focus areas

You will not design Twitter in 45 minutes — scope matters. State assumptions: "Assume 10k DAU, read-heavy, eventual consistency OK for feeds." Discuss API design (REST vs GraphQL briefly), data model entities, and one scaling bottleneck. Draw clearly labeled boxes: client, LB, app, cache, DB, queue.

## How to prepare

Read "Designing Data-Intensive Applications" chapters on replication and partitioning. Practice 35-minute mock designs on paper. Draw boxes and arrows until it feels natural. Pair each component with one failure mode and one mitigation. Record yourself explaining one design aloud and tighten vague phrases.`,

  "qa-behavioral": `## Overview

QA and behavioral rounds evaluate how you think about quality, communicate under pressure, and collaborate. Technical QA questions overlap with testing strategy; behavioral questions use structured stories from your experience.

## Testing fundamentals

**Test pyramid.** Many fast unit tests, fewer integration tests, minimal e2e tests. Unit tests isolate logic; integration tests verify components together (API + DB); e2e tests simulate real user flows in a browser or device.

**Test cases.** Equivalence partitioning and boundary value analysis — test min, max, just inside/outside limits. Happy path plus error paths, auth, empty input, oversized payload, concurrency.

**API testing.** Status codes, response schema, idempotency for PUT/DELETE, rate limits, and auth headers. Tools: curl, Postman, automated suites in CI.

**Bug reports.** Repro steps, expected vs actual, environment, severity, screenshots/logs. Good reports save developer time.

## Automation mindset

Automate repetitive regression; keep tests stable (avoid brittle selectors). Flaky tests erode trust — fix or quarantine them. CI should fail fast on main branch breaks.

## Behavioral structure (STAR)

**Situation** — context in one sentence. **Task** — your responsibility. **Action** — what you did (use "I", be specific). **Result** — measurable outcome or lesson learned.

Prepare 5–7 stories: bug you found/fixed, conflict with teammate, missed deadline, learned new tech quickly, improved process, mentored someone, received critical feedback.

## Common questions

"Tell me about a difficult bug" — emphasize systematic debugging: reproduce, isolate, hypothesize, verify fix, add test. "How do you prioritize testing?" — risk-based: critical paths and recent changes first. "Disagreement with a developer?" — data and user impact, not ego; escalate if needed.

## QA-specific scenarios

How would you test a login form, a payment flow, or a mobile app offline mode? Mention accessibility, security (SQL injection, XSS at high level), and performance smoke checks.

## Security and performance testing (high level)

Know the difference between authentication and authorization testing. Mention OWASP Top 10 categories without deep exploitation — SQL injection prevented by parameterized queries, XSS mitigated by escaping output. Performance smoke tests: response time under load, not full load testing unless the role demands it.

## Interview focus areas

Hybrid QA/SDET roles may ask you to write a test plan or pseudo-code for automation. Pure behavioral rounds score communication and ownership. Avoid badmouthing past teams; focus on what you learned. Ask clarifying questions before answering scenario prompts — it mirrors good QA practice.

## How to prepare

Write STAR bullets for your resume items. Practice aloud — 2 minutes per story. Review one project’s test coverage and name one gap you would close. Read your company’s incident postmortems if public — they show quality culture expectations. Prepare two thoughtful questions about their release process and quality gates.`,

  typescript: `## Overview

TypeScript adds static typing to JavaScript and is standard in modern frontend and many Node.js codebases. Interviews focus on type system features, inference, generics, and how types compile away while catching bugs at build time.

## Core type concepts

**Structural typing.** TypeScript compares shape, not nominal names — if it has the required properties, it matches. \`interface\` and \`type\` alias both describe shapes; interfaces extend cleanly, types union/intersect flexibly.

**Basic types.** \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`, \`void\`, \`never\`, \`unknown\`, \`any\`. Prefer \`unknown\` over \`any\` for safe narrowing.

**Union and intersection.** \`A | B\` is either; \`A & B\` is both. Discriminated unions (\`kind: 'circle' | 'square'\`) enable exhaustive \`switch\` checks.

## Inference and narrowing

TypeScript infers types from initialization. Narrow with \`typeof\`, \`instanceof\`, \`in\`, and user-defined type guards (\`x is Foo\`). Control flow analysis refines types inside \`if\` blocks.

## Functions and generics

Annotate parameters and return types when public API clarity matters; inference often suffices internally. Generics (\`function id<T>(x: T): T\`) preserve type relationships. Constraints: \`<T extends HasId>\`.

**Utility types.** \`Partial<T>\`, \`Required<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`, \`Record<K, V>\`, \`ReturnType<F>\` — know common ones.

## Advanced topics (mid-level)

\`readonly\`, \`as const\`, mapped types, conditional types at a high level. Module augmentation for extending third-party types.

**strict mode.** \`strictNullChecks\` eliminates null surprises. Enable \`strict\` in tsconfig for new projects.

## With React

\`React.FC\` is optional; prefer explicit props interfaces. \`ComponentProps<'button'>\` extracts DOM props. Generic components: \`List<T>\` with \`items: T[]\`.

## Compilation model

Types erase at compile time — no runtime overhead. \`tsc\` checks types; bundlers emit JS. Declaration files (\`.d.ts\`) describe JS libraries.

## Common pitfalls

Overusing \`any\` defeats the purpose. Type assertions (\`as Foo\`) bypass checks — use when you have proof. Enums vs union of literals — many teams prefer \`as const\` objects.

## Config and tooling

\`tsconfig.json\` options: \`target\`, \`module\`, \`moduleResolution\`, \`paths\` for aliases, \`skipLibCheck\`. Know how types flow through build tools (Vite, tsc, esbuild). \`satisfies\` operator (TS 4.9+) validates without widening literal types — increasingly common in interviews.

## Interview focus areas

Live tasks: type a fetch wrapper, define props for a generic table component, or fix code broken by \`strictNullChecks\`. Explain when to reach for generics vs union types. Mid-level candidates should discuss migrating a JS codebase incrementally (\`allowJs\`, \`checkJs\`).

## How to prepare

Convert a small JS module to TS with strict mode. Practice writing generic \`pick\`/\`omit\` by hand. Explain one bug TypeScript caught that JS would miss. Read the TypeScript handbook sections on narrowing and generics. Enable \`strict\` in a personal project and fix every new error without using \`any\`.`,

  nodejs: `## Overview

Node.js lets you run JavaScript on the server using Chrome's V8 engine. Interviews cover the event-driven non-blocking I/O model, core modules, Express/Fastify patterns, streams, and production concerns like security and clustering.

## Runtime architecture

Node is single-threaded for JavaScript execution with a libuv thread pool for I/O. The event loop handles timers, I/O callbacks, and microtasks — same conceptual model as browser JS. CPU-heavy work blocks the loop; offload to worker threads or separate services.

**CommonJS vs ESM.** \`require\`/\`module.exports\` vs \`import\`/\`export\`. Know \`"type": "module"\` in package.json and \`.mjs\` / \`.cjs\` extensions.

## Core modules

\`fs\` (prefer \`fs/promises\`), \`path\`, \`http\`/\`https\`, \`crypto\`, \`events\` (EventEmitter), \`stream\`, \`worker_threads\`, \`cluster\`. Understand streams for large file processing — pipe instead of loading entire files into memory.

## HTTP servers and middleware

Express middleware chain: \`(req, res, next)\` — order matters. Error-handling middleware has four arguments. Know routing, body parsers, CORS, and static file serving.

**Async handlers.** Wrap async route handlers to catch rejected Promises — unhandled rejections can crash the process or leave requests hanging.

## Data and persistence

Connect to PostgreSQL/MongoDB via official drivers or ORMs (Prisma, Drizzle). Use connection pooling in production. Environment variables via \`process.env\` — never commit secrets.

## Security essentials

Validate and sanitize input. Use helmet for HTTP headers. Rate limit auth endpoints. Avoid \`eval\` and command injection. Keep dependencies updated (\`npm audit\`). Hash passwords with bcrypt or argon2, never store plaintext.

## Process management

\`process.env.NODE_ENV\` for config. Graceful shutdown on SIGTERM — close server, drain connections, then exit. PM2 or container orchestration for restarts. Cluster module forks workers per CPU for HTTP throughput.

## Testing and debugging

\`node --inspect\` for debugging. Supertest for HTTP integration tests. Mock external services, not your own business logic in unit tests.

## Deployment and production

Node apps run behind reverse proxies (nginx, Caddy) that handle TLS and static assets. Docker multi-stage builds keep images small. Environment-specific config via env vars; 12-factor app principles resonate in interviews. Know difference between development (\`nodemon\`) and production process managers.

## Interview focus areas

Implement a rate-limited route, stream a large CSV response, or debug an memory leak from global caches. Discuss JWT vs session cookies for auth at a high level. Full-stack roles connect Node APIs to React frontends — explain CORS, cookie \`SameSite\`, and why credentials require explicit config.

## How to prepare

Build a REST API with auth, validation (Zod), and one database. Explain what happens from incoming TCP connection to JSON response. Read Node docs on event loop phases. Practice one question on streams vs buffers and one on handling uncaught exceptions vs unhandled rejections. Deploy one API to a free tier (Railway, Fly.io) to speak concretely about ops.`,
};
