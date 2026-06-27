export const INTERVIEW_EXTRA_QUESTIONS: Record<
  string,
  Array<{ q: string; a: string }>
> = {
  javascript: [
    {
      q: "What is the difference between null and undefined?",
      a: "`undefined` means a variable was declared but not assigned a value, or a missing object property. `null` is an intentional absence of value assigned by the developer. `typeof null` returns `'object'` (historical bug); use strict equality to distinguish them.",
    },
    {
      q: "Explain prototypal inheritance.",
      a: "Every object has an internal `[[Prototype]]` link to another object. Property lookup walks the chain until it finds a match or reaches `null`. `Object.create(proto)` sets the prototype explicitly; class syntax delegates to this same mechanism under the hood.",
    },
    {
      q: "What are microtasks vs macrotasks?",
      a: "Microtasks (Promise callbacks, `queueMicrotask`) run after the current call stack clears and before the next macrotask. Macrotasks include `setTimeout`, `setInterval`, and I/O callbacks. This ordering explains common interview puzzles about execution order.",
    },
    {
      q: "How does debouncing differ from throttling?",
      a: "Debounce waits until activity stops for a delay, then runs once — ideal for search input. Throttle runs at most once per interval during continuous activity — ideal for scroll or resize handlers. Both reduce work but optimize for different interaction patterns.",
    },
    {
      q: "What is event delegation?",
      a: "Attach one listener on a parent instead of many on children. Events bubble up; you inspect `event.target` to handle the correct element. It reduces memory use and works for dynamically added elements without rebinding listeners.",
    },
    {
      q: "Explain shallow copy vs deep copy.",
      a: "Shallow copy duplicates top-level properties; nested objects still share references (`Object.assign`, spread). Deep copy recursively clones nested structures (`structuredClone`, JSON parse/stringify with limitations). Mutating nested data in a shallow copy affects the original.",
    },
    {
      q: "What is a Promise and its states?",
      a: "A Promise represents a future value with states: pending, fulfilled, or rejected. `.then` handles fulfillment; `.catch` handles rejection. Promises are eager — the executor runs immediately when the Promise is created.",
    },
    {
      q: "What are Symbols used for?",
      a: "Symbols are unique, immutable primitive values often used as non-enumerable object keys to avoid naming collisions. Well-known symbols like `Symbol.iterator` define iteration behavior. They are useful for meta-programming and library internals.",
    },
    {
      q: "How does optional chaining (`?.`) work?",
      a: "It short-circuits property access when the left side is `null` or `undefined`, returning `undefined` instead of throwing. Works for methods (`obj.method?.()`) and brackets (`arr?.[0]`). Pair with nullish coalescing (`??`) for defaults without treating `0` or `''` as missing.",
    },
    {
      q: "What is the module pattern in JavaScript?",
      a: "Encapsulate private state in a closure and expose a public API via returned object or ES modules. ES modules (`import`/`export`) provide static structure, tree-shaking, and strict mode by default. IIFE-based modules were common before native modules.",
    },
  ],

  python: [
    {
      q: "What is a Python generator and why use one?",
      a: "Generators yield values lazily using `yield`, pausing execution between items. They use less memory than building full lists for large or infinite sequences. Generator expressions `(x for x in iterable)` offer compact syntax similar to list comprehensions.",
    },
    {
      q: "Explain list vs dictionary comprehension.",
      a: "List comprehensions build lists: `[f(x) for x in items if cond]`. Dict comprehensions build dicts: `{k: v for k, v in pairs}`. Set comprehensions exist too. They are readable for simple transforms but can hurt readability when nested deeply.",
    },
    {
      q: "What is `__name__ == '__main__'` for?",
      a: "It guards code that should run only when the file is executed directly, not when imported as a module. This pattern keeps reusable functions importable while allowing CLI scripts in the same file. It is standard in Python project structure.",
    },
    {
      q: "How does Python handle memory management?",
      a: "CPython uses reference counting plus a cyclic garbage collector for objects that reference each other. When refcount hits zero, memory is freed immediately. Understanding this helps explain why circular references in long-lived objects need GC cycles.",
    },
    {
      q: "What are context managers?",
      a: "Objects used with `with` that call `__enter__` and `__exit__` to set up and tear down resources. Files, locks, and DB connections use them to guarantee cleanup even on exceptions. `contextlib.contextmanager` lets you write them with generators.",
    },
    {
      q: "Difference between `@staticmethod` and `@classmethod`?",
      a: "`@staticmethod` receives no implicit first argument — it is a namespaced function. `@classmethod` receives the class as first argument (`cls`) and can override constructors or provide alternative factories. Instance methods receive `self`.",
    },
    {
      q: "What is duck typing?",
      a: "Python cares about behavior, not explicit type: 'if it walks like a duck and quacks like a duck, use it.' Protocols and ABCs formalize this when needed. It enables flexible APIs but requires clear documentation and tests.",
    },
    {
      q: "How do you handle exceptions properly?",
      a: "Catch specific exceptions, not bare `except Exception` unless re-raising or logging. Use `else` for code that runs when no exception occurred; `finally` for cleanup. Custom exception classes clarify domain errors for callers.",
    },
    {
      q: "What is the difference between `is` and `==`?",
      a: "`==` compares values (calls `__eq__`). `is` compares identity — same object in memory. Use `is` only for singletons like `None`, `True`, `False`. Small integers may be interned, but do not rely on `is` for value equality.",
    },
    {
      q: "Explain asyncio at a high level.",
      a: "`async def` defines coroutines; `await` yields control during I/O so other tasks run. An event loop schedules coroutines on a single thread — great for many concurrent network calls. It does not bypass the GIL for CPU-bound parallelism.",
    },
  ],

  sql: [
    {
      q: "What is the difference between WHERE and HAVING?",
      a: "WHERE filters rows before grouping and aggregation. HAVING filters groups after `GROUP BY` based on aggregate results like `COUNT(*) > 5`. You cannot use aggregate functions in WHERE unless they are in a subquery.",
    },
    {
      q: "Explain a LEFT JOIN anti-join pattern.",
      a: "To find rows in A with no match in B: `FROM A LEFT JOIN B ON ... WHERE B.id IS NULL`. This returns only A rows lacking a B counterpart. It is clearer than `NOT IN` with nullable columns, which has subtle NULL behavior.",
    },
    {
      q: "What is a covering index?",
      a: "An index that includes all columns needed by a query, so the database can satisfy the query from the index alone without table lookups. Adding `INCLUDE` columns or careful composite index design reduces I/O for read-heavy queries.",
    },
    {
      q: "UNION vs UNION ALL?",
      a: "UNION combines result sets and removes duplicates (sort/hash cost). UNION ALL concatenates all rows including duplicates — faster when you know duplicates are impossible or acceptable. Both require compatible column counts and types.",
    },
    {
      q: "What are window functions?",
      a: "They compute aggregates over a 'window' of rows related to the current row without collapsing groups. Examples: `ROW_NUMBER()`, `RANK()`, `LAG()`, `SUM() OVER (PARTITION BY dept ORDER BY salary)`. Essential for rankings and running totals.",
    },
    {
      q: "Explain normalization vs denormalization.",
      a: "Normalization splits data to reduce redundancy and update anomalies (1NF–3NF common). Denormalization duplicates data for faster reads in analytics or read-heavy dashboards. OLTP systems tend normalized; reporting often denormalizes deliberately.",
    },
    {
      q: "What is an N+1 query problem?",
      a: "An app loads a list of N parent records then runs one query per child — N+1 total queries. Fix with JOINs, eager loading, or batch `WHERE id IN (...)`. ORMs often hide this until production load exposes latency.",
    },
    {
      q: "How do indexes affect writes?",
      a: "Each index must be updated on INSERT/UPDATE/DELETE, slowing writes and using disk space. Too many indexes on write-heavy tables hurt throughput. Index columns used in WHERE, JOIN, and ORDER BY on large tables selectively.",
    },
    {
      q: "What is a database view?",
      a: "A saved query exposed like a virtual table. Simplifies complex joins for applications and can enforce access patterns. Materialized views store results physically and need refresh strategies for up-to-date data.",
    },
    {
      q: "Explain ACID isolation levels briefly.",
      a: "READ UNCOMMITTED allows dirty reads; READ COMMITTED prevents them (PostgreSQL default). REPEATABLE READ prevents non-repeatable reads; SERIALIZABLE prevents phantom reads with highest isolation cost. Choose based on consistency needs vs concurrency.",
    },
  ],

  react: [
    {
      q: "What causes unnecessary re-renders in React?",
      a: "State updates in parent components re-render all children by default. New object/array/function references passed as props break memoization. Context value changes re-render all consumers. Profile with React DevTools before optimizing.",
    },
    {
      q: "When should you use useReducer instead of useState?",
      a: "When state logic is complex, involves multiple sub-values, or transitions depend on previous state in non-trivial ways. Reducers centralize update logic and are easier to test. Often paired with context for shared state machines.",
    },
    {
      q: "Explain React Strict Mode in development.",
      a: "Strict Mode double-invokes certain lifecycles and effects in development to surface side effects and unsafe patterns. It does not run twice in production. Helps catch missing cleanup and deprecated API usage early.",
    },
    {
      q: "What is lifting state up?",
      a: "Move shared state to the closest common ancestor of components that need it. Pass data down via props and callbacks up for updates. Avoids duplicate sources of truth and keeps sibling components synchronized.",
    },
    {
      q: "How does React 18 batching work?",
      a: "React 18 batches multiple state updates in event handlers, promises, and timeouts into one re-render automatically. Previously, only React event handlers batched in some cases. `flushSync` opts out when immediate DOM reads are required.",
    },
    {
      q: "What are error boundaries?",
      a: "Class components (or libraries) implementing `getDerivedStateFromError` / `componentDidCatch` that catch render errors in child trees. They show fallback UI instead of crashing the whole app. They do not catch event handler or async errors.",
    },
    {
      q: "Server Components vs Client Components (high level)?",
      a: "Server Components render on the server, send minimal JS, and can fetch data directly. Client Components use `'use client'` and support hooks, browser APIs, and interactivity. Compose both — keep interactivity at the leaves.",
    },
    {
      q: "What is the purpose of keys beyond list identity?",
      a: "Keys tell React which list items correspond across renders for efficient reconciliation. Unstable keys (random, index on reorderable lists) cause wrong component state to attach to wrong rows. Use stable IDs from your data model.",
    },
    {
      q: "How do you fetch data in React today?",
      a: "Use `useEffect` + fetch for simple cases, or libraries like TanStack Query for caching, deduplication, background refetch, and stale-while-revalidate. For frameworks like Next.js, prefer server fetching or loaders where available to reduce client waterfalls.",
    },
    {
      q: "What is prop drilling and how do you avoid it?",
      a: "Passing props through many intermediate layers that do not use them. Mitigate with component composition (children), context for truly global data, or colocated state. Do not reach for global state until prop drilling becomes painful and localized fixes fail.",
    },
  ],

  "system-design-basics": [
    {
      q: "What is the CAP theorem?",
      a: "In a distributed system during a network partition, you must choose between Consistency (all nodes see same data) and Availability (every request gets a response). Partition tolerance is assumed in distributed systems. CP systems favor consistency; AP favor availability with eventual consistency.",
    },
    {
      q: "Explain consistent hashing.",
      a: "Maps keys and servers onto a hash ring so adding or removing a server only remaps a fraction of keys. Used in distributed caches and load balancers to minimize reshuffling. Virtual nodes improve load balance when server counts are small.",
    },
    {
      q: "What is a CDN and when use it?",
      a: "A Content Delivery Network caches static assets at edge locations close to users. Reduces latency and origin load for images, JS, CSS, and video. Dynamic HTML/API responses usually bypass CDN or use short TTLs with cache invalidation.",
    },
    {
      q: "SQL vs NoSQL — give a decision example.",
      a: "E-commerce orders with transactions and relations → SQL (PostgreSQL). Real-time analytics on click streams with flexible schema → document or column store. The choice depends on query patterns, consistency needs, and team familiarity — not hype.",
    },
    {
      q: "What is idempotency and why does it matter?",
      a: "Repeating the same request produces the same result — critical for retries on network failures. Payment APIs use idempotency keys so duplicate POSTs do not double-charge. Design mutating endpoints to be idempotent where safe.",
    },
    {
      q: "How would you design a rate limiter?",
      a: "Track request counts per user/IP in Redis with sliding window or token bucket algorithms. Return 429 when exceeded with `Retry-After` header. Place at API gateway or middleware before expensive handlers.",
    },
    {
      q: "What is database sharding?",
      a: "Splitting data horizontally across multiple databases by a shard key (user_id, region). Scales writes beyond single-node limits. Trade-offs: cross-shard queries are hard, rebalancing is complex, and hot shards need monitoring.",
    },
    {
      q: "Explain pub/sub vs message queue.",
      a: "Message queues (point-to-point) deliver each message to one consumer — good for task distribution. Pub/sub broadcasts to all subscribers — good for events and fan-out notifications. Kafka supports both patterns with topics and consumer groups.",
    },
    {
      q: "What is eventual consistency?",
      a: "Replicas converge over time without guaranteeing immediate reads of the latest write. Common in AP systems and caches. Product UX must tolerate stale reads briefly or use read-your-writes strategies for critical paths.",
    },
    {
      q: "How do you approach back-of-envelope storage estimates?",
      a: "Count entities × average row size × retention period. Add indexes (~20–50% overhead) and replicas. Example: 10M users × 2 KB profile ≈ 20 GB raw — plan headroom for growth and backups before choosing storage tier.",
    },
  ],

  "qa-behavioral": [
    {
      q: "How would you test a file upload feature?",
      a: "Test valid types/sizes, empty file, oversized file, wrong MIME type, virus scan hook if applicable, and progress/cancel behavior. Verify storage path, permissions, and that malicious filenames cannot traverse directories. Automate API tests; manual exploratory for UX edge cases.",
    },
    {
      q: "What is regression testing?",
      a: "Re-running tests after changes to ensure existing functionality still works. Automated regression suites in CI catch breaks early. Prioritize tests for critical paths and areas touched by recent commits.",
    },
    {
      q: "How do you decide what not to automate?",
      a: "One-off tests, highly volatile UI, tests costing more maintenance than value, and exploratory sessions stay manual. Automate stable, repetitive checks with clear pass/fail criteria — especially regression on core flows.",
    },
    {
      q: "Describe equivalence partitioning.",
      a: "Divide input into partitions that should behave the same and pick one representative per partition. Example: age field partitions — negative, 0–17, 18–120, above 120. Reduces redundant test cases while maintaining coverage.",
    },
    {
      q: "How do you handle a release with known bugs?",
      a: "Document severity, user impact, and workaround. Align with product and engineering on risk acceptance. Ensure known issues are tracked, monitored, and scheduled for fix — never silent ship on critical paths without stakeholder sign-off.",
    },
    {
      q: "Tell me about a time you improved test coverage.",
      a: "Use STAR: identify gap (untested payment edge case), add integration tests mocking payment provider, measure coverage or defect reduction, and prevent recurrence in CI. Quantify if possible — fewer production incidents or faster releases.",
    },
    {
      q: "What is smoke testing vs sanity testing?",
      a: "Smoke testing is a broad shallow check that the build is testable — main flows start without crash. Sanity testing is a narrow deep check on a specific area after a small change. Both gate further testing effort.",
    },
    {
      q: "How do you test for accessibility?",
      a: "Automated tools (axe, Lighthouse) catch ~30–40% of issues. Manual keyboard navigation, screen reader spot checks, color contrast, focus order, and ARIA labels on custom widgets. Include a11y in definition of done.",
    },
    {
      q: "How would you test an API that requires authentication?",
      a: "Cases: no token, expired token, wrong role, valid token happy path, and revoked session. Use test fixtures or staging credentials never committed to repo. Reset state between tests to avoid order dependence.",
    },
    {
      q: "What makes a good bug report?",
      a: "Clear title, environment, steps to reproduce, expected vs actual, frequency, severity, logs/screenshots, and recent changes if known. A developer should reproduce without asking clarifying questions. Link to monitoring or user reports when available.",
    },
  ],

  typescript: [
    {
      q: "What is the difference between `interface` and `type`?",
      a: "Both describe object shapes. Interfaces support declaration merging and extend cleanly with `extends`. Type aliases can represent unions, intersections, tuples, and primitives. Teams often use interfaces for public object contracts and types for unions/utilities.",
    },
    {
      q: "Explain `unknown` vs `any`.",
      a: "`any` disables type checking — easy but unsafe. `unknown` accepts any value but requires narrowing before use. Prefer `unknown` for external data (API responses) and narrow with typeof, guards, or schema validation.",
    },
    {
      q: "What are generics and why use them?",
      a: "Generics parameterize types: `Array<T>`, `Promise<T>`, `Record<K, V>`. They preserve relationships between inputs and outputs without sacrificing type safety. Constraints (`T extends string`) limit allowed type arguments.",
    },
    {
      q: "What is a discriminated union?",
      a: "A union type sharing a literal discriminator field (`type: 'success' | 'error'`). TypeScript narrows correctly in `switch` or `if` checks. Enables exhaustive handling with `never` in default cases.",
    },
    {
      q: "Explain `strictNullChecks`.",
      a: "When enabled, `null` and `undefined` are not assignable to other types unless explicitly included (`string | null`). Forces handling of missing values at compile time. One of the highest-value strict flags.",
    },
    {
      q: "What are utility types `Pick`, `Omit`, and `Partial`?",
      a: "`Pick<T, K>` selects properties; `Omit<T, K>` excludes them; `Partial<T>` makes all properties optional. Common for API update DTOs, form state, and deriving types from existing models without duplication.",
    },
    {
      q: "How do type guards work?",
      a: "Functions returning `arg is Type` tell TypeScript to narrow types in conditional blocks. Built-in guards use `typeof`, `instanceof`, and `in`. User-defined guards encapsulate validation logic reusable across the codebase.",
    },
    {
      q: "What is `as const`?",
      a: "Assertion that makes literals readonly and narrows to literal types instead of widened `string` or `number`. Useful for tuple types and enum-like objects without runtime enum overhead.",
    },
    {
      q: "How do you type React component props?",
      a: "Define an interface for props; optional props with `?`; children as `React.ReactNode`. Extend HTML attributes with `ComponentPropsWithoutRef<'button'>` when wrapping native elements. Avoid `React.FC` if your team prefers explicit return types.",
    },
    {
      q: "What are declaration files (`.d.ts`)?",
      a: "They describe types for JavaScript libraries without TypeScript source. `@types/*` packages on DefinitelyTyped provide community typings. You can augment modules to add missing exports via `declare module`.",
    },
  ],

  nodejs: [
    {
      q: "Why is Node.js good for I/O-heavy workloads?",
      a: "Non-blocking I/O lets the event loop handle many concurrent connections without thread-per-request overhead. While one request waits on DB or network, others proceed. CPU-bound tasks still block — offload those to workers or separate services.",
    },
    {
      q: "How do you handle uncaught exceptions vs unhandled rejections?",
      a: "Uncaught synchronous exceptions can crash the process — use domain handlers or centralized error middleware sparingly and prefer fixing root cause. Unhandled Promise rejections should be caught with `.catch` or `try/catch` in async handlers; Node may terminate on them depending on version and flags.",
    },
    {
      q: "Explain streams in Node.js.",
      a: "Streams process data chunk-by-chunk (Readable, Writable, Duplex, Transform). Piping large files avoids loading everything into memory. Backpressure handling prevents fast producers from overwhelming slow consumers.",
    },
    {
      q: "What is middleware in Express?",
      a: "Functions with `(req, res, next)` that run in order for matching routes. They parse bodies, authenticate, log, and handle errors. Calling `next(err)` skips to error-handling middleware. Order of registration matters.",
    },
    {
      q: "How do you manage environment configuration?",
      a: "Use environment variables for secrets and environment-specific values — never hardcode. Load from `.env` in development with dotenv; use platform secrets in production. Validate config at startup with a schema (Zod, envalid) to fail fast.",
    },
    {
      q: "What is the cluster module?",
      a: "Forks worker processes sharing server ports to utilize multiple CPU cores. Master distributes connections; workers handle requests independently. For modern apps, container replication often replaces in-process clustering.",
    },
    {
      q: "How do you implement graceful shutdown?",
      a: "On SIGTERM/SIGINT, stop accepting new connections (`server.close()`), finish in-flight requests, close DB pools, then exit. Orchestrators send SIGTERM before kill — rushing exit drops active requests.",
    },
    {
      q: "Explain CommonJS vs ES modules in Node.",
      a: "CommonJS uses `require`/`module.exports` synchronously. ESM uses `import`/`export`, supports top-level await, and enables static analysis. Mixing requires careful interop (`createRequire`, `.mjs` extension, or `\"type\": \"module\"` in package.json).",
    },
    {
      q: "How do you secure a Node.js API?",
      a: "Validate input, use helmet, rate-limit auth routes, parameterize SQL queries, keep dependencies patched, and store secrets outside code. Use HTTPS termination at load balancer or reverse proxy. Never expose stack traces to clients in production.",
    },
    {
      q: "What is the purpose of libuv?",
      a: "libuv is the C library providing Node's event loop, thread pool, and async I/O (filesystem, DNS, some crypto). File operations often use the thread pool because some syscalls block. Understanding libuv explains Node's threading model beyond 'single-threaded JavaScript.'",
    },
  ],
};
