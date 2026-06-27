import type { LearnChapter } from "../types";

export const pythonBackendChapters: LearnChapter[] = [
  {
    pathSlug: "python-backend",
    slug: "intro",
    title: "Introduction to Python",
    description:
      "Install Python, use the REPL, and run your first script — the foundation for every backend project.",
    level: "beginner",
    minutes: 12,
    content: `## Why Python for backend work

Python is one of the most popular languages for backend development, data pipelines, and automation. Its readable syntax lets you move from idea to working script quickly, and a huge ecosystem of libraries covers HTTP APIs, databases, testing, and deployment tooling.

You do not need to master every feature before building something useful. This path starts with the basics and grows toward the patterns you will use in real services: virtual environments, HTTP clients, environment config, and SQL.

## Installing Python

Download the latest **Python 3** release from [python.org](https://www.python.org/downloads/). On macOS you can also use Homebrew:

\`\`\`bash
brew install python
\`\`\`

Verify the install:

\`\`\`bash
python3 --version
# Python 3.12.x
\`\`\`

Use \`python3\` and \`pip3\` on systems where \`python\` still points to Python 2. Many teams standardize on **pyenv** or **uv** to manage multiple versions per project — we cover project isolation in a later chapter.

## The REPL: read, evaluate, print, loop

Open a terminal and run:

\`\`\`bash
python3
\`\`\`

You will see the \`>>>\` prompt. Type expressions and press Enter; Python evaluates them immediately:

\`\`\`python
>>> 2 + 2
4
>>> "hello".upper()
'HELLO'
>>> name = "devblog"
>>> f"Welcome to {name}"
'Welcome to devblog'
\`\`\`

The REPL is perfect for trying a library function, checking a regex, or debugging a one-liner. Exit with \`exit()\`, \`quit()\`, or **Ctrl+D** (macOS/Linux).

## Your first script

Create a file named \`hello.py\`:

\`\`\`python
def main() -> None:
    print("Hello from Python backend path!")

if __name__ == "__main__":
    main()
\`\`\`

Run it:

\`\`\`bash
python3 hello.py
\`\`\`

The \`if __name__ == "__main__"\` guard means \`main()\` runs only when you execute the file directly, not when another module imports it. That pattern appears in almost every Python CLI and small service entrypoint.

## How Python runs your code

1. **Source** — \`.py\` text files (or notebooks for exploration).
2. **Bytecode** — CPython compiles to bytecode cached in \`__pycache__\`.
3. **Interpreter** — the VM executes bytecode; extension modules can call native code for speed.

For backend work you mostly write plain \`.py\` files and let the runtime handle the rest.

## Editor and tooling tips

- Enable **format on save** with [Ruff](https://docs.astral.sh/ruff/) or Black.
- Use a typed stub-friendly editor (VS Code + Pylance) so autocomplete catches mistakes early.
- Prefer **Python 3.10+** for structural pattern matching and improved error messages.

## Practice

1. Install Python 3 and confirm \`python3 --version\`.
2. In the REPL, assign your name to a variable and print a greeting with an f-string.
3. Save a script that prints today's date using \`from datetime import date\` and \`print(date.today())\`.
4. Run the script from a directory other than where the file lives using an absolute path.

Next up: variables, types, and user input — the building blocks of every API handler and batch job.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "syntax-basics",
    title: "Syntax Basics: Variables, Types, and Input",
    description:
      "Learn Python's core types, f-strings, and reading user input — essential for scripts and CLI tools.",
    level: "beginner",
    minutes: 15,
    content: `## Variables and assignment

Python variables are **names bound to objects**, not typed boxes. You assign with \`=\`:

\`\`\`python
count = 42
title = "DevBlog API"
is_published = True
\`\`\`

Naming conventions (PEP 8):

- \`snake_case\` for variables and functions
- \`UPPER_SNAKE\` for module-level constants
- Avoid shadowing built-ins like \`list\` or \`id\`

Rebinding is allowed; types can change unless you add static hints and run a type checker:

\`\`\`python
value = 10
value = "ten"  # legal, but often a smell in application code
\`\`\`

## Core built-in types

| Type | Example | Typical use |
|------|---------|-------------|
| \`int\` | \`42\`, \`10_000\` | IDs, counts |
| \`float\` | \`3.14\` | metrics, ratios |
| \`str\` | \`"hello"\` | text, JSON fields |
| \`bool\` | \`True\`, \`False\` | flags |
| \`None\` | \`None\` | missing value |

Check types at runtime:

\`\`\`python
type(title)  # <class 'str'>
isinstance(count, int)  # True
\`\`\`

For backend code, prefer explicit conversions instead of relying on implicit coercion:

\`\`\`python
port = int(os.getenv("PORT", "8000"))
\`\`\`

## Strings and f-strings

Concatenation works, but **f-strings** (formatted string literals) are the standard:

\`\`\`python
user = "alex"
posts = 12
message = f"{user} wrote {posts} posts"
\`\`\`

Format numbers and align text:

\`\`\`python
price = 19.5
f"Total: \${price:.2f}"
f"{'id':>8} | {'title':<20}"
\`\`\`

Multiline strings use triple quotes — common for SQL templates or email bodies:

\`\`\`python
query = """
SELECT id, title
FROM posts
WHERE status = 'published'
"""
\`\`\`

## Operators you will use daily

\`\`\`python
# Arithmetic
total = subtotal + tax
pages = (count + per_page - 1) // per_page

# Comparison and logic
if age >= 18 and country == "US":
    ...

# Membership
if "admin" in roles:
    ...
\`\`\`

Python uses **truthiness**: empty containers, zero, \`None\`, and \`False\` are falsy; most other values are truthy.

## Reading input

CLI scripts often use \`input()\`:

\`\`\`python
name = input("Your name: ").strip()
if not name:
    raise SystemExit("Name is required")
print(f"Hello, {name}!")
\`\`\`

For services, input usually comes from **HTTP**, **files**, or **message queues** — not stdin — but \`input()\` is ideal for learning and local admin tools.

## Type hints (optional but recommended)

Hints document intent and enable static analysis:

\`\`\`python
def greet(name: str, excited: bool = False) -> str:
    suffix = "!" if excited else "."
    return f"Hello, {name}{suffix}"
\`\`\`

They do not enforce types at runtime unless you use a validator (Pydantic, etc.).

## Common pitfalls

- **Mutable default arguments** — use \`None\` and create the list inside the function.
- **Comparing floats** — use \`math.isclose\` for money and metrics.
- **String encoding** — always specify \`encoding="utf-8"\` when reading/writing files.

## Practice

1. Write a script that asks for two numbers and prints sum, difference, and product.
2. Format a table row with f-strings: id (width 4), title (width 30, left-aligned), views (width 8, right-aligned).
3. Add type hints to a \`greet\` function and run \`mypy\` or your editor's checker on the file.

These fundamentals appear in every route handler, config loader, and log formatter you will write later.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "control-flow",
    title: "Control Flow and Comprehensions",
    description:
      "Master if/elif/else, loops, and comprehensions to process collections and business logic cleanly.",
    level: "beginner",
    minutes: 18,
    content: `## Conditional logic

Use \`if\`, \`elif\`, and \`else\` to branch on conditions:

\`\`\`python
status_code = 404

if status_code < 400:
    level = "success"
elif status_code < 500:
    level = "client_error"
else:
    level = "server_error"
\`\`\`

Python supports chained comparisons — readable and efficient:

\`\`\`python
if 200 <= status_code < 300:
    print("OK")
\`\`\`

Prefer **guard clauses** early in functions instead of deep nesting:

\`\`\`python
def get_post(post_id: int | None) -> dict:
    if post_id is None:
        raise ValueError("post_id required")
    if post_id < 1:
        raise ValueError("invalid post_id")
    return fetch_post(post_id)
\`\`\`

## \`for\` loops

Iterate any **iterable** — lists, dict keys, file lines, database rows:

\`\`\`python
tags = ["python", "backend", "tutorial"]

for tag in tags:
    print(tag.upper())

for index, tag in enumerate(tags, start=1):
    print(f"{index}. {tag}")
\`\`\`

Loop over dict items:

\`\`\`python
config = {"host": "localhost", "port": 5432}

for key, value in config.items():
    print(f"{key}={value}")
\`\`\`

Use \`break\` to exit early, \`continue\` to skip an iteration, and \`else\` on loops (runs if the loop did not \`break\`) — handy for search patterns.

## \`while\` loops

Best for **retry with backoff**, polling, or reading until a sentinel:

\`\`\`python
attempt = 0
while attempt < 3:
    try:
        response = fetch_health()
        break
    except ConnectionError:
        attempt += 1
        time.sleep(2 ** attempt)
else:
    raise RuntimeError("service unavailable")
\`\`\`

Avoid unbounded \`while True\` without sleep or cancellation — it will burn CPU in production workers.

## Comprehensions

List comprehensions build lists concisely:

\`\`\`python
numbers = [1, 2, 3, 4, 5]
squares = [n * n for n in numbers]
evens = [n for n in numbers if n % 2 == 0]
\`\`\`

Dict and set comprehensions follow the same pattern:

\`\`\`python
posts = [{"id": 1, "title": "A"}, {"id": 2, "title": "B"}]
by_id = {p["id"]: p["title"] for p in posts}
unique_tags = {tag for post in posts for tag in post.get("tags", [])}
\`\`\`

**Generator expressions** use parentheses and yield items lazily — memory-friendly for large datasets:

\`\`\`python
total_views = sum(p["views"] for p in posts if p["published"])
\`\`\`

## \`match\` / \`case\` (Python 3.10+)

Structural pattern matching replaces long \`if/elif\` chains for HTTP methods or message types:

\`\`\`python
def handle(event: dict) -> str:
    match event:
        case {"type": "created", "id": post_id}:
            return f"indexed post {post_id}"
        case {"type": "deleted", "id": post_id}:
            return f"removed post {post_id}"
        case _:
            return "ignored"
\`\`\`

## When not to use comprehensions

If logic spans multiple lines or side effects (logging, DB writes), a plain \`for\` loop is clearer. Readability beats cleverness in backend code reviewed by teammates.

## Practice

1. Given a list of HTTP status codes, build a dict mapping each code to \`"ok"\`, \`"redirect"\`, \`"error"\`, or \`"unknown"\`.
2. Filter published posts with a list comprehension; compute total word count with a generator expression.
3. Rewrite a nested \`if\` tree as guard clauses in a function that validates API query parameters.

Solid control flow keeps handlers small and makes error paths obvious — critical before you wire up databases and external APIs.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "functions-modules",
    title: "Functions, Modules, and Packages",
    description:
      "Organize code with functions, imports, and packages — how real Python projects stay maintainable.",
    level: "beginner",
    minutes: 20,
    content: `## Defining functions

Use \`def\` to create reusable blocks:

\`\`\`python
def slugify(title: str) -> str:
    cleaned = title.lower().strip()
    return "-".join(cleaned.split())
\`\`\`

Functions are first-class — you can pass them as arguments:

\`\`\`python
def apply_twice(fn, value):
    return fn(fn(value))

apply_twice(lambda x: x + 1, 3)  # 5
\`\`\`

## Parameters: positional, keyword, defaults, \`*args\`, \`**kwargs\`

\`\`\`python
def connect(host: str, port: int = 5432, *, ssl: bool = True) -> None:
    ...

connect("db.example.com")           # positional + default port
connect("db.example.com", ssl=False)  # keyword-only after *
\`\`\`

Variadic parameters collect extra arguments:

\`\`\`python
def log(level: str, *messages: str) -> None:
    for msg in messages:
        print(f"[{level}] {msg}")

def build_url(base: str, **query: str) -> str:
    params = "&".join(f"{k}={v}" for k, v in query.items())
    return f"{base}?{params}"
\`\`\`

Unpacking at call time mirrors collection:

\`\`\`python
args = ("localhost", 5432)
connect(*args)
opts = {"ssl": False}
connect("localhost", **opts)
\`\`\`

## Return values

Return a single object; use tuples for multiple values:

\`\`\`python
def parse_range(header: str) -> tuple[int, int] | None:
    if not header.startswith("bytes="):
        return None
    start, end = header[6:].split("-")
    return int(start), int(end)
\`\`\`

Explicit \`return None\` is optional but can clarify intent at the end of a function.

## Modules and imports

Each \`.py\` file is a **module**. Import styles:

\`\`\`python
import os
from pathlib import Path
from datetime import datetime, timezone
from myapp.utils import slugify as make_slug
\`\`\`

Avoid \`from module import *\` — it pollutes namespaces and breaks static analysis.

The **module search path** (\`sys.path\`) includes the current directory, site-packages, and paths you set via \`PYTHONPATH\`. Packages are directories with \`__init__.py\` (or namespace packages in modern layouts).

## Project layout example

\`\`\`text
my_service/
  pyproject.toml
  src/
    my_service/
      __init__.py
      main.py
      routes/
        __init__.py
        posts.py
      db/
        connection.py
\`\`\`

Run as a module so imports resolve consistently:

\`\`\`bash
python -m my_service.main
\`\`\`

## \`__init__.py\` and public API

Re-export symbols your package wants to expose:

\`\`\`python
# my_service/routes/__init__.py
from .posts import router as posts_router

__all__ = ["posts_router"]
\`\`\`

## Docstrings and \`help()\`

Triple-quoted strings right after \`def\` document behavior:

\`\`\`python
def retry(fn, times: int = 3) -> object:
    """Call fn up to times, re-raising the last exception."""
    ...
\`\`\`

Tools like Sphinx and IDE hovers read these strings.

## Lambdas and small helpers

Anonymous functions suit one-liners passed to \`sorted\`, \`map\`, or \`max\`:

\`\`\`python
posts.sort(key=lambda p: p["created_at"], reverse=True)
\`\`\`

Prefer a named \`def\` when the logic grows beyond a single expression — future you (and reviewers) will thank you.

## Testing imports in isolation

Run a module directly to smoke-test its public API:

\`\`\`bash
python -m my_service.routes.posts
\`\`\`

Keep side effects out of import time: do not connect to the database when a file is merely imported. Initialization belongs in \`main()\` or an app factory.

## Practice

1. Split a monolithic script into \`config.py\`, \`db.py\`, and \`main.py\` with clear imports.
2. Write a function \`paginate(items, page, per_page)\` returning \`(slice, total_pages)\`.
3. Add type hints and a one-line docstring to every public function in your mini package.

Clean modules are the difference between a hacky script and a service your team can extend.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "data-structures",
    title: "Lists, Dicts, Sets, and Tuples",
    description:
      "Deep dive into Python's core collections — choosing the right structure makes backend code faster and clearer.",
    level: "intermediate",
    minutes: 22,
    content: `## Lists: ordered, mutable sequences

Lists hold ordered items and allow duplicates:

\`\`\`python
posts = ["intro", "syntax", "control-flow"]
posts.append("functions")
posts.insert(0, "welcome")
last = posts.pop()
\`\`\`

Slicing returns a new list (shallow copy of references):

\`\`\`python
first_three = posts[:3]
reversed_posts = posts[::-1]
\`\`\`

Sorting mutates or copies:

\`\`\`python
sorted_by_title = sorted(posts, key=str.lower)
posts.sort(key=len)
\`\`\`

**Time complexity:** index access is O(1); insert/delete at the front is O(n). For queue-heavy workloads consider \`collections.deque\`.

## Dicts: key-value maps

Dicts preserve insertion order (Python 3.7+) and offer O(1) average lookup:

\`\`\`python
user = {"id": 1, "email": "dev@example.com", "roles": ["admin"]}
user["last_login"] = "2026-06-25"
email = user.get("email", "")
\`\`\`

Safe defaults without mutating shared sentinels:

\`\`\`python
from collections import defaultdict

tags_by_post = defaultdict(list)
tags_by_post[42].append("python")
\`\`\`

Merge dicts (Python 3.9+):

\`\`\`python
defaults = {"timeout": 30, "retries": 3}
overrides = {"retries": 5}
config = defaults | overrides
\`\`\`

Dict comprehensions and \`.items()\` power config transforms and JSON serialization.

## Sets: unique membership

Sets store hashable items with no duplicates — ideal for tags, permissions, and deduplication:

\`\`\`python
viewed = {"post-1", "post-2"}
new_views = {"post-2", "post-3"}
unseen = new_views - viewed
overlap = viewed & new_views
\`\`\`

Use \`frozenset\` when you need an immutable set as a dict key.

## Tuples: fixed-length records

Tuples are immutable sequences — great for lightweight records and function returns:

\`\`\`python
PostRow = tuple[int, str, bool]
row: PostRow = (1, "Hello", True)
post_id, title, published = row
\`\`\`

Named tuples and \`dataclasses\` add field names when tuples grow beyond two or three elements.

## Choosing the right structure

| Need | Structure |
|------|-----------|
| Ordered log of events | \`list\` |
| Lookup by ID or key | \`dict\` |
| Unique tags / IDs | \`set\` |
| Fixed record from DB row | \`tuple\` or \`dataclass\` |
| Count occurrences | \`collections.Counter\` |
| LRU cache | \`functools.lru_cache\` or \`OrderedDict\` patterns |

## Copying vs aliasing

Assignment shares references:

\`\`\`python
a = [1, 2, 3]
b = a
b.append(4)  # a is also [1, 2, 3, 4]
\`\`\`

Use \`copy.copy\` for shallow copies and \`copy.deepcopy\` when nested objects must diverge.

## JSON and collections

\`json.loads\` returns dict/list primitives; serialize back with \`json.dumps(obj, default=str)\` for dates. Validate shape before trusting external JSON in production.

## Practice

1. Parse a list of dicts representing posts; build a dict keyed by \`slug\` and a set of all unique tags.
2. Given two role lists for users, compute union and intersection without loops (set operators).
3. Return \`(items, total_count)\` as a tuple from a pagination helper and unpack at the call site.

The collections you pick show up in every cache layer, ORM result, and API response transformer.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "files-errors",
    title: "Files, Paths, and Error Handling",
    description:
      "Read and write files safely with pathlib, and handle failures with try/except — essential for robust services.",
    level: "intermediate",
    minutes: 20,
    content: `## Reading and writing text files

Always specify encoding for text files:

\`\`\`python
with open("config.json", "r", encoding="utf-8") as f:
    data = f.read()

with open("output.log", "a", encoding="utf-8") as f:
    f.write("job finished\\n")
\`\`\`

The \`with\` statement ensures files close even when exceptions occur — never rely on \`close()\` in a \`finally\` block unless you have a special case.

Line-by-line processing keeps memory flat for large logs:

\`\`\`python
with open("access.log", encoding="utf-8") as f:
    for line in f:
        if " 500 " in line:
            print(line.strip())
\`\`\`

## pathlib: object-oriented paths

\`pathlib.Path\` replaces string concatenation:

\`\`\`python
from pathlib import Path

root = Path(__file__).resolve().parent
config_path = root / "config" / "app.toml"

if config_path.exists():
    text = config_path.read_text(encoding="utf-8")

uploads = root / "uploads"
uploads.mkdir(parents=True, exist_ok=True)
\`\`\`

Cross-platform paths, globbing, and stat in one API:

\`\`\`python
for py_file in root.glob("**/*.py"):
    print(py_file.relative_to(root))
\`\`\`

## Binary files

Use \`"rb"\` / \`"wb"\` for images, PDFs, and protobuf:

\`\`\`python
data = Path("logo.png").read_bytes()
Path("copy.png").write_bytes(data)
\`\`\`

## Exceptions: try / except / else / finally

Catch specific exceptions you can handle; let unexpected ones propagate:

\`\`\`python
import json
from pathlib import Path

def load_config(path: Path) -> dict:
    try:
        raw = path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise RuntimeError(f"missing config: {path}") from exc

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"invalid JSON in {path}") from exc
\`\`\`

- \`else\` runs if no exception was raised in \`try\`.
- \`finally\` always runs — useful for releasing locks (prefer context managers when possible).

Re-raise with \`raise\` alone or chain with \`from\` to preserve context in logs.

## Custom exceptions

Domain errors clarify API layers:

\`\`\`python
class NotFoundError(Exception):
    def __init__(self, resource: str, id: int) -> None:
        super().__init__(f"{resource} {id} not found")
        self.resource = resource
        self.id = id
\`\`\`

Map these to HTTP 404 in your web framework's exception handler.

## Logging failures

Print debugging is fine in scripts; services should use the \`logging\` module:

\`\`\`python
import logging

log = logging.getLogger(__name__)

try:
    process_batch()
except Exception:
    log.exception("batch failed")
    raise
\`\`\`

\`log.exception\` includes the stack trace automatically.

## Atomic writes

Avoid half-written config on crash — write to a temp file then replace:

\`\`\`python
import tempfile
import os

def atomic_write(path: Path, content: str) -> None:
    fd, tmp = tempfile.mkstemp(dir=path.parent, text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        os.replace(tmp, path)
    except Exception:
        os.unlink(tmp)
        raise
\`\`\`

## Practice

1. Load a JSON config with pathlib; raise a clear error if the file is missing or malformed.
2. Scan a directory tree and count \`.py\` files vs total bytes.
3. Wrap a flaky network call in retry logic that catches \`TimeoutError\` only.

Files and errors touch every deploy script, log shipper, and migration runner you will maintain.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "venv-pip",
    title: "Virtual Environments and pip",
    description:
      "Isolate project dependencies with venv, pin versions in requirements.txt, and install packages safely.",
    level: "beginner",
    minutes: 15,
    content: `## Why virtual environments matter

System Python is shared by the OS and other tools. Installing packages globally can break system utilities or create version conflicts between projects. A **virtual environment** (\`venv\`) gives each project its own \`python\` and \`site-packages\` directory.

Rule of thumb: **one venv per application or repo**.

## Creating and activating a venv

From your project root:

\`\`\`bash
python3 -m venv .venv
\`\`\`

Activate:

\`\`\`bash
# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1
\`\`\`

Your prompt may show \`(.venv)\`. Confirm:

\`\`\`bash
which python   # points inside .venv
pip --version
\`\`\`

Deactivate with \`deactivate\`. Add \`.venv/\` to \`.gitignore\` — commit lockfiles, not the environment itself.

## Installing packages with pip

\`\`\`bash
pip install requests psycopg[binary] python-dotenv
pip install -r requirements.txt
\`\`\`

Upgrade pip inside the venv first on fresh installs:

\`\`\`bash
pip install --upgrade pip
\`\`\`

List installed packages:

\`\`\`bash
pip list
pip show requests
\`\`\`

## requirements.txt

Pin dependencies for reproducible builds:

\`\`\`text
requests==2.32.3
psycopg[binary]==3.2.1
python-dotenv==1.0.1
\`\`\`

Generate from the current environment:

\`\`\`bash
pip freeze > requirements.txt
\`\`\`

For libraries (not apps), prefer ranges in \`pyproject.toml\`; for deployable services, exact pins reduce surprises.

## pyproject.toml (modern standard)

Many projects define metadata and dependencies in \`pyproject.toml\`:

\`\`\`toml
[project]
name = "devblog-api"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.110",
  "uvicorn[standard]>=0.27",
]
\`\`\`

Install editable local packages:

\`\`\`bash
pip install -e .
\`\`\`

Tools like **uv**, **poetry**, and **pip-tools** resolve and lock transitive dependencies — worth adopting as projects grow.

## Dev vs production dependencies

Split test and lint tools:

\`\`\`text
# requirements-dev.txt
-r requirements.txt
pytest==8.2.0
ruff==0.4.4
\`\`\`

CI installs both; production images install only runtime requirements.

## Docker and venv

Containers often skip venv and install into the image's global Python — isolation comes from the container. Locally, still use venv so your laptop matches team conventions.

## Security hygiene

- Pin versions and review upgrades.
- Run \`pip audit\` or use Dependabot.
- Never commit secrets; use env vars (next chapters).

## Troubleshooting pip and venv

| Problem | Fix |
|---------|-----|
| \`pip: command not found\` | Activate venv or use \`python -m pip\` |
| Wrong package version installed | Check \`which pip\` points inside \`.venv\` |
| \`externally-managed-environment\` (Linux) | Use venv; do not \`pip install\` into system Python |
| Stale bytecode after upgrade | Remove \`__pycache__\` or reinstall package |

When CI fails on \`pip install -r requirements.txt\`, compare lockfile hashes and Python version (\`requires-python\` in \`pyproject.toml\`) with the runner image.

## Practice

1. Create a venv, install \`requests\` and \`httpx\`, freeze to \`requirements.txt\`.
2. Delete the venv, recreate it, and reinstall from the file — confirm identical versions.
3. Add a \`Makefile\` or script target \`make install\` that creates venv and installs deps.

Dependency hygiene prevents "works on my machine" when you ship Python backends to staging and production.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "http-requests",
    title: "HTTP Requests with the requests Library",
    description:
      "Call REST APIs with GET and POST, handle headers, JSON bodies, timeouts, and common response patterns.",
    level: "intermediate",
    minutes: 18,
    content: `## Installing and importing

Inside your activated venv:

\`\`\`bash
pip install requests
\`\`\`

\`\`\`python
import requests
\`\`\`

The \`requests\` library wraps Python's lower-level \`urllib\` with a simpler API — the default choice for scripts and many backend integrations.

## GET requests

Fetch a resource and inspect the response:

\`\`\`python
import requests

response = requests.get(
    "https://api.example.com/posts",
    params={"page": 1, "limit": 10},
    timeout=10,
)

response.raise_for_status()  # raises HTTPError for 4xx/5xx
posts = response.json()
print(posts[0]["title"])
\`\`\`

Key attributes:

| Attribute | Meaning |
|-----------|---------|
| \`status_code\` | HTTP status (200, 404, …) |
| \`headers\` | Response headers (case-insensitive dict) |
| \`text\` | Body as str |
| \`content\` | Body as bytes |
| \`json()\` | Parse JSON body |

Always set **timeouts** — default is wait forever, which stalls workers.

## POST with JSON

\`\`\`python
payload = {"title": "New post", "published": False}

response = requests.post(
    "https://api.example.com/posts",
    json=payload,
    headers={"Authorization": "Bearer TOKEN"},
    timeout=10,
)

created = response.json()
print(created["id"])
\`\`\`

Use \`json=\` for dict bodies; the library sets \`Content-Type: application/json\`. For form uploads use \`data=\` or \`files=\`.

## Sessions and connection reuse

\`requests.Session\` keeps cookies and reuses TCP connections:

\`\`\`python
session = requests.Session()
session.headers.update({"User-Agent": "devblog-bot/1.0"})

login = session.post("https://api.example.com/auth/login", json={...})
posts = session.get("https://api.example.com/posts")
\`\`\`

Close sessions in long-running processes or use context managers where supported.

## Error handling

Distinguish network errors from HTTP errors:

\`\`\`python
from requests.exceptions import RequestException, Timeout, HTTPError

try:
    r = requests.get(url, timeout=5)
    r.raise_for_status()
except Timeout:
    log.warning("upstream slow")
except HTTPError as exc:
    log.error("bad status %s", exc.response.status_code)
except RequestException as exc:
    log.exception("request failed: %s", exc)
\`\`\`

Retry idempotent GETs with exponential backoff; use caution retrying POST unless the API is idempotent-key safe.

## Authentication patterns

\`\`\`python
# Bearer token
headers = {"Authorization": f"Bearer {token}"}

# Basic auth
requests.get(url, auth=("user", "pass"))

# API key in header
headers = {"X-API-Key": api_key}
\`\`\`

Never hardcode tokens — load from environment variables (covered next chapter).

## Working with response headers and pagination

APIs often expose metadata in headers:

\`\`\`python
response = requests.get(url, timeout=10)
response.raise_for_status()

rate_remaining = response.headers.get("X-RateLimit-Remaining")
content_type = response.headers.get("Content-Type", "")

if "application/json" not in content_type:
    raise ValueError("expected JSON response")
\`\`\`

Cursor-based pagination loops until no next page:

\`\`\`python
cursor = None
all_items = []

while True:
    params = {"limit": 50}
    if cursor:
        params["cursor"] = cursor
    r = requests.get(f"{base}/items", params=params, timeout=10)
    r.raise_for_status()
    body = r.json()
    all_items.extend(body["items"])
    cursor = body.get("next_cursor")
    if not cursor:
        break
\`\`\`

Log status codes and latency for every outbound call — it simplifies debugging flaky integrations.

## When to use httpx or aiohttp

\`requests\` is **synchronous** — fine for scripts and WSGI apps. For async FastAPI services, prefer **httpx** AsyncClient or **aiohttp** to avoid blocking the event loop.

## Practice

1. GET a public API (e.g. JSON placeholder), paginate with \`params\`, and print titles.
2. POST a new resource and assert \`201\` or \`200\` with \`raise_for_status\`.
3. Wrap calls in a small \`ApiClient\` class that sets base URL, timeout, and default headers.

HTTP is the lingua franca of microservices — comfortable \`requests\` usage unlocks integrations, webhooks, and health checks.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "env-config",
    title: "Environment Variables and Configuration",
    description:
      "Load secrets and settings from .env files and os.getenv — the standard pattern for twelve-factor apps.",
    level: "intermediate",
    minutes: 14,
    content: `## Configuration in production

Backend services read **environment variables** for database URLs, API keys, feature flags, and port bindings. This keeps secrets out of source control and lets the same container image run in staging and production with different config.

The [twelve-factor app](https://12factor.net/config) guideline: store config in the environment, not in code.

## os.getenv and os.environ

\`\`\`python
import os

database_url = os.getenv("DATABASE_URL")
if not database_url:
    raise RuntimeError("DATABASE_URL is required")

debug = os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")
port = int(os.getenv("PORT", "8000"))
\`\`\`

\`os.getenv(key, default)\` returns \`None\` when unset unless you provide a default. \`os.environ[key]\` raises \`KeyError\` if missing — useful when a variable is mandatory.

Convert types explicitly; environment values are always strings.

## python-dotenv for local development

Commit a **\`.env.example\`** with placeholder keys; each developer copies to \`.env\` (gitignored):

\`\`\`text
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/devblog
SECRET_KEY=change-me-in-production
DEBUG=true
\`\`\`

Load at application startup:

\`\`\`python
from dotenv import load_dotenv

load_dotenv()  # reads .env from cwd or parent paths

import os
secret = os.environ["SECRET_KEY"]
\`\`\`

\`load_dotenv\` does not override existing environment variables by default — production values set by your platform take precedence.

## Structuring settings

Centralize config in one module or dataclass:

\`\`\`python
from dataclasses import dataclass
import os

@dataclass(frozen=True)
class Settings:
    database_url: str
    secret_key: str
    debug: bool

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            database_url=os.environ["DATABASE_URL"],
            secret_key=os.environ["SECRET_KEY"],
            debug=os.getenv("DEBUG", "").lower() == "true",
        )

settings = Settings.from_env()
\`\`\`

Libraries like **Pydantic Settings** validate types and support \`.env\` files with schema documentation — common in FastAPI projects.

## Secrets vs non-secrets

| Variable | Example | Notes |
|----------|---------|-------|
| Secret | \`SECRET_KEY\`, \`API_TOKEN\` | Never log or expose in errors |
| Config | \`PORT\`, \`LOG_LEVEL\` | Safe in logs |
| Feature flag | \`ENABLE_BETA\` | Toggle behavior per env |

Redact secrets in structured logs:

\`\`\`python
def safe_config(cfg: dict) -> dict:
    redacted = {**cfg}
    for key in ("password", "secret", "token"):
        if key in redacted:
            redacted[key] = "***"
    return redacted
\`\`\`

## Deployment platforms

Heroku, Railway, Fly.io, Kubernetes, and Vercel inject env vars at runtime. Local \`.env\` mimics that workflow. CI pipelines set test DATABASE_URL pointing to ephemeral databases.

## Common mistakes

- Committing \`.env\` with real credentials — use secret scanning in CI.
- Assuming \`.env\` loads in production — many hosts disable it; set vars in the dashboard.
- Using \`DEBUG=true\` in production — exposes stack traces and insecure cookies.

## Practice

1. Create \`.env.example\` and load \`DATABASE_URL\` with python-dotenv in a small script.
2. Build a \`Settings\` dataclass with validation that fails fast on missing required keys.
3. Log your config at startup with secrets redacted.

Environment-driven config is how Python backends stay portable from laptop to cloud without code changes.
`,
  },
  {
    pathSlug: "python-backend",
    slug: "sql-basics",
    title: "SQL Basics from Python",
    description:
      "Connect to PostgreSQL, run parameterized queries, and handle rows safely with psycopg — patterns that apply to any SQL database.",
    level: "intermediate",
    minutes: 25,
    content: `## Why SQL from Python

Most backend services persist data in relational databases. Python does not speak SQL over the network by itself — you use a **DB driver** (psycopg for PostgreSQL, sqlite3 in the stdlib, etc.) or an **ORM** (SQLAlchemy, Django ORM). Understanding raw SQL plus a driver keeps debugging and migrations approachable.

This chapter uses **PostgreSQL** and **psycopg 3**; the SQL and parameter patterns transfer to MySQL, SQLite, and async drivers.

## Install psycopg

\`\`\`bash
pip install "psycopg[binary]"
\`\`\`

Connection string format (often from \`DATABASE_URL\`):

\`\`\`text
postgresql://user:password@localhost:5432/devblog
\`\`\`

## Connecting and context managers

\`\`\`python
import os
import psycopg

DATABASE_URL = os.environ["DATABASE_URL"]

with psycopg.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        print(cur.fetchone())
\`\`\`

Context managers commit on success and roll back on exception when using transaction blocks — always prefer them over manual \`conn.close()\` in \`finally\`.

## Parameterized queries (never string-format SQL)

**SQL injection** happens when user input is interpolated into queries. Use placeholders:

\`\`\`python
slug = request_slug  # untrusted input

cur.execute(
    "SELECT id, title, body FROM posts WHERE slug = %s AND published = true",
    (slug,),
)
row = cur.fetchone()
\`\`\`

psycopg uses \`%s\` placeholders regardless of PostgreSQL's \`$\` syntax internally. Pass parameters as a tuple or dict — the driver escapes values safely.

## Fetching results

\`\`\`python
cur.execute("SELECT id, title FROM posts ORDER BY created_at DESC LIMIT 10")
rows = cur.fetchall()  # list of tuples

for post_id, title in rows:
    print(post_id, title)

cur.execute("SELECT COUNT(*) FROM posts WHERE published = true")
(count,) = cur.fetchone()
\`\`\`

Dict-like rows with \`row_factory\`:

\`\`\`python
from psycopg.rows import dict_row

with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM posts WHERE id = %s", (42,))
        post = cur.fetchone()
        print(post["title"])
\`\`\`

## Inserts and returning IDs

\`\`\`python
cur.execute(
    """
    INSERT INTO posts (title, slug, published)
    VALUES (%s, %s, %s)
    RETURNING id
    """,
    ("Hello world", "hello-world", True),
)
new_id = cur.fetchone()[0]
conn.commit()  # if not using autocommit context
\`\`\`

Wrap related statements in a **transaction** so partial failures roll back entirely.

## Generic SQL concepts

Whether you use psycopg, sqlite3, or SQLAlchemy Core, the same ideas apply:

\`\`\`sql
-- Filter and sort
SELECT id, title FROM posts
WHERE published = true
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;

-- Join authors
SELECT p.title, a.name
FROM posts p
INNER JOIN authors a ON a.id = p.author_id;

-- Aggregate
SELECT status, COUNT(*) FROM posts GROUP BY status;
\`\`\`

Use migrations (Alembic, Flyway, raw SQL files) to evolve schema — never mutate production tables by hand without a plan.

## sqlite3 for local prototypes

The standard library includes SQLite — zero setup for learning:

\`\`\`python
import sqlite3

with sqlite3.connect("dev.db") as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, title TEXT)")
    conn.execute("INSERT INTO posts (title) VALUES (?)", ("Draft",))
\`\`\`

Placeholders are \`?\` instead of \`%s\` — driver-specific detail to remember.

## Connection pooling

Web servers open many short-lived requests. Use a **pool** (psycopg_pool, SQLAlchemy engine) instead of connecting per request. Pool size tuning depends on worker count and PostgreSQL \`max_connections\`.

## Practice

1. Connect to a local Postgres (or SQLite) database and list tables in \`information_schema\` or \`sqlite_master\`.
2. Insert a post with parameterized SQL and read back the \`RETURNING id\`.
3. Write a function \`get_post_by_slug(slug: str)\` that returns \`None\` when no row exists — no exception for missing data.

You now have the Python backend spine: language basics, tooling, HTTP, config, and database access. Combine these in a small API or worker and iterate from there.
`,
  },
];
