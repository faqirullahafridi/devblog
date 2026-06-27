import { buildPathChapters, introChapter, capstoneChapter } from "./path-factory";

export const nodeDatabasePathChapters = [
  ...buildPathChapters("nodejs-fundamentals", [
    introChapter(
      "nodejs-fundamentals",
      "Node.js",
      "Node.js is a JavaScript runtime built on Chrome's V8 engine. It lets you run JavaScript outside the browser — on servers, CLIs, build tools, and scripts. Node uses a **single-threaded event loop** with non-blocking I/O, so one process can handle thousands of concurrent connections without spawning a thread per request.",
      [
        "Understand CommonJS and ES modules in Node",
        "Read and write files with `fs` and resolve paths with `path`",
        "Use the EventEmitter pattern and Node streams",
        "Manage dependencies with npm and run scripts from `package.json`",
        "Build a small CLI tool as a capstone project",
      ],
      "Install Node.js LTS from [nodejs.org](https://nodejs.org/) or use `nvm install --lts`. Verify with `node --version` and `npm --version`. Create a project folder, run `npm init -y`, and add `\"type\": \"module\"` in `package.json` if you prefer ES modules. Use VS Code with the official Node extension for debugging.",
    ),
    {
      slug: "modules",
      title: "Modules: CommonJS and ES Modules",
      description: "Import and export code with require/module.exports and import/export.",
      level: "beginner",
      minutes: 18,
      content: `## Why modules matter

Node applications grow quickly. **Modules** split code into files with explicit boundaries — each file exports a public API and hides implementation details. Node supports two systems: **CommonJS** (\`require\` / \`module.exports\`) and **ES modules** (\`import\` / \`export\`).

## CommonJS basics

\`\`\`javascript
// math.js
function add(a, b) { return a + b; }
module.exports = { add };

// app.js
const { add } = require("./math");
console.log(add(2, 3));
\`\`\`

\`require\` is synchronous and caches modules — the same file is evaluated once. Node resolves paths relative to the calling file or from \`node_modules\`.

## ES modules

Add \`"type": "module"\` to \`package.json\`, or use \`.mjs\` extensions:

\`\`\`javascript
// math.js
export function add(a, b) { return a + b; }

// app.js
import { add } from "./math.js";
\`\`\`

Note the \`.js\` extension in import paths — required in Node ESM. Use \`import.meta.url\` for file-relative paths when needed.

## Default vs named exports

Named exports are tree-shake friendly and explicit. Default exports suit single-purpose modules:

\`\`\`javascript
export default class Logger { /* ... */ }
import Logger from "./logger.js";
\`\`\`

## Built-in modules

Node ships core modules you import without installing:

\`\`\`javascript
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
\`\`\`

The \`node:\` prefix is recommended — it prevents accidentally loading a malicious npm package with the same name.

## Circular dependencies

Circular imports can leave partially initialized exports. Refactor shared logic into a third module, or pass dependencies as function arguments instead of top-level imports.

## Practice

Split a small utility library into three files: one for string helpers, one for date formatting, and an \`index.js\` that re-exports both. Import from the index in a test script and confirm hot reload behavior with \`node --watch\`.`,
    },
    {
      slug: "fs-path",
      title: "File System and Path APIs",
      description: "Read, write, and navigate the filesystem with fs and path.",
      level: "beginner",
      minutes: 20,
      content: `## Working with files

The \`fs\` module interacts with the filesystem. Modern Node code prefers **promises** over callbacks:

\`\`\`javascript
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
await mkdir(dataDir, { recursive: true });

const filePath = path.join(dataDir, "notes.txt");
await writeFile(filePath, "Hello, Node!", "utf8");
const text = await readFile(filePath, "utf8");
\`\`\`

\`recursive: true\` on \`mkdir\` creates parent directories — essential for CLI tools that write output anywhere.

## Sync vs async

\`readFileSync\` blocks the event loop. Use sync APIs only in CLI startup scripts or one-off migrations. Servers and long-running processes should always use async I/O.

## Path operations

Never concatenate paths with strings — use \`path.join\` and \`path.resolve\`:

\`\`\`javascript
path.join("data", "users", "1.json");     // data/users/1.json
path.resolve("./config", "app.json");     // absolute path from cwd
path.basename("/tmp/report.pdf");         // report.pdf
path.extname("photo.png");                // .png
\`\`\`

\`path.dirname\` and \`path.parse\` help when building file watchers or upload handlers.

## Directory listing

\`\`\`javascript
import { readdir, stat } from "node:fs/promises";

const entries = await readdir(".");
for (const name of entries) {
  const info = await stat(name);
  console.log(name, info.isDirectory() ? "dir" : "file");
}
\`\`\`

For large trees, consider \`fs.promises.opendir\` for streaming directory reads.

## Environment and cwd

\`process.cwd()\` returns the current working directory — not necessarily where your script lives. Use \`import.meta.url\` with \`fileURLToPath\` in ESM to locate files relative to the module:

\`\`\`javascript
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
\`\`\`

## Error handling

Wrap file operations in try/catch. \`ENOENT\` means the file does not exist; \`EACCES\` means permission denied. Return meaningful messages to CLI users instead of raw stack traces.

## Practice

Write a script that reads every \`.md\` file in a folder, counts words, and writes a JSON summary sorted by filename. Use only \`fs/promises\` and \`path\`.`,
    },
    {
      slug: "events",
      title: "Events and EventEmitter",
      description: "Decouple components with Node's event-driven architecture.",
      level: "intermediate",
      minutes: 16,
      content: `## Event-driven design

Many Node APIs are built on **EventEmitter** — objects that emit named events and register listeners. HTTP servers, streams, and process signals all use this pattern. Understanding events helps you compose async logic without callback pyramids.

## Creating an emitter

\`\`\`javascript
import { EventEmitter } from "node:events";

class JobQueue extends EventEmitter {
  enqueue(job) {
    this.emit("job", job);
  }
}

const queue = new JobQueue();
queue.on("job", (job) => console.log("Processing", job.id));
queue.enqueue({ id: 1, type: "email" });
\`\`\`

\`on\` registers a persistent listener; \`once\` fires a single time. \`off\` removes listeners — important to prevent memory leaks in long-running apps.

## Error events

Emitters treat \`error\` specially. An unhandled \`error\` event crashes the process:

\`\`\`javascript
queue.on("error", (err) => {
  console.error("Queue failed:", err.message);
});
\`\`\`

Always attach an \`error\` handler when your emitter can fail.

## Promisified events

Waiting for one event is awkward with callbacks. Node 15+ offers \`events.once\`:

\`\`\`javascript
import { once } from "node:events";

const [req] = await once(server, "request");
\`\`\`

Useful in tests and startup sequences.

## process signals

\`\`\`javascript
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  server.close(() => process.exit(0));
});
\`\`\`

Handle **SIGTERM** in containers so Kubernetes or Docker can stop your app cleanly.

## Custom events in apps

Events decouple producers from consumers — a logger, metrics collector, and webhook dispatcher can all listen to \`order:created\` without the order service knowing about them. Keep payloads small and typed in TypeScript projects.

## Max listeners warning

Node warns when more than 10 listeners attach to one event — often a leak. Increase with \`setMaxListeners\` only when you understand why.

## Practice

Build a \`DownloadTracker\` class that emits \`progress\`, \`complete\`, and \`error\`. Simulate downloads with \`setInterval\` updating percent. Write a CLI that prints a progress bar from \`progress\` events.`,
    },
    {
      slug: "streams",
      title: "Streams and Backpressure",
      description: "Process large data efficiently with readable, writable, and transform streams.",
      level: "intermediate",
      minutes: 22,
      content: `## Why streams

Loading a 2 GB log file into a string will exhaust memory. **Streams** process data in chunks — read a piece, transform it, write it out — keeping memory flat regardless of file size.

Node stream types:

- **Readable** — source (\`fs.createReadStream\`, HTTP request body)
- **Writable** — destination (\`fs.createWriteStream\`, HTTP response)
- **Transform** — modify data in flight (\`zlib.createGzip\`, custom parsers)
- **Duplex** — both directions (TCP sockets)

## Piping files

\`\`\`javascript
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

await pipeline(
  createReadStream("access.log"),
  createGzip(),
  createWriteStream("access.log.gz"),
);
\`\`\`

\`pipeline\` handles errors and destroys streams on failure — prefer it over bare \`.pipe()\`.

## Transform stream example

\`\`\`javascript
import { Transform } from "node:stream";

const upper = new Transform({
  transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  },
});
\`\`\`

Use transforms for CSV parsing, line filtering, or JSON newline-delimited records.

## Backpressure

When a writable stream's buffer fills, \`write()\` returns \`false\`. Pause the readable until \`drain\` fires:

\`\`\`javascript
writable.on("drain", () => readable.resume());
\`\`\`

\`pipeline\` manages backpressure automatically — another reason to use it.

## Async iterables

Readable streams are async iterable in modern Node:

\`\`\`javascript
for await (const chunk of createReadStream("data.jsonl")) {
  const row = JSON.parse(chunk);
  // process row
}
\`\`\`

Convenient for line-by-line processing with \`readline\` or split transforms.

## Common pitfalls

- Forgetting to handle \`error\` on each stream in a manual pipe chain
- Encoding mismatches — specify \`utf8\` when working with text
- Not awaiting \`pipeline\` in async functions, leaving handles open

## Practice

Stream a large CSV through a transform that filters rows where \`status === "active"\`, writing results to a new file. Log bytes processed every second using a \`PassThrough\` counter.`,
    },
    {
      slug: "npm-scripts",
      title: "npm, package.json, and Scripts",
      description: "Manage dependencies, semver, and automation with npm scripts.",
      level: "beginner",
      minutes: 15,
      content: `## package.json essentials

Every Node project centers on \`package.json\` — metadata, dependencies, and scripts:

\`\`\`json
{
  "name": "my-cli",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "node --test"
  },
  "dependencies": {
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
\`\`\`

Run scripts with \`npm run dev\`. \`start\`, \`test\`, and \`stop\` can be invoked without \`run\`.

## Installing packages

\`\`\`bash
npm install express          # production dependency
npm install -D vitest          # dev dependency
npm install -g npm-check-updates  # global CLI
\`\`\`

\`package-lock.json\` pins exact versions — commit it so CI and teammates get identical trees.

## Semver ranges

\`^\` allows minor and patch updates; \`~\` allows patch only. Pin major versions in libraries you publish; apps can be slightly looser but still review changelogs.

## npx and local binaries

\`\`\`bash
npx prettier --write .
\`\`\`

\`npx\` runs packages without global install — great for one-off scaffolding (\`create-vite\`, \`prisma init\`).

## Environment in scripts

Cross-platform env vars use \`cross-env\` or Node 20+ \`--env-file\`:

\`\`\`bash
node --env-file=.env src/server.js
\`\`\`

Never commit \`.env\` — use \`.env.example\` documenting required keys.

## Monorepos (brief)

pnpm workspaces and npm workspaces share dependencies across packages. For solo projects, one \`package.json\` is enough until you split CLI and library code.

## Security

Run \`npm audit\` periodically. Prefer well-maintained packages with millions of weekly downloads. Review what \`postinstall\` scripts execute.

## Practice

Add scripts: \`lint\` (placeholder echo), \`build\` (copy files to \`dist/\`), and \`prestart\` that runs build automatically. Verify \`npm start\` triggers the chain.`,
    },
    capstoneChapter("nodejs-fundamentals", "CLI Notes Manager", [
      "Scaffold a project with `npm init` and ESM enabled. Create `src/commands/` for subcommands: `add`, `list`, `search`, and `export`.",
      "Store notes as JSON files under `~/.notes-cli/` using `fs/promises`. Use `path.join` for cross-platform paths and validate filenames to prevent directory traversal.",
      "Emit events from a `NotesStore` class when notes are added or deleted. Log timestamps with an `EventEmitter` listener.",
      "Implement `export` as a stream: read all note files, transform to newline-delimited JSON, pipe to stdout or a file with `pipeline`.",
      "Wire a `bin` entry in `package.json` and use `npm link` locally. Document usage in a README with example commands.",
    ]),
  ]),

  ...buildPathChapters("express-rest-apis", [
    introChapter(
      "express-rest-apis",
      "Express REST APIs",
      "Express is the most widely used web framework for Node.js. It provides routing, middleware, and HTTP helpers with minimal ceremony — ideal for JSON APIs, BFF layers, and microservices. This path covers production patterns: validation, sessions, structured errors, and a capstone blog API.",
      [
        "Define routes and route parameters with Express Router",
        "Chain middleware for logging, auth, and parsing",
        "Validate request bodies with schema libraries",
        "Manage sessions and cookies securely",
        "Centralize error handling and build a complete REST API",
      ],
      "Create a new folder, run `npm init -y`, and install Express: `npm install express`. Add `\"type\": \"module\"` for ESM. Create `src/app.js` with a hello route and run `node src/app.js`. Use curl or the REST client in VS Code to test endpoints.",
    ),
    {
      slug: "routing",
      title: "Routing and Route Parameters",
      description: "Map HTTP methods and paths to handlers with Express Router.",
      level: "beginner",
      minutes: 18,
      content: `## Basic routes

\`\`\`javascript
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/posts", (req, res) => {
  res.json([{ id: 1, title: "Hello" }]);
});

app.post("/api/posts", (req, res) => {
  const { title } = req.body;
  res.status(201).json({ id: 2, title });
});

app.listen(3000);
\`\`\`

Express matches routes in registration order — put specific paths before parameterized ones.

## Route parameters

\`\`\`javascript
app.get("/api/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  res.json({ id, title: "Sample" });
});
\`\`\`

Use \`req.query\` for filters: \`/api/posts?tag=node&limit=10\`.

## Router modularization

Split routes by resource:

\`\`\`javascript
// routes/posts.js
import { Router } from "express";
export const postsRouter = Router();

postsRouter.get("/", listPosts);
postsRouter.get("/:id", getPost);

// app.js
app.use("/api/posts", postsRouter);
\`\`\`

Mount routers under prefixes to keep \`app.js\` thin.

## HTTP method semantics

| Method | Purpose | Idempotent |
|--------|---------|------------|
| GET | Read | Yes |
| POST | Create | No |
| PUT | Replace | Yes |
| PATCH | Partial update | No |
| DELETE | Remove | Yes |

Return correct status codes: **201** with \`Location\` header on create, **204** on delete without body, **404** when resource missing.

## Route-level middleware

\`\`\`javascript
postsRouter.get("/:id", requireAuth, getPost);
\`\`\`

Handlers run left to right; call \`next()\` to pass control or \`next(err)\` for errors.

## 404 handling

Register a catch-all after all routes:

\`\`\`javascript
app.use((_req, res) => res.status(404).json({ error: "Not found" }));
\`\`\`

## Practice

Build routes for \`/api/users\` and \`/api/users/:id/posts\` using nested routers. Support pagination query params \`page\` and \`limit\` with sensible defaults.`,
    },
    {
      slug: "middleware",
      title: "Middleware Patterns",
      description: "Compose cross-cutting concerns with Express middleware functions.",
      level: "intermediate",
      minutes: 20,
      content: `## What middleware is

Middleware functions have signature \`(req, res, next)\`. They can read/modify \`req\` and \`res\`, end the response, or call \`next()\` to continue the chain. Order matters — body parsers must run before routes that read \`req.body\`.

## Built-in middleware

\`\`\`javascript
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
\`\`\`

Set JSON size limits to prevent denial-of-service via huge payloads.

## Custom logging middleware

\`\`\`javascript
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    console.log(req.method, req.path, res.statusCode, Date.now() - start, "ms");
  });
  next();
}
app.use(requestLogger);
\`\`\`

Log request IDs (from header or UUID) to trace flows across services.

## Authentication middleware

\`\`\`javascript
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
\`\`\`

Attach \`user\` to \`req\` — TypeScript projects extend Express \`Request\` via declaration merging.

## CORS

Browsers block cross-origin requests unless the server sends CORS headers. Use the \`cors\` package or manual middleware for allowed origins — never \`*\` with credentials.

## Rate limiting

Apply rate limiters to public routes before expensive handlers. Return **429** with \`Retry-After\` when limits exceed.

## Error-handling middleware

Four-argument functions \`(err, req, res, next)\` handle errors passed to \`next(err)\`. Register **after** all routes — covered in the error-handling chapter.

## Practice

Create middleware that rejects requests missing \`Content-Type: application/json\` on POST/PATCH. Compose it only on write routes using \`Router.use\`.`,
    },
    {
      slug: "validation",
      title: "Request Validation",
      description: "Validate bodies, params, and queries with schema libraries.",
      level: "intermediate",
      minutes: 18,
      content: `## Trust nothing from the client

Every field in \`req.body\`, \`req.query\`, and \`req.params\` is untrusted. Validation rejects bad input early with **400 Bad Request** before it reaches business logic or the database.

## Zod with Express

\`\`\`javascript
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.flatten() });
    }
    req.validated = result.data;
    next();
  };
}

app.post("/api/posts", validate(createPostSchema), createPost);
\`\`\`

Handlers read \`req.validated\` — never raw \`req.body\`.

## Validating params and query

\`\`\`javascript
const idParam = z.object({ id: z.coerce.number().int().positive() });
const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().max(100).default(20),
});
\`\`\`

\`z.coerce\` converts string query params to numbers safely.

## Consistent error shape

Return the same JSON structure for all validation failures:

\`\`\`json
{ "error": "Validation failed", "details": [{ "path": ["title"], "message": "Required" }] }
\`\`\`

Clients and frontend forms depend on predictable errors.

## Sanitization vs validation

Validation ensures shape and types. **Sanitization** trims strings, normalizes emails, strips HTML — often done inside Zod with \`.transform()\`. Do not rely on client-side validation alone.

## OpenAPI alignment

If you generate OpenAPI docs, keep Zod schemas as the single source of truth using tools like \`zod-to-openapi\` or \`@asteasolutions/zod-to-openapi\`.

## Practice

Add validation for PATCH endpoints where all fields are optional but at least one must be present (\`.refine()\`). Test with invalid payloads using curl and assert 400 responses.`,
    },
    {
      slug: "sessions",
      title: "Sessions and Cookies",
      description: "Store server-side session state with secure cookie settings.",
      level: "intermediate",
      minutes: 20,
      content: `## Stateless JWT vs sessions

**JWTs** embed claims in a signed token — no server lookup, but revocation is hard. **Sessions** store data server-side with only a session ID in an \`HttpOnly\` cookie — easier to invalidate, better for traditional web apps.

## express-session setup

\`\`\`javascript
import session from "express-session";

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));
\`\`\`

\`saveUninitialized: false\` avoids creating sessions for anonymous traffic. \`secure: true\` requires HTTPS in production.

## Session store

The default MemoryStore leaks memory and does not scale. Use **Redis** or PostgreSQL:

\`\`\`javascript
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis }),
  // ... same cookie options
}));
\`\`\`

## Login flow

\`\`\`javascript
app.post("/login", async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.status(204).end());
});
\`\`\`

Regenerate session ID on login to prevent session fixation attacks (\`req.session.regenerate\`).

## CSRF considerations

Cookie-based auth needs CSRF protection for state-changing form posts. SameSite cookies help; API-only JSON clients with custom headers are less vulnerable. Double-submit cookies or CSRF tokens for server-rendered forms.

## Practice

Implement \`GET /me\` returning the logged-in user from \`req.session.userId\`. Protect admin routes with middleware that checks session and role. Test cookie behavior with and without \`credentials: "include"\` in fetch.`,
    },
    {
      slug: "error-handling",
      title: "Error Handling and Logging",
      description: "Centralize errors, map exceptions to HTTP responses, and log safely.",
      level: "intermediate",
      minutes: 18,
      content: `## Async errors in Express

Async route handlers must forward errors to Express:

\`\`\`javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/api/posts/:id", asyncHandler(async (req, res) => {
  const post = await db.findPost(req.params.id);
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
}));
\`\`\`

Without \`.catch(next)\`, rejected promises become unhandled rejections.

## Central error middleware

\`\`\`javascript
app.use((err, req, res, _next) => {
  const status = err.status ?? 500;
  const message = status === 500 ? "Internal server error" : err.message;
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});
\`\`\`

Never leak stack traces to clients in production. Log full details server-side.

## Operational vs programmer errors

**Operational** errors (404, validation, conflict) are expected — send clear messages. **Programmer** errors (null reference, failed assertion) indicate bugs — log loudly, return generic 500.

## Custom error classes

\`\`\`javascript
class NotFoundError extends Error {
  status = 404;
  constructor(resource) {
    super(\`\${resource} not found\`);
  }
}
\`\`\`

Throw \`new NotFoundError("Post")\` in services; the error middleware maps \`.status\`.

## Graceful shutdown

\`\`\`javascript
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
\`\`\`

Stop accepting new connections, finish in-flight requests, then exit.

## Structured logging

Replace \`console.log\` with pino or winston — JSON logs parse well in Datadog, CloudWatch, or Loki. Include \`requestId\`, \`userId\`, and duration.

## Practice

Add an error handler that distinguishes Zod validation errors (400) from duplicate key database errors (409). Write one integration test asserting the JSON error shape.`,
    },
    capstoneChapter("express-rest-apis", "Blog REST API", [
      "Design resources: posts (CRUD), comments (nested under posts), and tags. Use Express Router with versioned prefix `/api/v1`.",
      "Apply Zod validation on all write endpoints. Return consistent `{ error, details }` payloads on failure.",
      "Add session-based admin auth for create/update/delete; public read routes stay open. Store sessions in memory for dev, document Redis for production.",
      "Implement global error middleware, request logging, and a health check at `GET /health`.",
      "Write a `requests.http` file or Postman collection exercising the full API. Include pagination and filtering on `GET /posts`.",
    ]),
  ]),

  ...buildPathChapters("mongodb-nosql", [
    introChapter(
      "mongodb-nosql",
      "MongoDB & NoSQL",
      "MongoDB stores **documents** — JSON-like BSON records — in **collections**. Unlike relational tables with fixed columns, documents in one collection can have flexible shapes, which suits evolving schemas, content platforms, and event logs. You query with a rich API instead of SQL.",
      [
        "Model data as documents and understand `_id` and BSON types",
        "Write find, insert, update, and delete queries",
        "Build aggregation pipelines for analytics",
        "Create indexes for performance",
        "Use Mongoose for schema validation in Node.js",
        "Design a blog database as a capstone project",
      ],
      "Install MongoDB Community locally via Docker: `docker run -d -p 27017:27017 mongo:7`. Install the Node driver: `npm install mongodb`. Connect with MongoDB Compass GUI for exploration. For Atlas, create a free cluster and copy the connection string into `.env`.",
    ),
    {
      slug: "documents",
      title: "Documents and Collections",
      description: "Understand BSON, _id fields, and flexible document modeling.",
      level: "beginner",
      minutes: 16,
      content: `## Document model

A **document** is a set of field-value pairs. Documents group into **collections** (like tables without rigid schemas):

\`\`\`javascript
{
  _id: ObjectId("662a1b2c3d4e5f6789012345"),
  title: "MongoDB Basics",
  author: { name: "Alex", email: "alex@example.com" },
  tags: ["database", "nosql"],
  publishedAt: ISODate("2024-06-01T10:00:00Z"),
  views: 42
}
\`\`\`

\`_id\` is the primary key — MongoDB generates an \`ObjectId\` if omitted. IDs embed a timestamp, useful for rough sorting.

## Embedded vs referenced data

**Embed** related data when it is read together and bounded in size (author snapshot on a post). **Reference** with \`authorId\` when data is shared, updated independently, or unbounded (comments — separate collection with \`postId\`).

Denormalization is normal in MongoDB — duplicate author name on posts for read speed, update with careful batch jobs when names change.

## BSON types

Beyond JSON: \`Decimal128\` for money, \`BinData\` for files, \`Date\` for timestamps. Avoid storing floats for currency.

## Schema flexibility tradeoffs

Flexible schemas speed early development but allow inconsistent documents in production. Enforce shape at the application layer (Mongoose) or with **schema validation** rules on the collection:

\`\`\`javascript
db.createCollection("posts", {
  validator: { $jsonSchema: { required: ["title", "publishedAt"], properties: { title: { bsonType: "string" } } } }
});
\`\`\`

## Insert with the Node driver

\`\`\`javascript
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db("blog");
const result = await db.collection("posts").insertOne({ title: "Hello", views: 0 });
console.log(result.insertedId);
\`\`\`

Always close clients on shutdown in long-running servers; use connection pooling via a single shared client.

## Practice

Model a blog with \`posts\` and \`authors\` collections. Insert three authors and five posts — some with embedded author info, some with \`authorId\` references. Query both styles and note read convenience vs update complexity.`,
    },
    {
      slug: "queries",
      title: "Queries and CRUD Operations",
      description: "Find, filter, sort, and modify documents with the MongoDB query API.",
      level: "beginner",
      minutes: 20,
      content: `## Finding documents

\`\`\`javascript
const posts = db.collection("posts");

await posts.find({ published: true }).sort({ publishedAt: -1 }).limit(10).toArray();

await posts.findOne({ _id: new ObjectId(id) });
\`\`\`

Query operators filter precisely:

\`\`\`javascript
{ views: { $gte: 100 } }
{ tags: { $in: ["node", "mongodb"] } }
{ title: { $regex: /api/i } }
{ $or: [{ status: "draft" }, { authorId: userId }] }
\`\`\`

## Projections

Return only needed fields to save bandwidth:

\`\`\`javascript
posts.find({}, { projection: { title: 1, publishedAt: 1, _id: 0 } });
\`\`\`

## Updates

\`\`\`javascript
await posts.updateOne(
  { _id: id },
  { $set: { title: "Updated" }, $inc: { views: 1 } }
);

await posts.updateMany({ status: "draft" }, { $set: { status: "archived" } });
\`\`\`

Use atomic operators (\`$set\`, \`$inc\`, \`$push\`) — replacing entire documents with \`updateOne(filter, doc)\` overwrites fields you did not intend to touch.

## Upserts and deletes

\`\`\`javascript
await posts.updateOne(filter, update, { upsert: true });
await posts.deleteOne({ _id: id });
await posts.deleteMany({ status: "spam" });
\`\`\`

## Insert many

\`\`\`javascript
await posts.insertMany(docs, { ordered: false });
\`\`\`

\`ordered: false\` continues on duplicate key errors — useful for idempotent imports.

## Pagination

Offset pagination (\`skip\`) slows on large collections. Prefer range queries on \`_id\` or \`publishedAt\`:

\`\`\`javascript
posts.find({ publishedAt: { $lt: cursorDate } }).sort({ publishedAt: -1 }).limit(20);
\`\`\`

## Practice

Implement repository functions: \`listPublishedPosts(page)\`, \`incrementViews(id)\`, and \`searchByTag(tag)\`. Write tests against a disposable \`blog_test\` database.`,
    },
    {
      slug: "aggregation",
      title: "Aggregation Pipelines",
      description: "Transform and analyze documents with multi-stage aggregation.",
      level: "intermediate",
      minutes: 22,
      content: `## When to aggregate

Simple finds handle most CRUD. **Aggregation pipelines** process documents through stages — like Unix pipes — for grouping, joining, reshaping, and analytics.

\`\`\`javascript
const stats = await posts.aggregate([
  { $match: { published: true } },
  { $group: { _id: "$authorId", count: { $sum: 1 }, totalViews: { $sum: "$views" } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
]).toArray();
\`\`\`

## Common stages

| Stage | Purpose |
|-------|---------|
| \`$match\` | Filter (like WHERE) — push early for index use |
| \`$group\` | Aggregate by key |
| \`$project\` | Shape output fields |
| \`$lookup\` | Join another collection |
| \`$unwind\` | Flatten arrays |
| \`$sort\`, \`$limit\`, \`$skip\` | Ordering and pagination |

## $lookup join example

\`\`\`javascript
[
  { $lookup: {
      from: "authors",
      localField: "authorId",
      foreignField: "_id",
      as: "author",
  }},
  { $unwind: "$author" },
  { $project: { title: 1, "author.name": 1 } },
]
\`\`\`

## $facet for multiple reports

\`\`\`javascript
{ $facet: {
    byTag: [{ $unwind: "$tags" }, { $group: { _id: "$tags", n: { $sum: 1 } } }],
    recent: [{ $sort: { publishedAt: -1 } }, { $limit: 5 }],
}}
\`\`\`

One round trip, multiple result sets.

## Performance

\`$match\` and \`$sort\` on indexed fields avoid full collection scans. Use \`explain\` on aggregations in Compass or the shell.

## Practice

Build a pipeline returning monthly post counts for the last year and top five tags by frequency. Export results as JSON for a dashboard endpoint.`,
    },
    {
      slug: "indexes",
      title: "Indexes and Performance",
      description: "Create indexes, read explain plans, and avoid common anti-patterns.",
      level: "intermediate",
      minutes: 18,
      content: `## Why indexes matter

Without indexes, MongoDB scans every document — fine for hundreds, painful for millions. **Indexes** are B-tree structures that speed lookups, sorts, and range queries at the cost of write overhead and disk space.

\`\`\`javascript
await posts.createIndex({ publishedAt: -1 });
await posts.createIndex({ authorId: 1, status: 1 });
await posts.createIndex({ title: "text", body: "text" });
\`\`\`

## Compound indexes

Field order matters. Index \`{ authorId: 1, publishedAt: -1 }\` supports:

- \`find({ authorId })\`
- \`find({ authorId }).sort({ publishedAt: -1 })\`

It does **not** efficiently support \`find({ publishedAt })\` alone — add a separate index if needed.

## Unique and partial indexes

\`\`\`javascript
await users.createIndex({ email: 1 }, { unique: true });
await posts.createIndex({ slug: 1 }, { unique: true, partialFilterExpression: { published: true } });
\`\`\`

Partial indexes index only matching documents — smaller and faster.

## Explain plans

\`\`\`javascript
const plan = await posts.find({ authorId }).explain("executionStats");
console.log(plan.executionStats.totalDocsExamined);
\`\`\`

Goal: examined docs close to returned docs. High examination ratio means a missing or wrong index.

## Anti-patterns

- Unbounded array growth (\`comments\` embedded without limit)
- Case-insensitive regex without index on normalized field
- Sorting on unindexed fields with large skip values
- Storing multi-megabyte documents — GridFS for files

## TTL indexes

Auto-delete expired sessions or logs:

\`\`\`javascript
await sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
\`\`\`

## Practice

Run slow queries from earlier chapters with \`explain\`. Add indexes until \`totalDocsExamined\` drops dramatically. Document which indexes you chose and why in a short comment block.`,
    },
    {
      slug: "mongoose",
      title: "Mongoose ODM",
      description: "Define schemas, models, and middleware with Mongoose in Node.",
      level: "intermediate",
      minutes: 22,
      content: `## Schema and model

Mongoose maps documents to **models** with optional strict schemas:

\`\`\`javascript
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
  tags: [String],
  published: { type: Boolean, default: false },
}, { timestamps: true });

export const Post = mongoose.model("Post", postSchema);
\`\`\`

\`timestamps: true\` adds \`createdAt\` and \`updatedAt\` automatically.

## Queries with Mongoose

\`\`\`javascript
await Post.find({ published: true }).sort("-publishedAt").limit(10).lean();
await Post.findById(id).populate("authorId", "name email");
await Post.create({ title: "New", authorId });
\`\`\`

\`.lean()\` returns plain objects — faster for read-only API responses. Skip it when you need document methods.

## Middleware hooks

\`\`\`javascript
postSchema.pre("save", async function () {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }
});
\`\`\`

Pre/post hooks run around save, remove, and aggregate — useful for slugs, denormalization, and audit logs.

## Validation

Mongoose validates before save. Combine with application-level Zod for HTTP input — Mongoose protects the database layer.

## Connection management

\`\`\`javascript
await mongoose.connect(process.env.MONGODB_URI);
\`\`\`

Reuse one connection per process. Handle \`disconnected\` and \`error\` events in production.

## vs native driver

Use the native driver for maximum control and microservices with simple access patterns. Mongoose shines when schemas, population, and middleware reduce boilerplate in Express apps.

## Practice

Add a \`Comment\` model referencing \`Post\`. Implement virtual \`commentCount\` on posts and populate it in list endpoints. Add a unique index on \`slug\` and handle duplicate errors gracefully.`,
    },
    capstoneChapter("mongodb-nosql", "Blog Database with Mongoose", [
      "Define models: Author, Post, Comment, and Tag with references and indexes on `slug`, `publishedAt`, and `authorId`.",
      "Seed the database with realistic sample data using a `scripts/seed.js` script run via npm.",
      "Implement a data access layer (repository functions) used by Express routes — no direct Mongoose calls in route handlers.",
      "Add aggregation endpoint `GET /api/stats` returning posts per month and top tags.",
      "Document your embedding vs referencing decisions in README with tradeoffs for reads and updates.",
    ]),
  ]),

  ...buildPathChapters("redis-caching", [
    introChapter(
      "redis-caching",
      "Redis & Caching",
      "Redis is an in-memory data store used for caching, session storage, rate limiting, pub/sub messaging, and leaderboards. Sub-millisecond reads make it ideal for reducing database load and speeding API responses. Data can persist to disk, but treat Redis primarily as fast ephemeral storage with TTLs.",
      [
        "Use strings, lists, hashes, and sets",
        "Set TTLs and understand eviction policies",
        "Implement pub/sub for simple messaging",
        "Store sessions and rate-limit counters",
        "Apply cache-aside and other caching patterns",
        "Build a cached API as a capstone project",
      ],
      "Run Redis locally: `docker run -d -p 6379:6379 redis:7`. Install the Node client: `npm install redis`. Verify with `redis-cli ping` returning PONG. Add `REDIS_URL=redis://localhost:6379` to `.env`.",
    ),
    {
      slug: "strings-lists",
      title: "Strings, Hashes, and Lists",
      description: "Store scalars, objects, and queues with core Redis data types.",
      level: "beginner",
      minutes: 18,
      content: `## Connecting from Node

\`\`\`javascript
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
redis.on("error", (err) => console.error("Redis error", err));
await redis.connect();
\`\`\`

Reuse one client per process — connections are lightweight but not free.

## Strings

The simplest type — counters, JSON blobs, feature flags:

\`\`\`javascript
await redis.set("site:maintenance", "false");
await redis.incr("post:42:views");
const value = await redis.get("site:maintenance");
\`\`\`

Store JSON with \`JSON.stringify\` on set and \`JSON.parse\` on get, or use RedisJSON module in managed offerings.

## Hashes

Field-value maps ideal for objects you update partially:

\`\`\`javascript
await redis.hSet("user:1", { name: "Alex", plan: "pro" });
await redis.hIncrBy("user:1", "loginCount", 1);
const plan = await redis.hGet("user:1", "plan");
\`\`\`

Prefer hashes over giant JSON strings when individual fields change often.

## Lists

Doubly linked lists for queues and recent items:

\`\`\`javascript
await redis.lPush("queue:emails", JSON.stringify({ to: "a@b.com" }));
const job = await redis.rPop("queue:emails");
await redis.lTrim("recent:posts", 0, 49);  // keep last 50
\`\`\`

**Lists** are not durable message queues at scale — use BullMQ or a dedicated broker for critical jobs — but they work for simple workloads.

## Sets and sorted sets (preview)

\`\`\`javascript
await redis.sAdd("post:1:tags", "node", "redis");
await redis.zAdd("leaderboard", { score: 100, value: "user:5" });
\`\`\`

Sorted sets power rankings with O(log N) updates.

## Key naming

Use colon namespaces: \`app:entity:id:field\`. Document conventions so teammates do not collide.

## Practice

Implement a view counter using \`INCR\` and a recent-posts list using \`LPUSH\` + \`LTRIM\`. Write a function returning top 10 posts by views using sorted sets.`,
    },
    {
      slug: "ttl-expiry",
      title: "TTL and Key Expiration",
      description: "Set time-to-live on keys and choose eviction policies.",
      level: "beginner",
      minutes: 15,
      content: `## Why TTL matters

Cache without expiry fills memory until Redis evicts unpredictably or crashes under pressure. **TTL** (time to live) ensures stale data disappears and bounds memory for session tokens, OTP codes, and API response caches.

\`\`\`javascript
await redis.set("otp:user:1", "482910", { EX: 300 });  // 5 minutes
await redis.expire("session:abc", 3600);
const ttl = await redis.ttl("session:abc");  // seconds remaining, -1 no expiry
\`\`\`

## EX vs PX

\`EX\` sets seconds; \`PX\` sets milliseconds. Pick based on precision needs — sessions use seconds; rate limit windows might use milliseconds.

## Persist vs cache

Mark keys that must survive restarts differently from disposable cache entries. Document which keys have TTL and which do not — operational surprises happen when \`CONFIG SET maxmemory-policy\` evicts critical data.

## Eviction policies

When \`maxmemory\` is reached, Redis evicts per policy:

- **allkeys-lru** — evict any key, approximate LRU (common for pure cache)
- **volatile-lru** — evict only keys with TTL
- **noeviction** — return errors on write (use when Redis is a primary store)

Set \`maxmemory\` and policy in \`redis.conf\` or cloud console.

## Lazy vs active expiration

Redis expires keys lazily on access and actively in background cycles. Rarely accessed keys may linger briefly past TTL — do not rely on instant deletion for security-critical tokens without checking TTL on read.

## Cache stampede mitigation

When hot keys expire, many requests may hit the database simultaneously. Mitigate with jittered TTLs, single-flight locking (\`SET key lock NX EX 10\`), or stale-while-revalidate patterns.

## Practice

Cache API responses with \`SET cache:posts:list EX 60\`. On read, if missing, rebuild from DB and set with random TTL between 55–65 seconds to spread expirations.`,
    },
    {
      slug: "pub-sub",
      title: "Pub/Sub Messaging",
      description: "Broadcast events with Redis publish and subscribe channels.",
      level: "intermediate",
      minutes: 16,
      content: `## Fire-and-forget messaging

Redis **pub/sub** delivers messages to subscribers with no persistence — if nobody listens, messages vanish. Perfect for live notifications, cache invalidation broadcasts, and dev tooling — not for guaranteed delivery.

\`\`\`javascript
const subscriber = redis.duplicate();
await subscriber.connect();

await subscriber.subscribe("post:published", (message) => {
  const post = JSON.parse(message);
  invalidateCache(\`post:\${post.id}\`);
});

await redis.publish("post:published", JSON.stringify({ id: 42, title: "Hello" }));
\`\`\`

Subscribers need a **duplicate connection** — a client in subscribe mode cannot run regular commands.

## Pattern subscribe

\`\`\`javascript
await subscriber.pSubscribe("cache:*", (message, channel) => {
  console.log(channel, message);
});
\`\`\`

Use namespaced channels: \`cache:posts\`, \`cache:users\`.

## Limitations

- No message history for late subscribers
- At-most-once delivery — subscribers can miss messages while disconnected
- No acknowledgment workflow

For durable queues use **Redis Streams** (\`XADD\`, \`XREADGROUP\`) or RabbitMQ, SQS, Kafka.

## Scaling pub/sub

Every message fan-outs to all subscribers on the node. High fan-out across regions adds latency — consider regional Redis or edge pub/sub for global apps.

## Invalidation pattern

On write, publish \`cache:invalidate:post:42\`. All API instances subscribe and delete local or Redis cache keys — keeps multi-instance deployments consistent.

## Practice

Build a tiny chat demo: HTTP POST publishes messages; SSE or WebSocket endpoint forwards subscribed messages to browsers. Accept that messages are ephemeral.`,
    },
    {
      slug: "sessions",
      title: "Session Storage in Redis",
      description: "Store Express sessions and rate-limit state in Redis.",
      level: "intermediate",
      minutes: 18,
      content: `## Sessions at scale

In-memory session stores break with multiple server instances — users bounce between nodes and lose auth. **Redis** centralizes session data with fast reads/writes.

\`\`\`javascript
import session from "express-session";
import RedisStore from "connect-redis";

app.use(session({
  store: new RedisStore({ client: redis, prefix: "sess:" }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000, httpOnly: true, secure: true, sameSite: "lax" },
}));
\`\`\`

Session keys become \`sess:<sessionId>\` in Redis with TTL matching cookie \`maxAge\`.

## Rate limiting with Redis

\`\`\`javascript
async function rateLimit(ip, limit = 100, windowSec = 60) {
  const key = \`rl:\${ip}:\${Math.floor(Date.now() / 1000 / windowSec)}\`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);
  return count <= limit;
}
\`\`\`

Fixed-window counters are simple; sliding windows need sorted sets or dedicated libraries (\`rate-limiter-flexible\`).

## Distributed locks (brief)

\`\`\`javascript
const ok = await redis.set("lock:import", "1", { NX: true, EX: 30 });
if (ok) { /* run job */ await redis.del("lock:import"); }
\`\`\`

Redlock algorithm handles edge cases in multi-master setups — use sparingly.

## Serialization

Sessions serialize as JSON. Keep payloads small — store \`userId\` and role, not entire user objects. Fetch fresh user data from DB when needed.

## High availability

Use Redis Sentinel or managed Redis with failover. Session loss during failover may log users out — acceptable for many apps; JWT access tokens can complement short sessions.

## Practice

Wire Redis sessions into the Express blog API from the previous path. Verify login persists across server restarts and works with two instances behind a load balancer (simulate with different ports).`,
    },
    {
      slug: "cache-patterns",
      title: "Caching Patterns",
      description: "Apply cache-aside, write-through, and invalidation strategies.",
      level: "advanced",
      minutes: 22,
      content: `## Cache-aside (lazy loading)

The application manages cache:

\`\`\`javascript
async function getPost(id) {
  const cacheKey = \`post:\${id}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const post = await db.findPost(id);
  if (post) await redis.set(cacheKey, JSON.stringify(post), { EX: 300 });
  return post;
}
\`\`\`

Pros: cache only what is read; resilient if Redis fails (fallback to DB). Cons: first read misses; stale data until TTL expires.

## Write-through and write-behind

**Write-through** updates cache and DB synchronously — consistent but slower writes. **Write-behind** queues DB writes — faster but risk data loss on crash. Most web apps stick with cache-aside plus explicit invalidation on writes.

## Invalidation on update

\`\`\`javascript
async function updatePost(id, data) {
  const post = await db.updatePost(id, data);
  await redis.del(\`post:\${id}\`, "posts:list");
  await redis.publish("cache:invalidate", \`post:\${id}\`);
  return post;
}
\`\`\`

Delete related list caches when single items change — hardest part of caching.

## What to cache

- Expensive aggregations and reports
- Read-heavy reference data (categories, config)
- Rendered HTML fragments or GraphQL responses

Avoid caching personalized data under shared keys unless keyed by user ID.

## HTTP caching layer

Redis complements CDN and \`Cache-Control\` headers — use Redis for dynamic API aggregation, CDN for static assets.

## Monitoring

Track hit rate, memory usage, evicted keys, and slow commands (\`LATENCY DOCTOR\`). Alert when hit rate drops after deploys — often a key prefix change.

## Practice

Add cache-aside to \`GET /posts/:id\` and \`GET /posts\` with different TTLs. Measure response times with and without cache using \`autocannon\`. Document invalidation rules in code comments.`,
    },
    capstoneChapter("redis-caching", "Cached Blog API", [
      "Extend the blog API with Redis cache-aside on post detail and list endpoints. Use structured key names and TTLs with jitter.",
      "Store admin sessions in Redis via connect-redis. Add rate limiting on POST /login (5 attempts per minute per IP).",
      "Publish cache invalidation messages on post create/update/delete; subscribers on each instance clear local caches if you add in-memory layers.",
      "Expose `GET /admin/cache-stats` returning hit/miss counters you track in middleware (protected route).",
      "Load test with 100 concurrent readers — compare p95 latency before and after caching. Write results in README.",
    ]),
  ]),

  ...buildPathChapters("prisma-orm", [
    introChapter(
      "prisma-orm",
      "Prisma ORM",
      "Prisma is a modern ORM for Node.js and TypeScript. You declare models in a **schema file**, generate a type-safe **Prisma Client**, and run **migrations** against PostgreSQL, MySQL, SQLite, and others. Prisma prioritizes developer experience — autocomplete, relation APIs, and clear errors — over raw SQL flexibility.",
      [
        "Define models and relations in schema.prisma",
        "Create and apply migrations",
        "Perform CRUD with Prisma Client",
        "Model one-to-many and many-to-many relations",
        "Use transactions and middleware",
        "Build a blog schema as a capstone project",
      ],
      "Initialize with `npm install prisma @prisma/client` and `npx prisma init`. Set `DATABASE_URL` in `.env` pointing to PostgreSQL or SQLite (`file:./dev.db`). Run `npx prisma migrate dev --name init` after editing the schema. Use Prisma Studio (`npx prisma studio`) to browse data.",
    ),
    {
      slug: "schema",
      title: "Prisma Schema Language",
      description: "Define models, fields, relations, and enums in schema.prisma.",
      level: "beginner",
      minutes: 20,
      content: `## schema.prisma structure

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id          Int      @id @default(autoincrement())
  title       String
  slug        String   @unique
  body        String
  published   Boolean  @default(false)
  authorId    Int
  author      User     @relation(fields: [authorId], references: [id])
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
\`\`\`

## Field types and attributes

Common types: \`String\`, \`Int\`, \`Boolean\`, \`DateTime\`, \`Json\`, \`Decimal\`. Attributes:

- \`@id\`, \`@default(autoincrement())\`, \`@default(uuid())\`
- \`@unique\`, \`@map("column_name")\` for legacy DB columns
- \`@@index([authorId, published])\` for compound indexes

## Relations

Foreign keys are explicit on the "many" side:

\`\`\`prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
\`\`\`

Many-to-many implicit: Prisma creates join table automatically. Explicit join models add payload fields (\`assignedAt\` on \`PostTag\`).

## Enums

\`\`\`prisma
enum Role { USER ADMIN }
model User { role Role @default(USER) }
\`\`\`

## Formatting and validation

Run \`npx prisma format\` after edits. Prisma validates relations at generate time — mismatched sides fail fast.

## Practice

Extend the schema with \`Comment\` (post relation, author name, body) and \`Category\`. Add \`@@index\` on fields you will filter by. Run \`prisma validate\` before migrating.`,
    },
    {
      slug: "migrations",
      title: "Migrations and Seeding",
      description: "Evolve schema safely with Prisma Migrate and seed scripts.",
      level: "intermediate",
      minutes: 18,
      content: `## Development workflow

After schema changes:

\`\`\`bash
npx prisma migrate dev --name add_comments
\`\`\`

Prisma creates SQL in \`prisma/migrations/\`, applies it, and regenerates the client. Commit migration folders to git — they are the source of truth for team and CI.

## Production deploys

\`\`\`bash
npx prisma migrate deploy
\`\`\`

Runs pending migrations without prompts — use in CI/CD before starting new app versions. Never edit applied migration SQL manually unless recovering from incidents.

## Drift detection

\`prisma migrate diff\` compares schema to database — useful when debugging environments that diverged.

## Seeding

\`\`\`javascript
// prisma/seed.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.user.upsert({
  where: { email: "admin@example.com" },
  update: {},
  create: { email: "admin@example.com", posts: { create: [{ title: "Welcome", slug: "welcome", body: "..." }] } },
});
\`\`\`

Register in \`package.json\`: \`"prisma": { "seed": "node prisma/seed.js" }\`. Run \`npx prisma db seed\`.

## Reset locally

\`npx prisma migrate reset\` drops data, reapplies migrations, runs seed — destructive, dev only.

## Baseline existing databases

\`prisma db pull\` introspects legacy databases into schema — start ORM adoption without rewriting from scratch.

## Practice

Add a migration adding \`viewCount Int @default(0)\` to Post. Write seed data for 20 posts across 3 users. Verify with Prisma Studio.`,
    },
    {
      slug: "crud",
      title: "CRUD with Prisma Client",
      description: "Create, read, update, and delete records with type-safe queries.",
      level: "beginner",
      minutes: 20,
      content: `## Client setup

\`\`\`javascript
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
\`\`\`

In development, attach the client to \`globalThis\` to survive hot reload without exhausting connections.

## Create

\`\`\`javascript
const post = await prisma.post.create({
  data: {
    title: "Hello",
    slug: "hello",
    body: "Content",
    author: { connect: { id: 1 } },
    tags: { connectOrCreate: [{ where: { name: "node" }, create: { name: "node" } }] },
  },
});
\`\`\`

Nested writes create related records in one transaction.

## Read

\`\`\`javascript
await prisma.post.findMany({
  where: { published: true },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 0,
  include: { author: true, tags: true },
});

await prisma.post.findUnique({ where: { slug: "hello" } });
\`\`\`

Prefer \`findUnique\` with unique fields; \`findFirst\` for compound filters.

## Update and delete

\`\`\`javascript
await prisma.post.update({ where: { id: 1 }, data: { published: true } });
await prisma.post.updateMany({ where: { published: false }, data: { published: true } });
await prisma.post.delete({ where: { id: 1 } });
\`\`\`

## Filtering

\`\`\`javascript
where: {
  OR: [{ title: { contains: "api" } }, { body: { contains: "api" } }],
  tags: { some: { name: "node" } },
  createdAt: { gte: new Date("2024-01-01") },
}
\`\`\`

## Raw SQL escape hatch

\`\`\`javascript
await prisma.$queryRaw\`SELECT COUNT(*) FROM "Post" WHERE published = true\`;
\`\`\`

Use when Prisma's query API cannot express the SQL you need.

## Practice

Implement service functions: \`createPost\`, \`listPublishedPosts\`, \`publishPost(id)\`, \`deletePost(id)\`. Handle \`P2025\` (record not found) with friendly errors.`,
    },
    {
      slug: "relations",
      title: "Relations and Nested Queries",
      description: "Navigate relations with include, select, and connect APIs.",
      level: "intermediate",
      minutes: 20,
      content: `## include vs select

\`include\` adds relations to the default field set. \`select\` picks specific scalars — mutually exclusive at top level:

\`\`\`javascript
await prisma.post.findMany({
  select: {
    title: true,
    author: { select: { email: true } },
    _count: { select: { comments: true } },
  },
});
\`\`\`

Use \`select\` in public APIs to avoid leaking internal columns.

## Filtering on relations

\`\`\`javascript
await prisma.user.findMany({
  where: { posts: { some: { published: true } } },
});
\`\`\`

Find users with at least one published post — Prisma generates efficient JOINs.

## Connect, disconnect, set

\`\`\`javascript
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: { set: [{ id: 1 }, { id: 2 }] },
    author: { connect: { id: 3 } },
  },
});
\`\`\`

\`set\` replaces many-to-many links; \`disconnect\` removes associations without deleting tags.

## Cascading deletes

Configure \`onDelete: Cascade\` on relations in schema so deleting a post removes comments — or \`Restrict\` to prevent accidental deletes.

## Transactions

\`\`\`javascript
await prisma.$transaction(async (tx) => {
  const post = await tx.post.create({ data: { /* ... */ } });
  await tx.auditLog.create({ data: { action: "post.create", postId: post.id } });
});
\`\`\`

Interactive transactions retry on conflict — essential for multi-step writes.

## N+1 problem

Fetching posts then authors in a loop causes N+1 queries. Use \`include\` or batch with \`findMany({ where: { id: { in: ids } } })\`.

## Practice

Build \`GET /posts/:slug\` returning post, author, tags, and last five comments in one query. Measure query count with Prisma query logging enabled.`,
    },
    {
      slug: "prisma-client",
      title: "Prisma Client Advanced Usage",
      description: "Middleware, extensions, logging, and connection management.",
      level: "advanced",
      minutes: 18,
      content: `## Logging and debugging

\`\`\`javascript
const prisma = new PrismaClient({
  log: [{ emit: "event", level: "query" }],
});
prisma.$on("query", (e) => console.log(e.query, e.duration + "ms"));
\`\`\`

Enable query logs temporarily in staging — disable verbose logging in production.

## Client extensions (Prisma 4.16+)

\`\`\`javascript
const prisma = new PrismaClient().$extends({
  result: {
    post: {
      excerpt: {
        needs: { body: true },
        compute(p) { return p.body.slice(0, 160); },
      },
    },
  },
});
\`\`\`

Extensions add computed fields, query caching, or soft-delete behavior without wrapper classes.

## Middleware (legacy pattern)

Pre-extensions \`prisma.$use\` intercepted queries — migrate to extensions for new code.

## Connection pooling

Serverless functions exhaust connections quickly. Use **Prisma Accelerate**, **PgBouncer**, or Neon's pooler with \`?pgbouncer=true\` in the connection string. Set appropriate \`connection_limit\`.

## Graceful shutdown

\`\`\`javascript
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
\`\`\`

## Error codes

Handle \`P2002\` unique violations, \`P2025\` not found, \`P2003\` foreign key failures — map to HTTP 409, 404, 400 in APIs.

## Testing

Use separate test database, \`prisma migrate deploy\` in CI, and transactional rollback patterns or \`truncate\` between tests.

## Practice

Add a client extension that soft-deletes posts (\`deletedAt\` field) by filtering \`findMany\` automatically. Write one test verifying deleted posts are hidden from lists.`,
    },
    capstoneChapter("prisma-orm", "Blog Schema with Prisma", [
      "Complete schema: User, Post, Comment, Tag, Category with relations, indexes, and cascades documented.",
      "Migrations and seed script with realistic content; `npm run db:seed` for teammates.",
      "Express (or Fastify) routes using a service layer — all DB access through Prisma Client.",
      "Add full-text search via `contains` filters or raw SQL; paginate with cursor-based `take`/`skip` or `cursor`.",
      "Deploy migration with `prisma migrate deploy` in a Dockerfile or CI step; document environment variables.",
    ]),
  ]),

  ...buildPathChapters("drizzle-postgres", [
    introChapter(
      "drizzle-postgres",
      "Drizzle & PostgreSQL",
      "Drizzle ORM is a **SQL-first** TypeScript ORM — schemas are TypeScript tables, queries compile to SQL you can inspect, and migrations are generated from schema diffs. It pairs naturally with PostgreSQL for teams who want type safety without hiding SQL semantics.",
      [
        "Define tables and columns in TypeScript",
        "Write type-safe selects, inserts, and joins",
        "Model relations with Drizzle relations API",
        "Generate and run migrations with drizzle-kit",
        "Integrate Drizzle with Express and connection pools",
        "Build a capstone API on PostgreSQL",
      ],
      "Install: `npm install drizzle-orm postgres` and dev dependency `drizzle-kit`. Add PostgreSQL via Docker or Neon. Create `drizzle.config.ts` pointing at your schema and `DATABASE_URL`. Run `npx drizzle-kit push` for quick dev sync or `generate` + `migrate` for versioned migrations.",
    ),
    {
      slug: "schema-ts",
      title: "Schema in TypeScript",
      description: "Define PostgreSQL tables with Drizzle column builders.",
      level: "beginner",
      minutes: 20,
      content: `## Table definitions

\`\`\`typescript
import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: text("body").notNull(),
  published: boolean("published").default(false).notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
\`\`\`

## Infer types

\`\`\`typescript
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
export type User = InferSelectModel<typeof users>;
export type NewPost = InferInsertModel<typeof posts>;
\`\`\`

Application code uses inferred types — no duplicate interfaces.

## Indexes and constraints

\`\`\`typescript
import { index, uniqueIndex } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", { /* columns */ }, (t) => [
  index("posts_author_idx").on(t.authorId),
  uniqueIndex("posts_slug_idx").on(t.slug),
]);
\`\`\`

## Enums and JSON

\`\`\`typescript
import { pgEnum, jsonb } from "drizzle-orm/pg-core";
export const roleEnum = pgEnum("role", ["user", "admin"]);
\`\`\`

JSONB columns store metadata with \`jsonb("meta").$type<{ views: number }>()\`.

## Schema organization

Split \`schema/users.ts\`, \`schema/posts.ts\`, re-export from \`schema/index.ts\`. Keep migrations generated from a single entry point.

## Practice

Add \`comments\` and \`tags\` tables with a \`post_tags\` join table. Export all tables from \`schema/index.ts\` and run \`drizzle-kit generate\`.`,
    },
    {
      slug: "queries",
      title: "Queries and Filters",
      description: "Select, insert, update, and delete with Drizzle's SQL-like API.",
      level: "beginner",
      minutes: 20,
      content: `## Database connection

\`\`\`typescript
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
\`\`\`

Use \`pg\` driver with \`drizzle-orm/node-postgres\` if you prefer \`node-pg\` pools.

## Select

\`\`\`typescript
import { eq, desc, and, ilike } from "drizzle-orm";

const rows = await db
  .select()
  .from(posts)
  .where(and(eq(posts.published, true), ilike(posts.title, "%api%")))
  .orderBy(desc(posts.createdAt))
  .limit(10);
\`\`\`

## Insert returning

\`\`\`typescript
const [created] = await db
  .insert(posts)
  .values({ title: "Hi", slug: "hi", body: "...", authorId: 1 })
  .returning();
\`\`\`

PostgreSQL \`RETURNING\` eliminates extra SELECT round trips.

## Update and delete

\`\`\`typescript
await db.update(posts).set({ published: true }).where(eq(posts.id, 1));
await db.delete(posts).where(eq(posts.id, 1));
\`\`\`

Always scope \`where\` — Drizzle will not stop you from deleting every row.

## Prepared statements

\`\`\`typescript
const prepared = db.query.posts.findMany({
  where: ((p, { eq }) => eq(p.authorId, placeholder("authorId"))),
}).prepare("posts_by_author");
await prepared.execute({ authorId: 1 });
\`\`\`

Prepared queries improve repeated execution performance.

## SQL transparency

\`\`\`typescript
import { sql } from "drizzle-orm";
await db.execute(sql\`SELECT COUNT(*) FROM posts WHERE published = true\`);
\`\`\`

Drop to raw SQL when needed — Drizzle does not trap you.

## Practice

Write repository functions with typed return values. Add search by title using \`ilike\`. Log generated SQL with \`logger: true\` in drizzle config during development.`,
    },
    {
      slug: "relations",
      title: "Relations and Relational Queries",
      description: "Configure relations and use relational query API for nested reads.",
      level: "intermediate",
      minutes: 20,
      content: `## Declaring relations

\`\`\`typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  comments: many(comments),
}));
\`\`\`

Relations enable \`db.query\` API — they do not create foreign keys alone; \`.references()\` on columns does.

## Relational queries

\`\`\`typescript
const result = await db.query.posts.findMany({
  where: eq(posts.published, true),
  with: {
    author: { columns: { name: true, email: true } },
    comments: { limit: 5, orderBy: desc(comments.createdAt) },
  },
  limit: 10,
});
\`\`\`

Drizzle generates JOINs or batch queries — inspect SQL to understand behavior.

## Manual joins

\`\`\`typescript
await db
  .select({ postTitle: posts.title, authorName: users.name })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id));
\`\`\`

Explicit joins when you need custom projections or aggregations.

## Many-to-many

\`\`\`typescript
export const postTags = pgTable("post_tags", {
  postId: integer("post_id").references(() => posts.id),
  tagId: integer("tag_id").references(() => tags.id),
});
\`\`\`

Query through join table or configure \`many\` relations with \`relationName\`.

## Transactions

\`\`\`typescript
await db.transaction(async (tx) => {
  const [post] = await tx.insert(posts).values({ /* ... */ }).returning();
  await tx.insert(comments).values({ postId: post.id, body: "First!" });
});
\`\`\`

## Practice

Implement \`getPostBySlug\` returning post, author, tags, and comment count using relational queries. Compare SQL output to hand-written JOIN version.`,
    },
    {
      slug: "migrations",
      title: "Migrations with drizzle-kit",
      description: "Generate SQL migrations and sync schema changes safely.",
      level: "intermediate",
      minutes: 18,
      content: `## drizzle.config.ts

\`\`\`typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
\`\`\`

## Generate migrations

\`\`\`bash
npx drizzle-kit generate
npx drizzle-kit migrate
\`\`\`

Generated SQL lands in \`drizzle/\` with metadata journal — commit to version control.

## Push vs migrate

\`drizzle-kit push\` applies schema diff directly — fast for local dev, risky for production. Use \`migrate\` in staging and production with reviewed SQL files.

## Introspect existing DB

\`drizzle-kit pull\` imports existing PostgreSQL schema into TypeScript — bootstrap brownfield projects.

## Seed scripts

Run TypeScript seeds with \`tsx scripts/seed.ts\` inserting via Drizzle \`db.insert\`. Keep seeds idempotent with \`onConflictDoNothing\`.

## CI pipeline

\`\`\`bash
npx drizzle-kit migrate
npm test
\`\`\`

Run migrations before integration tests against ephemeral Postgres containers.

## Rollbacks

Drizzle does not auto-generate down migrations — write manual down SQL for critical releases or restore from backups.

## Practice

Add a migration introducing \`view_count integer default 0\`. Review generated SQL before applying. Break intentionally in dev and fix with a follow-up migration.`,
    },
    {
      slug: "with-node",
      title: "Drizzle with Node and Express",
      description: "Wire connection pools, graceful shutdown, and repository pattern.",
      level: "intermediate",
      minutes: 18,
      content: `## Connection pooling

\`\`\`typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20 });
export const db = drizzle(pool, { schema });
\`\`\`

Tune \`max\` to PostgreSQL \`max_connections\` divided by app instances.

## Repository layer

Route handlers should not import \`db\` directly everywhere — encapsulate in repositories:

\`\`\`typescript
export async function listPublishedPosts(limit: number) {
  return db.query.posts.findMany({
    where: eq(posts.published, true),
    limit,
    orderBy: desc(posts.createdAt),
  });
}
\`\`\`

Swap implementations for tests with in-memory SQLite (\`drizzle-orm/better-sqlite3\`) if needed.

## Express integration

\`\`\`javascript
app.get("/api/posts", async (req, res, next) => {
  try {
    const data = await listPublishedPosts(20);
    res.json(data);
  } catch (err) {
    next(err);
  }
});
\`\`\`

Map Postgres error codes — \`23505\` unique violation to HTTP 409.

## Health checks

\`\`\`typescript
app.get("/health", async (_req, res) => {
  await db.execute(sql\`SELECT 1\`);
  res.json({ ok: true });
});
\`\`\`

## Graceful shutdown

\`\`\`typescript
process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
\`\`\`

## Environment validation

Validate \`DATABASE_URL\` at startup with Zod — fail fast instead of cryptic connection errors on first request.

## Practice

Mount Drizzle repositories on Express routes from the Prisma/Express capstone. Compare boilerplate and SQL visibility between ORMs in a short notes file.`,
    },
    capstoneChapter("drizzle-postgres", "PostgreSQL Blog API", [
      "Full Drizzle schema on PostgreSQL with migrations committed to git and documented ERD in README.",
      "Repository layer covering posts, comments, tags, and search with pagination via cursor (`createdAt`, `id`).",
      "Express API matching REST conventions from earlier paths; map DB errors to HTTP status codes.",
      "Integration tests against Docker Postgres — migrate before tests, truncate tables between cases.",
      "Optional: compare query plans with `EXPLAIN ANALYZE` for list endpoint before/after adding indexes.",
    ]),
  ]),
];
