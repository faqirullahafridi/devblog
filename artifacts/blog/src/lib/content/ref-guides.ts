export const REF_GUIDES: Record<string, string> = {
  git: `## Overview

Git is a distributed version control system that tracks changes to source code over time. Every developer on a team gets a full copy of the project history, so you can branch, experiment, and merge without a central server bottleneck. Git matters because it is the backbone of modern software collaboration: pull requests, code review, CI/CD pipelines, and rollbacks all depend on a clear commit history.

If you are new to Git, think of it as a time machine for your files. You **commit** snapshots, **branch** to try ideas safely, and **merge** when work is ready. The commands below cover daily workflow from first clone through conflict resolution.

## Essential commands

| Command | Purpose |
|---------|---------|
| \`git init\` | Create a new repository in the current folder |
| \`git clone <url>\` | Copy a remote repository locally |
| \`git status\` | Show changed, staged, and untracked files |
| \`git add <file>\` | Stage changes for the next commit |
| \`git commit -m "msg"\` | Save a snapshot with a descriptive message |
| \`git push\` | Upload commits to the remote |
| \`git pull\` | Fetch and merge remote changes |

### First-time setup

\`\`\`bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git clone https://github.com/org/project.git
cd project
\`\`\`

## Daily workflow

The most common loop is **edit → stage → commit → push**. Run \`git status\` often so you always know what will go into the next commit.

\`\`\`bash
# See what changed
git status
git diff

# Stage specific files or everything
git add src/app.ts
git add .

# Commit with a clear message (imperative mood: "Add", "Fix", not "Added")
git commit -m "Fix login redirect when session expires"

# Sync with remote
git pull --rebase origin main
git push origin main
\`\`\`

Good commit messages explain **why**, not just **what**. Future you (and your reviewers) will thank you.

## Branches and merging

Branches let you work on features without touching \`main\`. Create a branch, commit there, open a pull request, then merge when tests pass.

\`\`\`bash
git checkout -b feature/newsletter-signup
# ... work and commit ...
git push -u origin feature/newsletter-signup

# After merge, update local main
git checkout main
git pull origin main
git branch -d feature/newsletter-signup
\`\`\`

| Strategy | When to use |
|----------|-------------|
| **Merge commit** | Preserves branch history; good for long-lived branches |
| **Rebase** | Linear history; rebase feature onto \`main\` before merge |
| **Squash merge** | One commit per PR; keeps \`main\` tidy |

## Undo and recovery

Git rarely deletes work permanently if you committed it. These commands fix common mistakes:

\`\`\`bash
# Unstage a file (keep edits)
git restore --staged app.ts

# Discard unstaged changes in a file
git restore app.ts

# Amend the last commit message or add forgotten files
git commit --amend

# Undo last commit but keep changes staged
git reset --soft HEAD~1

# See history
git log --oneline --graph -20
\`\`\`

**Never** rewrite history (\`git push --force\`) on shared branches like \`main\` unless your team explicitly allows it.

## Remote and collaboration

\`\`\`bash
git remote -v
git fetch origin
git merge origin/main
# or: git pull = fetch + merge
\`\`\`

When two people edit the same lines, Git marks **conflicts**. Open the file, resolve markers (\`<<<<<<<\`, \`=======\`, \`>>>>>>>\`), then \`git add\` and \`git commit\`.

## Common mistakes

- **Committing secrets** — API keys in \`.env\` should stay gitignored. Use [env secrets lesson](/learn/devops-git/env-secrets).
- **Huge commits** — One logical change per commit makes review and bisect easier.
- **Vague messages** — \`fix stuff\` is useless in \`git log\`.
- **Forgetting to pull** — Push rejected? \`git pull --rebase\` first, resolve conflicts, then push.
- **Committing \`node_modules\`** — Add a proper \`.gitignore\` before the first commit.

## Tips

- Use \`git stash\` to shelve work when you need to switch branches quickly.
- \`git bisect\` finds which commit introduced a bug by binary search.
- Pair Git with the [Text Diff tool](/tools/text-diff) when reviewing changes locally.

## Related

- [Learn: Git intro](/learn/devops-git/git-intro)
- [Learn: Daily workflow](/learn/devops-git/daily-workflow)
- [Learn: Branches & merging](/learn/devops-git/branches-merging)
- [Learn: Undo & fixes](/learn/devops-git/undo-fixes)
- [Text Diff tool](/tools/text-diff)`,

  "http-status-codes": `## Overview

HTTP status codes are three-digit numbers returned by servers to tell clients whether a request succeeded, failed, or needs follow-up action. They are part of every REST API, web page load, and form submission. Understanding status codes helps you build correct APIs, debug network issues, and write resilient client code that handles errors gracefully instead of assuming every response is \`200 OK\`.

Status codes group into classes: **1xx** informational, **2xx** success, **3xx** redirection, **4xx** client error, **5xx** server error. The first digit tells you the category; the last two digits refine the meaning.

## Success responses (2xx)

| Code | Name | Meaning |
|------|------|---------|
| **200** | OK | Request succeeded; response body usually contains data |
| **201** | Created | Resource created (often after POST) |
| **204** | No Content | Success with no body (common for DELETE) |

\`\`\`http
HTTP/1.1 201 Created
Location: /api/posts/42
Content-Type: application/json

{"id": 42, "title": "Hello World"}
\`\`\`

Use **201** when creating resources and include a \`Location\` header pointing to the new URL. Use **204** when the client does not need a response body.

## Client errors (4xx)

These mean the **request** was wrong — bad input, missing auth, or resource not found. Fix the client or the user's action; retrying the same request usually will not help.

| Code | Name | When to use |
|------|------|-------------|
| **400** | Bad Request | Malformed JSON, invalid query params |
| **401** | Unauthorized | Missing or invalid authentication |
| **403** | Forbidden | Authenticated but not allowed |
| **404** | Not Found | Resource does not exist |
| **409** | Conflict | Duplicate email, version mismatch |
| **422** | Unprocessable Entity | Valid JSON but business rule failed |
| **429** | Too Many Requests | Rate limit exceeded |

\`\`\`javascript
const res = await fetch("/api/posts/999");
if (res.status === 404) {
  console.log("Post not found");
} else if (res.status === 401) {
  redirectToLogin();
}
\`\`\`

**401 vs 403:** 401 means "who are you?" — send credentials. 403 means "I know who you are, but you cannot do this."

## Server errors (5xx)

**5xx** codes indicate the server failed despite a possibly valid request. Clients may retry with backoff (especially **502**, **503**, **504**).

| Code | Name | Typical cause |
|------|------|---------------|
| **500** | Internal Server Error | Unhandled exception |
| **502** | Bad Gateway | Upstream proxy got invalid response |
| **503** | Service Unavailable | Overload or maintenance |
| **504** | Gateway Timeout | Upstream too slow |

Never return **500** for validation errors — that belongs in **400** or **422**.

## Redirection (3xx)

| Code | Name | Use case |
|------|------|----------|
| **301** | Moved Permanently | Old URL → new URL forever |
| **302** | Found | Temporary redirect |
| **304** | Not Modified | Cached version still valid |

APIs rarely return HTML redirects; browsers use 3xx heavily during navigation.

## Designing consistent APIs

Pick a small set and document them in your OpenAPI spec:

\`\`\`javascript
// Express-style handlers
app.post("/api/posts", async (req, res) => {
  const post = await createPost(req.body);
  res.status(201).location(\`/api/posts/\${post.id}\`).json(post);
});

app.delete("/api/posts/:id", async (req, res) => {
  await deletePost(req.params.id);
  res.sendStatus(204);
});
\`\`\`

Return a JSON error body with \`message\` and optional \`code\` field so clients can branch without parsing English strings.

## Common mistakes

- Returning **200** with \`{ error: "Not found" }\` in the body — use **404** and proper status.
- Using **401** for permission denied — that is **403**.
- Exposing stack traces in **500** responses in production.
- Ignoring **429** — implement retry-after headers and client backoff.

## Tips

- Log status code + request id on the server for every response.
- Test error paths with [curl JSON API snippet](/snippets/curl-json-api).
- Read [Learn: HTTP methods & headers](/learn/web-apis/methods-headers) for the full request lifecycle.

## Related

- [Learn: HTTP intro](/learn/web-apis/http-intro)
- [Learn: Status codes](/learn/web-apis/status-codes)
- [Learn: REST design](/learn/web-apis/rest-design)
- [Express rate limit snippet](/snippets/express-rate-limit)`,

  python: `## Overview

Python is a high-level, readable programming language used for web backends, scripting, data work, automation, and machine learning. Its clear syntax and vast standard library make it one of the best languages for beginners who want to grow into production engineering. Python matters on this site because many backend tutorials, API examples, and DevOps scripts use it daily.

Python 3 is the only supported major version today. Code runs through the interpreter or packaged apps using tools like \`venv\` and \`pip\`. The sections below cover syntax essentials, data structures, functions, modules, and patterns you will use in real projects.

## Syntax basics

Python uses **indentation** (spaces, typically 4) to define blocks instead of braces. Statements end at newline; use backslash or parentheses for line continuation.

\`\`\`python
name = "DevBlog"
count = 42
active = True
price = 19.99

# f-strings (preferred for formatting)
message = f"Welcome to {name}, visits: {count}"
\`\`\`

| Type | Example | Notes |
|------|---------|-------|
| \`str\` | \`"hello"\` | Immutable text |
| \`int\` / \`float\` | \`42\`, \`3.14\` | Arbitrary-precision ints |
| \`bool\` | \`True\`, \`False\` | Subclass of \`int\` |
| \`None\` | \`None\` | Absence of value |

## Control flow

\`\`\`python
scores = [88, 92, 71]

for score in scores:
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    else:
        grade = "C"
    print(f"{score} -> {grade}")

# Comprehension
passed = [s for s in scores if s >= 80]
\`\`\`

\`for\` loops iterate over any iterable. \`while\` runs until a condition is false. Use \`break\` and \`continue\` sparingly; refactor complex loops into functions.

## Data structures

| Structure | Mutable | Ordered | Use case |
|-----------|---------|---------|----------|
| \`list\` | Yes | Yes | Sequences, stacks |
| \`tuple\` | No | Yes | Fixed records |
| \`dict\` | Yes | Yes (3.7+) | Key-value maps |
| \`set\` | Yes | No | Unique membership |

\`\`\`python
user = {"id": 1, "email": "dev@example.com", "tags": ["python", "api"]}

# Safe access
email = user.get("email", "")
tags = user.setdefault("tags", [])

# Unpacking
id_, email, *rest = [1, "dev@example.com", "extra"]
\`\`\`

## Functions and modules

\`\`\`python
def greet(name: str, *, loud: bool = False) -> str:
    """Return a greeting string."""
    text = f"Hello, {name}"
    return text.upper() if loud else text

# Import styles
from pathlib import Path
import json
\`\`\`

Type hints improve readability and work with tools like mypy. Use \`*\` to force keyword-only arguments after it. Organize code into modules and packages; \`if __name__ == "__main__":\` guards CLI entry points.

## Files, errors, and context managers

\`\`\`python
from pathlib import Path

path = Path("data.json")
try:
    data = json.loads(path.read_text(encoding="utf-8"))
except FileNotFoundError:
    data = {}
except json.JSONDecodeError as e:
    raise ValueError(f"Invalid JSON in {path}") from e

# Context manager — always closes file
with path.open("w", encoding="utf-8") as f:
    f.write('{"ok": true}')
\`\`\`

Catch specific exceptions; use \`raise ... from e\` to preserve cause chains.

## Backend essentials

\`\`\`python
import os
import requests
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("API_KEY")
if not api_key:
    raise RuntimeError("API_KEY required")

resp = requests.get(
    "https://api.example.com/posts",
    headers={"Authorization": f"Bearer {api_key}"},
    timeout=10,
)
resp.raise_for_status()
posts = resp.json()
\`\`\`

See [Read environment variables](/snippets/python-read-env) and [HTTP GET with requests](/snippets/python-requests-get) for copy-paste patterns.

## Common mistakes

- **Mutable default arguments** — \`def f(items=[])\` shares one list; use \`None\` and create inside.
- **Shadowing builtins** — Avoid naming variables \`list\`, \`dict\`, \`id\`.
- **Ignoring encoding** — Always specify \`encoding="utf-8"\` on text files.
- **Bare \`except:\`** — Catches everything including \`KeyboardInterrupt\`.

## Tips

- Use \`venv\` per project; pin dependencies in \`requirements.txt\` or \`pyproject.toml\`.
- Prefer \`pathlib\` over string paths.
- Explore [Learn: Python backend path](/learn/python-backend/intro) for a full course.

## Related

- [Learn: Python intro](/learn/python-backend/intro)
- [Learn: Functions & modules](/learn/python-backend/functions-modules)
- [Learn: HTTP requests](/learn/python-backend/http-requests)
- [Python read env snippet](/snippets/python-read-env)
- [Python POST JSON snippet](/snippets/python-post-json)`,

  javascript: `## Overview

JavaScript is the programming language of the web. It runs in browsers (DOM, events, fetch) and on servers via Node.js. Modern JavaScript (ES2015+) adds \`let\`/\`const\`, arrow functions, classes, modules, async/await, and destructuring — patterns you will use in every frontend and full-stack project.

Understanding JavaScript deeply matters because it powers React apps, API clients, build tools, and serverless functions. This reference spans variables through asynchronous programming with practical examples.

## Variables and types

Use \`const\` by default; \`let\` when reassignment is needed. Avoid \`var\` in new code.

\`\`\`javascript
const title = "DevBlog";
let count = 0;
count += 1;

// Primitive types
const n = 42;
const s = "hello";
const b = true;
const empty = null;
const missing = undefined;

// typeof quirks
typeof null; // "object" (historical bug)
\`\`\`

JavaScript is **dynamically typed**. Values carry types, not variable declarations. Use \`===\` for strict equality (no coercion); avoid \`==\`.

## Objects and arrays

\`\`\`javascript
const user = { id: 1, name: "Alex", roles: ["admin"] };

// Destructuring
const { id, name } = user;
const [firstRole] = user.roles;

// Spread (shallow copy)
const updated = { ...user, name: "Sam" };
const moreRoles = [...user.roles, "editor"];

// Optional chaining & nullish coalescing
const city = user.address?.city ?? "Unknown";
\`\`\`

| Method | Array use |
|--------|-----------|
| \`map\` | Transform each element |
| \`filter\` | Keep matching elements |
| \`find\` | First match or undefined |
| \`reduce\` | Accumulate to single value |
| \`some\` / \`every\` | Boolean tests |

## Functions

\`\`\`javascript
// Function declaration (hoisted)
function add(a, b) {
  return a + b;
}

// Arrow function (lexical this)
const multiply = (a, b) => a * b;

// Default parameters
function greet(name = "guest") {
  return \`Hello, \${name}\`;
}
\`\`\`

Arrow functions do not have their own \`this\` — prefer them for callbacks; use regular functions for object methods when you need dynamic \`this\`.

## Async JavaScript

Promises represent future values. \`async/await\` is syntactic sugar over Promises.

\`\`\`javascript
async function loadPosts() {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error("Failed to load posts:", err);
    throw err;
  }
}

// Parallel requests
const [users, posts] = await Promise.all([
  fetch("/api/users").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
]);
\`\`\`

See [Fetch JSON GET](/snippets/fetch-json-get) and [Fetch JSON POST](/snippets/fetch-json-post) for production-ready patterns.

## Modules

\`\`\`javascript
// utils.js
export function slugify(text) {
  return text.toLowerCase().replace(/\\s+/g, "-");
}
export default slugify;

// app.js
import slugify, { slugify as namedSlugify } from "./utils.js";
\`\`\`

In Node and bundlers, use ES modules (\`import\`/\`export\`) or configure \`"type": "module"\` in \`package.json\`.

## Modern patterns

\`\`\`javascript
// Map / Set for keyed collections
const cache = new Map();
cache.set("key", { data: 1 });

// Template literals
const html = \`<article>\${title}</article>\`;

// Logical assignment
count ||= 1;
config ??= {};
\`\`\`

Use [debounce](/snippets/debounce) for search inputs and [throttle](/snippets/throttle) for scroll handlers.

## Error handling

\`\`\`javascript
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

try {
  await loadPosts();
} catch (err) {
  if (err instanceof ApiError && err.status === 401) {
    redirectToLogin();
  } else {
    console.error("Unexpected failure:", err);
  }
}
\`\`\`

Custom error classes make branching cleaner than parsing string messages. In Node 18+, unhandled rejections can terminate the process — always attach \`.catch()\` at API boundaries.

## Common mistakes

- **Mutating state directly in React** — Always create new objects/arrays for updates.
- **Forgetting \`await\`** — \`async\` functions return Promises; unhandled rejections crash Node.
- **Callback hell** — Refactor nested callbacks to async/await.
- **Assuming \`fetch\` throws on 404** — It only rejects on network failure; check \`res.ok\`.

## Tips

- Enable strict mode: \`"use strict";\` or ES modules (strict by default).
- Use the [JSON Formatter](/tools/json-formatter) when debugging API payloads.
- Follow the [JavaScript fundamentals course](/learn/javascript-fundamentals/intro) for structured lessons.

## Related

- [Learn: Variables & types](/learn/javascript-fundamentals/variables-types)
- [Learn: Async & fetch](/learn/javascript-fundamentals/async-await-fetch)
- [Learn: JSON & modules](/learn/javascript-fundamentals/json-modules)
- [JSON Formatter tool](/tools/json-formatter)
- [Debounce snippet](/snippets/debounce)`,

  sql: `## Overview

SQL (Structured Query Language) is the standard language for reading and writing relational database data. PostgreSQL, MySQL, SQLite, and SQL Server all speak dialects of SQL. Whether you build APIs, analytics dashboards, or admin tools, SQL is how you query users, posts, orders, and joins between them.

Relational databases store data in **tables** (rows and columns) with **schemas** defining types and constraints. SQL lets you SELECT filtered data, INSERT new rows, UPDATE existing ones, DELETE records, and JOIN tables by keys — all inside **transactions** that roll back on failure.

## Core queries

\`\`\`sql
-- Select with filter and sort
SELECT id, title, published_at
FROM posts
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 10 OFFSET 0;

-- Insert
INSERT INTO posts (title, slug, author_id)
VALUES ('Hello SQL', 'hello-sql', 1)
RETURNING id;

-- Update
UPDATE posts SET title = 'Updated Title' WHERE id = 42;

-- Delete
DELETE FROM comments WHERE id = 99;
\`\`\`

| Clause | Role |
|--------|------|
| \`SELECT\` | Columns to return |
| \`FROM\` | Source table(s) |
| \`WHERE\` | Row filter (before grouping) |
| \`GROUP BY\` | Aggregate per group |
| \`HAVING\` | Filter after grouping |
| \`ORDER BY\` | Sort results |
| \`LIMIT\` | Cap row count |

## Joins

Joins combine rows from related tables using foreign keys.

\`\`\`sql
SELECT p.title, c.name AS category
FROM posts p
INNER JOIN categories c ON c.id = p.category_id
LEFT JOIN comments cm ON cm.post_id = p.id
WHERE p.status = 'published';
\`\`\`

| Join type | Returns |
|-----------|---------|
| **INNER** | Rows with matches in both tables |
| **LEFT** | All left rows; NULLs where no match on right |
| **RIGHT** | Mirror of LEFT |
| **FULL** | All rows from both; NULLs where missing |

Use [SQL SELECT with JOIN snippet](/snippets/sql-select-join) as a starting template.

## Aggregates

\`\`\`sql
SELECT category_id, COUNT(*) AS post_count, MAX(published_at) AS latest
FROM posts
WHERE status = 'published'
GROUP BY category_id
HAVING COUNT(*) >= 5
ORDER BY post_count DESC;
\`\`\`

Common aggregates: \`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. \`HAVING\` filters groups; \`WHERE\` filters rows before grouping.

## Indexes and performance

Indexes speed up lookups but slow writes slightly. Index columns used in \`WHERE\`, \`JOIN\`, and \`ORDER BY\`.

\`\`\`sql
CREATE INDEX idx_posts_slug ON posts (slug);
CREATE INDEX idx_posts_status_published ON posts (status, published_at DESC);
\`\`\`

Run \`EXPLAIN ANALYZE\` on slow queries in PostgreSQL to see scan vs index usage. See [Create index snippet](/snippets/sql-create-index).

## Transactions

\`\`\`sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- ROLLBACK; on error
\`\`\`

Transactions are **ACID**: atomic, consistent, isolated, durable. ORMs wrap these automatically; raw SQL scripts need explicit \`BEGIN\`/\`COMMIT\`.

## PostgreSQL tips

\`\`\`sql
-- Upsert (insert or update)
INSERT INTO subscribers (email, confirmed)
VALUES ('dev@example.com', true)
ON CONFLICT (email) DO UPDATE SET confirmed = EXCLUDED.confirmed;

-- Pagination (keyset is faster at scale)
SELECT * FROM posts WHERE id > 100 ORDER BY id LIMIT 20;
\`\`\`

Use [SQL upsert snippet](/snippets/sql-upsert-postgres) and [pagination snippet](/snippets/sql-pagination).

## Common mistakes

- **SELECT *** in production APIs — Fetch only needed columns.
- **Missing indexes** on foreign keys — Joins become full table scans.
- **N+1 queries** — Load related data with JOINs or batch queries, not loops.
- **String concatenation for values** — Use parameterized queries to prevent SQL injection.

## Tips

- Format messy queries with the [SQL Formatter](/tools/sql-formatter).
- Study [Learn: SQL intro](/learn/sql-databases/sql-intro) and [JOINs lesson](/learn/sql-databases/joins).
- Back up before destructive migrations; see [bash backup DB snippet](/snippets/bash-backup-db).

## Related

- [Learn: SELECT & WHERE](/learn/sql-databases/select-where)
- [Learn: Indexes](/learn/sql-databases/indexes)
- [Learn: Transactions](/learn/sql-databases/transactions)
- [SQL Formatter tool](/tools/sql-formatter)
- [SQL upsert snippet](/snippets/sql-upsert-postgres)`,

  css: `## Overview

CSS (Cascading Style Sheets) controls how HTML looks and behaves on screen: layout, color, typography, spacing, animations, and responsive breakpoints. Every web page you build — blog, dashboard, or landing page — depends on CSS (or a framework that compiles to CSS) to turn semantic markup into a polished UI.

Modern CSS includes **Flexbox** and **Grid** for layout, **custom properties** for theming, and **media queries** for device adaptation. You do not need a library to build professional layouts; understanding core CSS makes every framework easier to debug.

## Selectors and specificity

\`\`\`css
/* Element */
article { line-height: 1.6; }

/* Class */
.card { padding: 1rem; border-radius: 8px; }

/* ID (use sparingly) */
#main { max-width: 1200px; }

/* Attribute */
input[type="email"] { border-color: #3b82f6; }

/* Pseudo-class */
a:hover { text-decoration: underline; }
\`\`\`

Specificity order (low to high): element < class/attribute/pseudo-class < id < inline styles. When rules tie, last declaration wins. Use consistent class naming (BEM: \`.block__element--modifier\`) to avoid fighting specificity.

## Box model

Every element is a box: **content**, **padding**, **border**, **margin**.

\`\`\`css
.box {
  box-sizing: border-box; /* width includes padding + border */
  width: 100%;
  max-width: 48rem;
  padding: 1rem 1.5rem;
  margin: 0 auto;
  border: 1px solid hsl(var(--border));
}
\`\`\`

\`box-sizing: border-box\` on \`*\` or \`:root\` prevents width math surprises in responsive layouts.

## Flexbox

Flexbox lays out items in a **row or column** with alignment along main and cross axes.

\`\`\`css
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.nav { display: flex; gap: 1rem; }
.nav a { flex-shrink: 0; }
\`\`\`

| Property | Effect |
|----------|--------|
| \`justify-content\` | Main-axis alignment |
| \`align-items\` | Cross-axis alignment |
| \`flex: 1\` | Grow to fill space |
| \`gap\` | Space between items |

Centering is trivial with Flexbox — see [CSS center with flex snippet](/snippets/css-center-flex).

## CSS Grid

Grid defines **two-dimensional** layouts with rows and columns.

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.sidebar-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
\`\`\`

Use Grid for page shells and card galleries; Flexbox for nav bars and inline toolbars. [CSS grid autofit snippet](/snippets/css-grid-autofit) demonstrates responsive columns without media queries.

## Responsive design

\`\`\`css
:root {
  --text: 1rem;
  --space: clamp(1rem, 2vw, 2rem);
}

@media (max-width: 768px) {
  .sidebar-layout {
    grid-template-columns: 1fr;
  }
}
\`\`\`

Mobile-first: base styles for small screens, \`min-width\` media queries for larger. Use \`clamp()\` for fluid typography and spacing.

## Custom properties (variables)

\`\`\`css
:root {
  --color-primary: #2563eb;
  --radius: 0.5rem;
}

.button {
  background: var(--color-primary);
  border-radius: var(--radius);
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
}
\`\`\`

Variables cascade and inherit — ideal for light/dark themes. Pair with [Tailwind dark card snippet](/snippets/tailwind-dark-card) if you use utility CSS.

## Typography and transitions

Readable type scales improve UX on blogs and docs. Use a modular scale and limit line length to roughly 65–75 characters.

\`\`\`css
body {
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: hsl(var(--foreground));
}

h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); letter-spacing: -0.02em; }
.prose p + p { margin-top: 1em; }

.card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.card:hover { box-shadow: 0 8px 24px rgb(0 0 0 / 0.12); }
\`\`\`

Prefer \`rem\` for font sizes so text respects user browser settings. Subtle transitions on hover states feel polished without distracting motion.

## Common mistakes

- **Fixed heights on text containers** — Content gets clipped; use \`min-height\` instead.
- **Overusing \`!important\`** — Fix specificity at the source.
- **Pixel-only layouts** — Prefer \`rem\`, \`%\`, \`fr\`, and \`clamp\` for accessibility.
- **Forgetting focus styles** — Keyboard users need visible \`:focus-visible\` outlines.

## Tips

- Use browser DevTools to inspect computed styles and flex/grid overlays.
- Convert colors with the [Color Converter](/tools/color-converter).
- Truncate long text with [multiline truncate snippet](/snippets/css-truncate-multiline).

## Related

- [CSS center flex snippet](/snippets/css-center-flex)
- [CSS grid autofit snippet](/snippets/css-grid-autofit)
- [Tailwind responsive grid snippet](/snippets/tailwind-responsive-grid)
- [Color Converter tool](/tools/color-converter)
- [Learn: React frontend](/learn/frontend-react/intro)`,

  "regex-patterns": `## Overview

Regular expressions (regex) are patterns for matching, searching, and replacing text. They appear in JavaScript (\`String.match\`, \`RegExp\`), Python (\`re\` module), SQL (\`LIKE\` / \`~\\*\`), validators, log parsers, and IDE search. Regex matters because so much developer work involves strings: emails, URLs, slugs, log lines, and user input validation.

Regex is not a full programming language — it is a specialized notation with literals, character classes, quantifiers, anchors, and groups. Start simple; add complexity only when tests prove you need it.

## Basic syntax

| Symbol | Meaning |
|--------|---------|
| \`.\` | Any character except newline |
| \`\\d\` | Digit [0-9] |
| \`\\w\` | Word character [A-Za-z0-9_] |
| \`\\s\` | Whitespace |
| \`[abc]\` | Any of a, b, c |
| \`[^abc]\` | Not a, b, c |
| \`*\` | Zero or more (greedy) |
| \`+\` | One or more |
| \`?\` | Zero or one |
| \`{n,m}\` | Between n and m times |

\`\`\`javascript
const slug = "hello-world-2024";
/^hello/.test(slug);           // true — starts with hello
/world/.exec(slug)?.[0];       // "world"
slug.replace(/\\d+/g, "X");     // "hello-world-X"
\`\`\`

## Anchors and boundaries

\`\`\`javascript
/^start/;   // Beginning of string
/end$/;     // End of string
/\\bword\\b/; // Whole word boundary
\`\`\`

Use \`^\` and \`$\` when validating entire inputs (email field), not substrings inside larger text.

## Groups and capture

\`\`\`javascript
const re = /^(\\d{4})-(\\d{2})-(\\d{2})$/;
const m = re.exec("2024-06-15");
// m[1] = "2024", m[2] = "06", m[3] = "15"

// Named groups
const iso = /^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/;
iso.exec("2024-06-15")?.groups?.year; // "2024"
\`\`\`

Non-capturing group \`(?:...)\` groups without storing match — use when you do not need \`$1\`.

## Common validation patterns

\`\`\`javascript
// Email (basic — not RFC-complete)
const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

// URL (simplified)
const urlRe = /^https?:\\/\\/[^\\s/$.?#].[^\\s]*$/i;

// Password: 8+ chars, upper, lower, digit
const pwdRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;
\`\`\`

Copy battle-tested starters from [email regex snippet](/snippets/regex-email-basic), [URL validation](/snippets/regex-url-validation), and [password strength](/snippets/regex-password-strength). Always test edge cases in the [Regex Tester](/tools/regex-tester).

## Flags (JavaScript)

| Flag | Effect |
|------|--------|
| \`i\` | Case insensitive |
| \`g\` | Global — all matches |
| \`m\` | Multiline — ^/$ per line |
| \`s\` | Dot matches newline |
| \`u\` | Unicode |
| \`y\` | Sticky |

\`\`\`javascript
"Hello hello".match(/hello/gi); // ["Hello", "hello"]
\`\`\`

## Python \`re\` module

\`\`\`python
import re

text = "Contact dev@example.com or support@site.org"
emails = re.findall(r"[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}", text)

# Compile for reuse
slug_re = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
slug_re.match("my-post-slug")  # match object or None
\`\`\`

Use raw strings \`r"..."\` so backslashes behave predictably.

## Replace, split, and extract

\`\`\`javascript
const log = "2024-06-15 ERROR user=42 timeout";
const cleaned = log.replace(/ERROR\\s+/, "WARN ");
const parts = "a,b,c".split(/,\\s*/);

// matchAll for all captures (requires g flag)
const rows = [...log.matchAll(/(\\d{4}-\\d{2}-\\d{2})\\s+(\\w+)/g)];
\`\`\`

When replacing user input, escape special regex characters first using a helper or character-class escape pattern. For log parsing at scale, consider dedicated parsers instead of giant regexes.

## Common mistakes

- **Catastrophic backtracking** — Nested quantifiers like \`(a+)+$\` on long input can hang; simplify patterns.
- **Over-validating email** — Perfect RFC regex is huge; combine simple regex + confirmation link.
- **Forgetting to escape dots** — \`.\` matches anything; use \`\\.\` for literal periods in domains.
- **Validating HTML with regex** — Parse HTML with a proper parser, not regex alone.

## Tips

- Prefer explicit character classes over \`.\` when possible.
- Test with both matching and non-matching inputs in [Regex Tester](/tools/regex-tester).
- When readability suffers, use a validation library (Zod, Yup) for complex rules.

## Related

- [Regex Tester tool](/tools/regex-tester)
- [Email regex snippet](/snippets/regex-email-basic)
- [URL validation snippet](/snippets/regex-url-validation)
- [Learn: JavaScript strings](/learn/javascript-fundamentals/strings-templates)`,

  terminal: `## Overview

The terminal (shell) is a text interface to your operating system. Developers use it to run servers, manage Git, install packages, search files, tail logs, and deploy applications. On macOS and Linux the default is often **bash** or **zsh**; Windows users may use PowerShell or WSL.

Terminal fluency saves hours compared to clicking through GUIs for repetitive tasks. The commands below cover navigation, file operations, search, processes, pipes, and networking — the daily toolkit of backend and DevOps work.

## Navigation and files

\`\`\`bash
pwd                    # Print working directory
cd ~/projects/blog     # Change directory (~ = home)
ls -la                 # List all files with details
mkdir -p src/components
cp file.txt backup.txt
mv old.txt new.txt
rm file.txt            # Delete (careful — no trash by default)
rm -rf node_modules    # Recursive delete — double-check path
\`\`\`

| Command | Description |
|---------|-------------|
| \`cd -\` | Previous directory |
| \`cd ..\` | Parent directory |
| \`touch file\` | Create empty file or update timestamp |
| \`cat file\` | Print file contents |
| \`less file\` | Paginated view (q to quit) |

## Search and discovery

\`\`\`bash
# Find files by name
find . -name "*.tsx" -not -path "*/node_modules/*"

# Search file contents (ripgrep — rg — is faster than grep)
rg "useState" src/
grep -r "TODO" --include="*.ts" .

# Which program runs a command
which node
type cd   # shell builtin
\`\`\`

Combine \`find\` with \`-exec\` or use \`xargs\` for batch operations. Modern alternative: \`fd\` for finding, \`rg\` for content search.

## Pipes and redirection

\`\`\`bash
# Pipe stdout of one command into stdin of next
cat access.log | rg "POST" | wc -l

# Redirect output
npm test > test.log 2>&1

# Append
echo "done" >> build.log
\`\`\`

**stdout** (1) vs **stderr** (2): \`2>&1\` merges errors into the log file for CI debugging.

## Environment and processes

\`\`\`bash
export NODE_ENV=production
echo $PATH

# List processes
ps aux | rg node

# Kill by PID
kill 12345
kill -9 12345   # Force — last resort

# Background job
npm run dev &
jobs
fg %1
\`\`\`

Use \`.env\` files for secrets; load them in apps, not in shell history. See [Learn: terminal basics](/learn/devops-git/terminal-basics).

## Networking

\`\`\`bash
curl -I https://example.com          # Headers only
curl -s https://api.example.com/posts | jq .

ping -c 3 example.com
lsof -i :3000                          # What listens on port 3000
\`\`\`

See [curl JSON API snippet](/snippets/curl-json-api) and [curl with bearer token](/snippets/bash-curl-bearer-token).

## Permissions and scripts

\`\`\`bash
chmod +x deploy.sh
./deploy.sh

# Make script executable for owner only
chmod 700 deploy.sh
\`\`\`

Shebang line tells the OS which interpreter to use:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
echo "Safe script — exits on error, unset vars, pipe failures"
\`\`\`

## Shortcuts and productivity

| Shortcut | Action |
|----------|--------|
| Ctrl+C | Cancel running command |
| Ctrl+L | Clear screen |
| Ctrl+R | Reverse search history |
| Ctrl+A / Ctrl+E | Jump to start / end of line |
| Tab | Autocomplete paths and commands |

Create aliases in \`~/.zshrc\` or \`~/.bashrc\`:

\`\`\`bash
alias gs="git status"
alias dc="docker compose"
alias ll="ls -lah"
\`\`\`

Chain commands with \`&&\` (run next only if previous succeeds) or \`;\` (always run next). Use \`mkdir -p\` and \`touch\` in setup scripts to avoid "directory not found" errors during onboarding.

## Common mistakes

- **Running \`rm -rf /\`** — Always verify paths; use trash-cli if available.
- **Spaces in paths** — Quote paths: \`cd "My Projects"\`.
- **Secrets in command history** — \`export API_KEY=...\` persists; use env files.
- **Wrong directory** — Run \`pwd\` before destructive commands.

## Tips

- Tab completion saves typing; up-arrow recalls history.
- Use \`tmux\` or \`screen\` for long-running remote sessions.
- Database backups: [bash backup DB snippet](/snippets/bash-backup-db).

## Related

- [Learn: Terminal basics](/learn/devops-git/terminal-basics)
- [Learn: Git intro](/learn/devops-git/git-intro)
- [curl JSON API snippet](/snippets/curl-json-api)
- [bash backup DB snippet](/snippets/bash-backup-db)
- [Text Diff tool](/tools/text-diff)`,

  "vscode-shortcuts": `## Overview

Visual Studio Code is a free, extensible editor used by millions of web developers. Keyboard shortcuts turn repetitive actions — save, search, refactor, debug — into muscle memory, often cutting navigation time in half. This reference covers essential shortcuts on **macOS** (⌘ = Command, ⌥ = Option); on Windows/Linux, replace ⌘ with **Ctrl** and ⌥ with **Alt** in most cases.

VS Code integrates Git, terminals, extensions, and debugging in one window. Learning shortcuts for editing, multi-cursor, and navigation pays off immediately on any JavaScript, Python, or TypeScript project.

## File and editor navigation

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Quick Open file | ⌘P | Ctrl+P |
| Command Palette | ⌘⇧P | Ctrl+Shift+P |
| Go to Symbol in file | ⌘⇧O | Ctrl+Shift+O |
| Go to Definition | F12 | F12 |
| Peek Definition | ⌥F12 | Alt+F12 |
| Go back / forward | ⌃- / ⌃⇧- | Alt+← / Alt+→ |
| Toggle sidebar | ⌘B | Ctrl+B |
| Integrated terminal | ⌃\` | Ctrl+\` |

\`Cmd+P\` then type \`@symbol\` jumps to functions inside the current file — faster than scrolling large components.

## Editing essentials

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| Save | ⌘S | Ctrl+S |
| Save All | ⌥⌘S | Ctrl+K S |
| Undo / Redo | ⌘Z / ⌘⇧Z | Ctrl+Z / Ctrl+Y |
| Cut line | ⌘X (no selection) | Ctrl+X |
| Copy line down | ⌥⇧↓ | Shift+Alt+↓ |
| Move line up/down | ⌥↑ / ⌥↓ | Alt+↑ / Alt+↓ |
| Delete line | ⌘⇧K | Ctrl+Shift+K |
| Comment line | ⌘/ | Ctrl+/ |
| Format document | ⌥⇧F | Shift+Alt+F |

## Multi-cursor and selection

\`\`\`
Add cursor above/below:     ⌥⌘↑ / ⌥⌘↓  (Ctrl+Alt+↑/↓)
Select next occurrence:     ⌘D  (Ctrl+D)
Select all occurrences:     ⌘⇧L
Column (box) selection:     ⌥⇧ drag  (Shift+Alt+drag)
\`\`\`

Multi-cursor editing is ideal for renaming JSON keys, HTML attributes, or test cases in bulk — select one match, ⌘D through siblings, type once.

## Search and replace

| Action | Shortcut |
|--------|----------|
| Find | ⌘F |
| Replace | ⌥⌘F |
| Find in files | ⌘⇧F |
| Replace in files | ⌘⇧H |
| Toggle regex in search | Alt+R in find box |

Use **Find in Files** with include/exclude globs: \`src/**/*.tsx\`, exclude \`**/node_modules/**\`.

## Git integration

| Action | Shortcut |
|--------|----------|
| Source Control view | ⌃⇧G |
| Stage selected | + icon or context menu |
| Commit | Type message, ⌘Enter |
| Diff side-by-side | Click changed file |

Pair with [Learn: Git daily workflow](/learn/devops-git/daily-workflow) for branch workflows outside the editor.

## Debugging

| Action | macOS |
|--------|-------|
| Toggle breakpoint | F9 |
| Start debugging | F5 |
| Step over | F10 |
| Step into | F11 |
| Debug console | ⌘⇧Y |

Configure \`launch.json\` for Node or Chrome debugging; breakpoints sync with source maps in TypeScript projects.

## Productivity extensions (recommended)

- **ESLint** — Inline lint errors
- **Prettier** — Format on save
- **Error Lens** — Inline diagnostic text
- **GitLens** — Blame and history inline

Install from Extensions view: ⌘⇧X. Keep the list small to preserve startup speed.

## Common mistakes

- **Relying on mouse for file hops** — ⌘P is always faster than sidebar drilling.
- **Not using workspace settings** — Per-project formatters beat global defaults for monorepos.
- **Ignoring Emmet** — Type \`div.container>ul>li*3\` + Tab in HTML/JSX.
- **Syncing secrets in settings.json** — Never store API keys in shared workspace files.

## Tips

- \`Cmd+K Cmd+S\` opens Keyboard Shortcuts reference; search any command.
- Split editor: ⌘\\ for side-by-side diff or component + styles.
- Read the full [VS Code IDE guide](/ides/vscode) on this site for setup and extensions.

## Related

- [VS Code IDE guide](/ides/vscode)
- [Learn: Git intro](/learn/devops-git/git-intro)
- [Learn: JavaScript debugging](/learn/javascript-fundamentals/errors-debugging)
- [Text Diff tool](/tools/text-diff)`,

  "json-syntax": `## Overview

JSON (JavaScript Object Notation) is a lightweight text format for structured data. APIs send and receive JSON over HTTP; config files like \`package.json\` and \`tsconfig.json\` are JSON; databases and caches often store JSON columns. JSON matters because it is the lingua franca between frontend, backend, mobile clients, and third-party services.

JSON is **not** JavaScript — it is a strict subset. Valid JSON has double-quoted keys, no trailing commas, no comments, and only these value types: string, number, boolean, null, array, object.

## Syntax rules

\`\`\`json
{
  "title": "DevBlog API",
  "version": 1,
  "published": true,
  "tags": ["api", "json"],
  "author": {
    "name": "Alex",
    "id": null
  }
}
\`\`\`

| Rule | Detail |
|------|--------|
| Keys | Must be double-quoted strings |
| Strings | UTF-8, escape \`"\`, \`\\\`, control chars |
| Numbers | No leading zeros (except 0.x), no NaN/Infinity |
| Arrays | Comma-separated, \`[]\` |
| Objects | Comma-separated pairs, \`{}\` |
| Whitespace | Insignificant outside strings |

## Types and examples

\`\`\`json
{
  "string": "hello",
  "number": 42,
  "float": 3.14,
  "boolean": false,
  "nullValue": null,
  "array": [1, 2, 3],
  "nested": { "a": 1 }
}
\`\`\`

JSON has no \`undefined\`, \`Date\`, \`Map\`, or functions — serialize dates as ISO strings (\`"2024-06-15T12:00:00Z"\`).

## Parsing and generating (JavaScript)

\`\`\`javascript
const raw = '{"id":1,"title":"Post"}';
const obj = JSON.parse(raw);

JSON.stringify(obj, null, 2);  // Pretty print
JSON.stringify({ ok: true });    // Compact

// Reviver / replacer for custom types
JSON.parse('{"date":"2024-01-01"}', (key, value) => {
  if (key === "date") return new Date(value);
  return value;
});
\`\`\`

Always wrap \`JSON.parse\` in try/catch for user-provided input. Validate shape with [TypeScript Zod parse snippet](/snippets/typescript-zod-parse) on the server.

## Common API patterns

\`\`\`json
{
  "data": {
    "items": [{ "id": 1, "slug": "hello" }],
    "total": 100
  },
  "meta": { "page": 1, "pageSize": 20 }
}
\`\`\`

\`\`\`json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Email is invalid",
    "fields": { "email": "Must be a valid address" }
  }
}
\`\`\`

Consistent envelopes make client code predictable. See [Learn: JSON APIs](/learn/web-apis/json-apis).

## JSON vs JSONC vs JSON5

| Format | Comments | Trailing comma | Use |
|--------|----------|----------------|-----|
| JSON | No | No | APIs, strict config |
| JSONC | Yes | Often | VS Code settings |
| JSON5 | Yes | Yes | Human-friendly config only |

Never send JSONC to a strict API parser — strip comments in production pipelines.

## JSON over HTTP

Clients and servers negotiate JSON with headers and status codes:

\`\`\`http
POST /api/posts HTTP/1.1
Content-Type: application/json
Accept: application/json

{"title":"New post","slug":"new-post"}
\`\`\`

\`\`\`javascript
const res = await fetch("/api/posts", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ title: "New post" }),
});
const data = await res.json();
\`\`\`

Servers should reject non-JSON \`Content-Type\` on JSON endpoints with **415 Unsupported Media Type**. See [Learn: HTTP methods](/learn/web-apis/methods-headers) and [Fetch JSON POST](/snippets/fetch-json-post).

## Schema validation

APIs should validate JSON shape after parsing — types in TypeScript alone do not protect runtime input.

\`\`\`javascript
import { z } from "zod";

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  published: z.boolean().optional(),
});

const body = PostSchema.parse(JSON.parse(raw));
\`\`\`

See [TypeScript Zod parse snippet](/snippets/typescript-zod-parse). Invalid payloads return **400** with field-level errors, not opaque **500** responses.

## Common mistakes

| Error | Fix |
|-------|-----|
| Trailing comma | Remove last comma before \`}\` or \`]\` |
| Single quotes | Use \`"\` only |
| Unquoted keys | Quote all keys |
| \`undefined\` in objects | Omit key or use \`null\` |
| Large integers losing precision | Send big IDs as strings |

Use the [JSON Formatter](/tools/json-formatter) to locate syntax errors by line.

## Tips

- Generate TypeScript types from JSON with [JSON → TypeScript tool](/tools/json-to-typescript).
- Set \`Content-Type: application/json\` on POST/PUT bodies.
- Pretty-print in dev; minify in production to save bandwidth.

## Related

- [JSON Formatter tool](/tools/json-formatter)
- [JSON to TypeScript tool](/tools/json-to-typescript)
- [Learn: JSON APIs](/learn/web-apis/json-apis)
- [Fetch JSON POST snippet](/snippets/fetch-json-post)
- [JSON syntax reference in tool guides](/tools/json-formatter)`,

  html: `## Overview

HTML (HyperText Markup Language) defines the structure and meaning of web content. Browsers parse HTML into the DOM (Document Object Model), which CSS styles and JavaScript manipulates. Semantic HTML matters for accessibility, SEO, and maintainability — search engines and screen readers rely on correct tags, not div soup.

Modern HTML5 includes semantic elements, native form controls, media embedding, and meta tags for social sharing. This reference covers document structure, common elements, forms, accessibility, and SEO essentials.

## Document structure

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DevBlog — Developer Education</title>
    <meta name="description" content="Learn JavaScript, Python, SQL, and more." />
    <link rel="icon" href="/favicon.svg" />
  </head>
  <body>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </body>
</html>
\`\`\`

Always set \`lang\` on \`<html>\` and \`charset=utf-8\` in \`<head>\`. The viewport meta tag is required for responsive mobile layouts.

## Semantic layout

| Element | Purpose |
|---------|---------|
| \`<header>\` | Site or section header |
| \`<nav>\` | Navigation links |
| \`<main>\` | Primary content (one per page) |
| \`<article>\` | Self-contained content (post) |
| \`<section>\` | Thematic grouping |
| \`<aside>\` | Sidebar, related links |
| \`<footer>\` | Footer, copyright |

\`\`\`html
<article>
  <h1>Understanding JWT</h1>
  <p>Published <time datetime="2024-06-15">June 15, 2024</time></p>
  <section aria-labelledby="intro-heading">
    <h2 id="intro-heading">Introduction</h2>
    <p>...</p>
  </section>
</article>
\`\`\`

See [Semantic layout snippet](/snippets/html-semantic-layout) for a full page skeleton.

## Text and links

\`\`\`html
<h1>Page title — one per page</h1>
<h2>Section</h2>
<p>Paragraph with <strong>importance</strong> and <em>emphasis</em>.</p>
<a href="/learn/javascript-fundamentals/intro">Start learning JS</a>
<img src="/hero.png" alt="Developer workspace illustration" width="800" height="450" loading="lazy" />
\`\`\`

Heading levels should not skip (\`h1\` → \`h3\`). Every \`<img>\` needs meaningful \`alt\` — empty \`alt=""\` only for decorative images.

## Forms

\`\`\`html
<form action="/api/contact" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required autocomplete="email" />

  <label for="message">Message</label>
  <textarea id="message" name="message" rows="5" required></textarea>

  <button type="submit">Send</button>
</form>
\`\`\`

Associate labels with \`for\` + \`id\`. Use native input types (\`email\`, \`url\`, \`number\`) for mobile keyboards and basic validation. Full accessible pattern: [HTML accessible form snippet](/snippets/html-accessible-form).

## Lists, tables, and media

\`\`\`html
<ul>
  <li>First item</li>
  <li>Second item</li>
</ul>

<ol>
  <li>Step one</li>
  <li>Step two</li>
</ol>

<table>
  <caption>HTTP methods</caption>
  <thead>
    <tr><th scope="col">Method</th><th scope="col">Safe</th></tr>
  </thead>
  <tbody>
    <tr><td>GET</td><td>Yes</td></tr>
    <tr><td>POST</td><td>No</td></tr>
  </tbody>
</table>

<figure>
  <img src="/diagram.png" alt="Request flow diagram" />
  <figcaption>How the browser loads a page</figcaption>
</figure>
\`\`\`

Use \`<th scope="col|row">\` so screen readers associate headers with cells. For video, provide captions and a transcript when content is educational.

## Interactive elements

\`\`\`html
<button type="button" aria-expanded="false" aria-controls="menu">
  Menu
</button>
<ul id="menu" hidden>...</ul>

<details>
  <summary>Advanced options</summary>
  <p>Hidden until expanded — works without JavaScript.</p>
</details>
\`\`\`

Prefer native \`<button>\` over \`<div onclick>\` for keyboard and screen-reader support. The \`<details>\` element gives free expand/collapse behavior for FAQs and optional form sections.

## Accessibility (a11y)

- One \`<main>\` landmark; skip link to main content for keyboard users.
- Sufficient color contrast (WCAG AA: 4.5:1 for body text).
- Focus visible on interactive elements — do not remove outlines without replacement.
- \`aria-live\` regions for dynamic toast messages.

## SEO meta tags

\`\`\`html
<link rel="canonical" href="https://devblog.example.com/post/slug" />
<meta property="og:title" content="Post Title" />
<meta property="og:description" content="Summary for social cards." />
<meta property="og:image" content="https://devblog.example.com/og.png" />
<meta name="twitter:card" content="summary_large_image" />
\`\`\`

See [HTML meta SEO snippet](/snippets/html-meta-seo). Pair with server-rendered titles per route in SPAs via components like \`SeoHead\`.

## Common mistakes

- **Div-only layouts** — Use semantic tags; CSS Grid handles layout.
- **Multiple \`h1\` tags** — One primary title; subsections use \`h2\`–\`h6\`.
- **Clickable divs** — Use \`<button>\` or \`<a>\` for interactions.
- **Missing \`lang\` and \`alt\`** — Hurts accessibility scores and SEO.

## Tips

- Validate HTML with the W3C validator in CI for marketing pages.
- Prefer progressive enhancement: content works without JavaScript.
- Preview markdown content with [Markdown Preview tool](/tools/markdown-preview) before publishing.

## Related

- [Semantic layout snippet](/snippets/html-semantic-layout)
- [Accessible form snippet](/snippets/html-accessible-form)
- [Meta SEO snippet](/snippets/html-meta-seo)
- [Learn: React components](/learn/frontend-react/components-props)
- [Markdown Preview tool](/tools/markdown-preview)`,

  typescript: `## Overview

TypeScript is JavaScript with optional static types. It compiles to plain JavaScript and catches many bugs at build time: typos on objects, wrong function arguments, null access, and incorrect API shapes. TypeScript powers most modern React codebases, Node APIs, and shared libraries because types serve as living documentation and enable confident refactoring.

You can adopt TypeScript incrementally — rename \`.js\` to \`.ts\`, add types where they help most, and tighten \`strict\` flags over time. This reference covers primitives, interfaces, generics, utility types, and React-friendly patterns.

## Basic types

\`\`\`typescript
let count: number = 0;
let title: string = "DevBlog";
let active: boolean = true;

// Arrays
const tags: string[] = ["ts", "react"];
const ids: Array<number> = [1, 2, 3];

// Union — value is one of several types
type Status = "draft" | "published" | "archived";
let status: Status = "draft";

// any vs unknown — prefer unknown for external data
function parseJson(raw: string): unknown {
  return JSON.parse(raw);
}
\`\`\`

Enable \`strict: true\` in \`tsconfig.json\` for \`strictNullChecks\` and safer code.

## Interfaces and type aliases

\`\`\`typescript
interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string;  // optional
  readonly viewCount: number;
}

type PostId = Post["id"];

interface ApiResponse<T> {
  data: T;
  error?: string;
}

const res: ApiResponse<Post[]> = await fetchPosts();
\`\`\`

Use \`interface\` for object shapes that may be extended; \`type\` for unions, tuples, and mapped types.

## Functions and generics

\`\`\`typescript
function slugify(input: string): string {
  return input.toLowerCase().replace(/\\s+/g, "-");
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}
\`\`\`

Generics let functions and components work with many types while preserving type relationships.

## Utility types

| Utility | Result |
|---------|--------|
| \`Partial<T>\` | All properties optional |
| \`Required<T>\` | All properties required |
| \`Pick<T, K>\` | Subset of keys |
| \`Omit<T, K>\` | T without keys |
| \`Record<K, V>\` | Object with key type K |

\`\`\`typescript
type PostUpdate = Partial<Pick<Post, "title" | "slug">>;
type PublicPost = Omit<Post, "viewCount">;
\`\`\`

See [Pick/Omit snippet](/snippets/typescript-pick-omit) and [Partial/Required snippet](/snippets/typescript-partial-required).

## Narrowing and guards

\`\`\`typescript
function isPost(value: unknown): value is Post {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

function handle(data: unknown) {
  if (isPost(data)) {
    console.log(data.title); // narrowed to Post
  }
}
\`\`\`

Runtime validation libraries like Zod complement TypeScript — see [Zod parse snippet](/snippets/typescript-zod-parse).

## React patterns

\`\`\`typescript
import { useState, type ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

export function Button({ children, variant = "primary", onClick }: ButtonProps) {
  return (
    <button className={variant} onClick={onClick}>
      {children}
    </button>
  );
}

const [posts, setPosts] = useState<Post[]>([]);
\`\`\`

Full course chapter: [TypeScript with React](/learn/frontend-react/typescript-react).

## Enums, literals, and \`satisfies\`

\`\`\`typescript
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number];

type Theme = "light" | "dark";
const config = {
  theme: "dark",
  maxPosts: 20,
} satisfies { theme: Theme; maxPosts: number };
// config.theme is "dark" (literal), not generic string
\`\`\`

Prefer \`as const\` objects and union types over numeric enums unless you need reverse mapping. The \`satisfies\` operator validates shape while preserving narrow literal types for inference.

## Common mistakes

- **Overusing \`any\`** — Defeats TypeScript; use \`unknown\` + narrowing.
- **Type assertions without checks** — \`as Post\` does not validate at runtime.
- **Ignoring strict null checks** — Use \`?\` and explicit guards instead of \`!\`.
- **Duplicating API types** — Generate from OpenAPI or share a \`types\` package.

## Tips

- Run \`tsc --noEmit\` in CI even if Vite/esbuild handles transpile-only builds.
- Use \`satisfies\` to infer literal types while checking shape.
- Generate types from JSON with [JSON → TypeScript tool](/tools/json-to-typescript).

## Related

- [Learn: TypeScript & React](/learn/frontend-react/typescript-react)
- [TypeScript Pick/Omit snippet](/snippets/typescript-pick-omit)
- [TypeScript Zod parse snippet](/snippets/typescript-zod-parse)
- [JSON to TypeScript tool](/tools/json-to-typescript)
- [Learn: JavaScript fundamentals](/learn/javascript-fundamentals/intro)`,

  nodejs: `## Overview

Node.js is a JavaScript runtime built on Chrome's V8 engine. It lets you run JavaScript on servers, CLIs, and build tools — the same language as the browser, with APIs for files, networking, processes, and crypto. Node powers Express APIs, Next.js servers, Webpack, and countless npm packages.

Node uses an **event-driven, non-blocking I/O** model: slow operations (disk, network) run asynchronously so one thread handles many concurrent connections. Understanding modules, \`fs\`, environment variables, and HTTP servers is essential for backend JavaScript developers.

## Modules (ESM and CommonJS)

\`\`\`javascript
// package.json: "type": "module" for ESM
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CommonJS (legacy)
// const fs = require("fs");
// module.exports = { hello };
\`\`\`

Prefer **ES modules** in new projects. Use \`node:\` prefix for built-in modules (explicit and stable).

## File system and paths

\`\`\`javascript
import fs from "node:fs/promises";
import path from "node:path";

const configPath = path.join(process.cwd(), "config", "app.json");
const raw = await fs.readFile(configPath, "utf8");
const config = JSON.parse(raw);

await fs.writeFile(
  path.join("output", "result.json"),
  JSON.stringify({ ok: true }, null, 2),
  "utf8"
);
\`\`\`

Always specify \`utf8\` encoding for text. Use \`path.join\` instead of string concatenation for cross-platform paths.

## Environment variables

\`\`\`javascript
import "dotenv/config";

const port = Number(process.env.PORT) || 3000;
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is required");
}
\`\`\`

See [Node read env snippet](/snippets/node-read-env). Never commit \`.env\`; document keys in \`.env.example\`.

## HTTP server (built-in)

\`\`\`javascript
import http from "node:http";

const server = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404).end("Not Found");
});

server.listen(3000, () => console.log("Listening on :3000"));
\`\`\`

Production APIs usually use **Express**, Fastify, or Hono — see [Learn: REST design](/learn/web-apis/rest-design).

## Express basics

\`\`\`javascript
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/posts", async (req, res) => {
  const posts = await db.query("SELECT * FROM posts LIMIT 20");
  res.json({ data: posts });
});

app.post("/api/posts", async (req, res) => {
  const post = await createPost(req.body);
  res.status(201).location(\`/api/posts/\${post.id}\`).json(post);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(process.env.PORT || 3000);
\`\`\`

Add [CORS + session snippet](/snippets/express-cors-session) and [auth middleware snippet](/snippets/express-auth-middleware) for real apps.

## npm scripts and packages

\`\`\`json
{
  "name": "devblog-api",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "node --test"
  }
}
\`\`\`

\`\`\`bash
npm install express
npm install -D typescript @types/node
npx tsc --init
\`\`\`

Use \`pnpm\` or \`npm\` consistently; lockfiles belong in version control.

## Crypto, streams, and the event loop

\`\`\`javascript
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";

const id = randomUUID();
const hash = createHash("sha256").update("hello").digest("hex");

// Stream large files instead of loading into memory
createReadStream("big.log")
  .on("data", (chunk) => process.stdout.write(chunk))
  .on("error", console.error);
\`\`\`

CPU-heavy work (image processing, bcrypt) should run in worker threads or a job queue so it does not block the main event loop. Pair hashing with the [Hash Generator tool](/tools/hash-generator) when verifying checksums manually.

## Common mistakes

- **Blocking the event loop** — Avoid sync \`fs.readFileSync\` on hot paths; use async APIs.
- **Unhandled Promise rejections** — Always \`await\` or \`.catch()\` on Promises.
- **Missing error middleware in Express** — Four-argument handler required for errors.
- **Trusting \`req.body\` without validation** — Validate with Zod or similar.

## Tips

- Use \`node --watch\` (Node 18+) for dev reload without extra tools.
- Log structured JSON in production for observability.
- Rate-limit public routes — [Express rate limit snippet](/snippets/express-rate-limit).

## Related

- [Learn: REST design](/learn/web-apis/rest-design)
- [Learn: JSON APIs](/learn/web-apis/json-apis)
- [Node read env snippet](/snippets/node-read-env)
- [Express CORS session snippet](/snippets/express-cors-session)
- [Express auth middleware snippet](/snippets/express-auth-middleware)`,

  "jwt-auth": `## Overview

JWT (JSON Web Token) is a compact, URL-safe format for representing claims between parties. In web authentication, servers often issue a JWT after login; clients send it on subsequent requests (typically \`Authorization: Bearer <token>\`) to prove identity without server-side session storage for every user.

JWTs are **signed**, not encrypted — anyone can Base64-decode the payload, so never put secrets (passwords, credit cards) inside. Signature verification proves the token was issued by your server and was not tampered with. Understanding structure, claims, expiration, and verification is critical for secure API design.

## Structure

A JWT has three parts separated by dots:

\`\`\`
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE3MDAwMDAwMDB9.signature
\`\`\`

| Part | Contents |
|------|----------|
| **Header** | Algorithm (\`alg\`) and type (\`typ\`: JWT) |
| **Payload** | Claims (JSON object) |
| **Signature** | HMAC or asymmetric sign of header + payload |

Decode safely for debugging with the [JWT Decoder tool](/tools/jwt-decoder) — decoding does **not** verify trust.

## Standard claims

| Claim | Name | Purpose |
|-------|------|---------|
| \`sub\` | Subject | User ID |
| \`iss\` | Issuer | Who issued the token |
| \`aud\` | Audience | Intended recipient |
| \`exp\` | Expiration | Unix timestamp — reject after |
| \`iat\` | Issued at | Creation time |
| \`nbf\` | Not before | Reject before this time |

\`\`\`json
{
  "sub": "user_42",
  "email": "dev@example.com",
  "role": "admin",
  "iat": 1718650000,
  "exp": 1718736400
}
\`\`\`

Always validate \`exp\` (and \`iss\`/\`aud\` when using multiple services). Short-lived access tokens (15–60 minutes) limit exposure if leaked.

## Signing algorithms

| Algorithm | Type | Notes |
|-----------|------|-------|
| **HS256** | Symmetric (shared secret) | Simple; same key signs and verifies |
| **RS256** | Asymmetric (RSA key pair) | Public key verifies; private key signs |
| **ES256** | Elliptic curve | Smaller tokens, modern choice |

Never accept \`alg: none\` or allow algorithm switching attacks — pin expected \`alg\` in verification code.

## Issuing tokens (Node.js example)

\`\`\`javascript
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET required");

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: "15m", issuer: "devblog-api" }
  );
}
\`\`\`

Use environment secrets — [Learn: env secrets](/learn/devops-git/env-secrets). Rotate keys with a overlap period for zero-downtime rotation.

## Verifying tokens

\`\`\`javascript
import jwt from "jsonwebtoken";

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: "devblog-api",
  });
}

// Express middleware pattern
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
\`\`\`

See [JWT verify HS256 snippet](/snippets/jwt-verify-hs256) and [Express auth middleware](/snippets/express-auth-middleware). Decode-only helper: [JWT decode payload snippet](/snippets/jwt-decode-payload).

## Refresh tokens and sessions

Access JWTs should be short-lived. **Refresh tokens** (opaque, stored httpOnly cookie or secure storage) obtain new access tokens without re-login. Revoke refresh tokens server-side on logout or compromise.

| Approach | Pros | Cons |
|----------|------|------|
| Stateless JWT | Scales horizontally | Hard to revoke instantly |
| Session + cookie | Easy revoke | Server storage required |
| JWT + refresh + denylist | Balance | More moving parts |

For admin panels, prefer httpOnly **Secure** **SameSite** cookies over localStorage tokens to reduce XSS theft risk.

## Security best practices

- Use HTTPS everywhere — tokens in headers over plaintext HTTP are stolen easily.
- Do not store JWTs in \`localStorage\` if XSS is a concern; httpOnly cookies are safer for browsers.
- Validate all claims you depend on (\`sub\`, \`role\`, \`exp\`).
- Keep payloads small — JWTs ride every request header.
- Log authentication failures without printing full tokens.

## Common mistakes

- **Trusting decoded payload without verification** — Attackers forge unsigned payloads.
- **Long or missing expiration** — Stolen tokens stay valid too long.
- **Putting PII in JWT** — Payload is readable; minimize claims.
- **Same secret across environments** — Use distinct secrets for dev/staging/prod.

## Tips

- Test tokens with [JWT Decoder](/tools/jwt-decoder) and [curl bearer token snippet](/snippets/bash-curl-bearer-token).
- Read the full [Auth & JWT lesson](/learn/web-apis/auth-jwt) for OAuth comparison and flows.

## Related

- [JWT Decoder tool](/tools/jwt-decoder)
- [Learn: Auth & JWT](/learn/web-apis/auth-jwt)
- [Learn: HTTP status codes](/learn/web-apis/status-codes)
- [JWT verify HS256 snippet](/snippets/jwt-verify-hs256)
- [Express auth middleware snippet](/snippets/express-auth-middleware)`,
};
