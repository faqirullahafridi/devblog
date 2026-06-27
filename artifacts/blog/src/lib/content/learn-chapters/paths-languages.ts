import { buildPathChapters, introChapter, capstoneChapter } from "./path-factory";

export const languagesPathChapters = [
  ...buildPathChapters("typescript-fundamentals", [
    introChapter(
      "typescript-fundamentals",
      "TypeScript",
      "TypeScript is a typed superset of JavaScript that compiles to plain JS. It adds static types, interfaces, generics, and tooling-friendly metadata while staying compatible with existing JavaScript libraries. Major frameworks like React, Angular, and Node backends adopt TypeScript because it catches bugs at compile time and makes large codebases easier to refactor.",
      [
        "Annotate variables, functions, and objects with precise types",
        "Model data with interfaces, unions, and generics",
        "Configure the compiler with tsconfig.json for strict, production-ready projects",
        "Type React components, props, and hooks safely",
        "Build a fully typed HTTP API client as a capstone project",
      ],
      "Install Node.js 18+ from [nodejs.org](https://nodejs.org). Create a project folder and run `npm init -y && npm install typescript --save-dev`. Initialize TypeScript with `npx tsc --init`. Add a `src/index.ts` file, compile with `npx tsc`, and run output with `node dist/index.js`. For faster iteration, use `npx tsx src/index.ts` or enable watch mode: `npx tsc --watch`.",
    ),
    {
      slug: "types",
      title: "Types & Type Annotations",
      description: "Primitives, inference, functions, and narrowing with TypeScript's type system.",
      level: "beginner",
      minutes: 20,
      content: `## Why types matter

JavaScript is dynamically typed: a variable can hold any value at runtime. TypeScript adds **optional static types** checked before your code runs. When you declare \`let count: number = 0\`, the compiler ensures you never assign a string to \`count\` accidentally. This catches an entire class of bugs during development instead of in production.

Types also serve as **living documentation**. Function signatures tell callers exactly what arguments are required and what comes back, without reading the implementation.

## Primitive and object types

\`\`\`typescript
let title: string = "DevBlog";
let views: number = 42;
let published: boolean = true;
let tags: string[] = ["typescript", "web"];
let meta: { author: string; draft: boolean } = { author: "you", draft: false };
\`\`\`

TypeScript also has \`null\` and \`undefined\`, combined as \`void\` for functions that return nothing, and \`never\` for functions that never return (throw or infinite loop).

## Type inference

You do not need annotations everywhere. TypeScript **infers** types from initial values:

\`\`\`typescript
const port = 3000;        // inferred as number
const routes = ["/", "/api"]; // string[]
\`\`\`

Inference works best when you initialize variables immediately. For function parameters, you usually annotate explicitly because there is no initial value to infer from.

## Function types

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}\`;
}

const add = (a: number, b: number): number => a + b;
\`\`\`

Use \`?\` for optional parameters: \`function log(msg: string, level?: string)\`. Default parameters work like JavaScript but also inform the type checker.

## Narrowing

When a value could be more than one type, **narrow** it with checks:

\`\`\`typescript
function printId(id: string | number) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}
\`\`\`

The \`typeof\`, \`instanceof\`, and truthiness checks all refine types inside conditional blocks.

## Practice

1. Create a \`Post\`-shaped object with \`title\`, \`slug\`, and \`published\` fields — let inference fill in types where possible.
2. Write a function \`formatViews(n: number): string\` that returns \`"1.2k"\` style strings for large numbers.
3. Enable \`"strict": true\` in tsconfig and fix any new errors that appear.`,
    },
    {
      slug: "interfaces",
      title: "Interfaces & Type Aliases",
      description: "Model object shapes, extend contracts, and choose between interface and type.",
      level: "beginner",
      minutes: 18,
      content: `## Describing object shapes

An **interface** names the structure of an object:

\`\`\`typescript
interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt?: string; // optional
  readonly createdAt: string; // cannot reassign
}

const post: Post = {
  id: 1,
  title: "Hello TypeScript",
  slug: "hello-typescript",
  createdAt: "2026-01-01",
};
\`\`\`

Interfaces excel at describing **contracts** — what a function expects or what an API returns.

## Extending interfaces

Reuse and compose shapes with \`extends\`:

\`\`\`typescript
interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

interface BlogPost extends Timestamps {
  title: string;
  body: string;
}
\`\`\`

You can extend multiple interfaces: \`interface AdminPost extends BlogPost, Auditable { ... }\`.

## Type aliases

\`type\` creates an alias for any type, not only objects:

\`\`\`typescript
type PostId = number | string;
type PostStatus = "draft" | "published" | "archived";
type PostHandler = (post: Post) => void;
\`\`\`

**Rule of thumb:** use \`interface\` for object shapes you may extend; use \`type\` for unions, tuples, and mapped types.

## Index signatures and readonly arrays

\`\`\`typescript
interface StringMap {
  [key: string]: string;
}

type ReadonlyPosts = readonly Post[];
\`\`\`

Readonly modifiers prevent accidental mutation — valuable when passing data through React props or shared service layers.

## Implementing interfaces in classes

\`\`\`typescript
interface Repository<T> {
  findById(id: number): T | undefined;
  save(item: T): void;
}

class PostRepository implements Repository<Post> {
  findById(id: number) { /* ... */ }
  save(item: Post) { /* ... */ }
}
\`\`\`

The compiler verifies every required member exists with compatible types.

## Practice

1. Define a \`Comment\` interface with \`id\`, \`postId\`, \`author\`, and \`body\`.
2. Create a \`type CommentId = number\` alias and use it in a function signature.
3. Extend \`Comment\` with an optional \`editedAt\` field in a new \`EditableComment\` interface.`,
    },
    {
      slug: "generics",
      title: "Generics",
      description: "Write reusable functions and data structures that work across types safely.",
      level: "intermediate",
      minutes: 22,
      content: `## The problem generics solve

Without generics, you either duplicate code for every type or fall back to \`any\`, losing type safety. **Generics** let you write functions and types that work with **any** type while preserving the relationship between inputs and outputs.

\`\`\`typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);     // number | undefined
const s = first(["a", "b"]);    // string | undefined
\`\`\`

The caller determines \`T\`; the compiler tracks it through the return type.

## Generic interfaces

API wrappers commonly use generic interfaces:

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

async function fetchPost(id: number): Promise<ApiResponse<Post>> {
  const res = await fetch(\`/api/posts/\${id}\`);
  return res.json();
}
\`\`\`

Callers know \`data\` is a \`Post\`, not an unknown blob.

## Constraints

Sometimes a generic must satisfy a minimum shape:

\`\`\`typescript
function getId<T extends { id: number }>(item: T): number {
  return item.id;
}
\`\`\`

\`extends\` limits \`T\` to types with an \`id\` property. You can constrain to \`keyof\`, string literals, or multiple interfaces.

## Generic defaults

\`\`\`typescript
interface Paginated<T = unknown> {
  items: T[];
  page: number;
  total: number;
}
\`\`\`

If the caller omits \`T\`, it defaults to \`unknown\`.

## Utility types preview

TypeScript ships built-in generic utilities: \`Partial<T>\`, \`Pick<T, K>\`, \`Omit<T, K>\`, \`Record<K, V>\`. They transform existing types without manual duplication — essential for form DTOs and patch endpoints.

## Practice

1. Write \`function wrap<T>(value: T): { value: T }\` and verify inference at the call site.
2. Create \`function pluck<T, K extends keyof T>(obj: T, key: K): T[K]\`.
3. Use \`Partial<Post>\` for an update payload type in a mock \`updatePost\` function.`,
    },
    {
      slug: "unions",
      title: "Unions & Discriminated Unions",
      description: "Model multiple possible shapes and narrow them with tagged fields.",
      level: "intermediate",
      minutes: 20,
      content: `## Union types

A **union** means a value can be one of several types:

\`\`\`typescript
type Result = "success" | "error";
type Id = string | number;

function padLeft(value: string | number): string {
  const str = typeof value === "number" ? value.toString() : value;
  return \`  \${str}\`;
}
\`\`\`

String literal unions model finite sets of allowed values — perfect for status fields and event names.

## Discriminated unions

When objects share a **discriminant** field (usually \`kind\` or \`type\`), TypeScript narrows precisely in \`switch\` statements:

\`\`\`typescript
type ApiResult =
  | { status: "loading" }
  | { status: "success"; data: Post[] }
  | { status: "error"; message: string };

function render(result: ApiResult) {
  switch (result.status) {
    case "loading":
      return "Loading…";
    case "success":
      return result.data.length; // data exists here
    case "error":
      return result.message;
  }
}
\`\`\`

Each branch knows exactly which fields are available — no optional chaining guesswork.

## Exhaustiveness checking

Add a \`never\` check to catch missing cases when you add a new variant:

\`\`\`typescript
default: {
  const _exhaustive: never = result;
  return _exhaustive;
}
\`\`\`

If you add \`{ status: "empty" }\` to the union but forget a \`case\`, the compiler errors on the assignment to \`never\`.

## Union vs intersection

- **Union (\`A | B\`)** — value is A **or** B
- **Intersection (\`A & B\`)** — value is A **and** B simultaneously

Intersections merge object shapes; unions represent alternatives.

## Practice

1. Model a \`Notification\` as email | push | in-app using discriminated unions.
2. Write a \`handleNotification\` function with exhaustive \`switch\`.
3. Replace a \`string\` status field with a literal union \`"draft" | "published"\` in an existing interface.`,
    },
    {
      slug: "tsconfig",
      title: "tsconfig & Compiler Options",
      description: "Configure strictness, module resolution, paths, and build output for real projects.",
      level: "intermediate",
      minutes: 18,
      content: `## What tsconfig.json controls

Running \`tsc --init\` creates a **tsconfig.json** that tells the TypeScript compiler how to type-check and emit JavaScript. Every serious project commits this file so all developers and CI use identical rules.

Key top-level sections:

- \`compilerOptions\` — language level, output directory, strictness
- \`include\` / \`exclude\` — which files to compile
- \`extends\` — inherit from a shared base config

## Strict mode essentials

Enable these for production code:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}
\`\`\`

\`strict\` enables \`strictNullChecks\`, \`noImplicitAny\`, and related flags. \`noUncheckedIndexedAccess\` makes \`arr[i]\` return \`T | undefined\` — annoying at first, but prevents out-of-bounds bugs.

## Module resolution

\`\`\`json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",
    "outDir": "dist",
    "rootDir": "src"
  }
}
\`\`\`

For Node ESM projects, set \`"module": "NodeNext"\` and \`"moduleResolution": "NodeNext"\`. Bundler projects (Vite, esbuild) use \`bundler\` resolution.

## Path aliases

Map short imports to folders:

\`\`\`json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
\`\`\`

Your bundler must mirror these aliases in its config (e.g. Vite \`resolve.alias\`).

## Project references

Monorepos split code into packages linked via \`references\` and \`composite: true\`. \`tsc --build\` compiles dependencies in order — common in libraries shared between frontend and backend.

## Practice

1. Turn on \`strict\` and list every new error in a scratch project.
2. Add \`outDir\` and \`rootDir\`, then verify \`dist/\` mirrors \`src/\`.
3. Configure a \`@/\` path alias and import a module with it.`,
    },
    {
      slug: "react-ts",
      title: "TypeScript with React",
      description: "Type components, props, events, hooks, and context in React applications.",
      level: "intermediate",
      minutes: 25,
      content: `## Typing function components

React 18+ function components return \`JSX.Element\` (or \`React.ReactNode\` for broader children):

\`\`\`tsx
type PostCardProps = {
  title: string;
  slug: string;
  excerpt?: string;
  onSelect?: (slug: string) => void;
};

export function PostCard({ title, slug, excerpt, onSelect }: PostCardProps) {
  return (
    <article onClick={() => onSelect?.(slug)}>
      <h2>{title}</h2>
      {excerpt && <p>{excerpt}</p>}
    </article>
  );
}
\`\`\`

Define props as a \`type\` or \`interface\`; destructure in the parameter list for clarity.

## Children and composition

\`\`\`tsx
type LayoutProps = {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};
\`\`\`

\`ReactNode\` accepts strings, numbers, elements, fragments, and arrays. Use \`React.ReactElement\` when you need a single element guarantee.

## Event handlers

\`\`\`tsx
function SearchForm() {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return <form onSubmit={handleSubmit}><input onChange={handleChange} /></form>;
}
\`\`\`

DOM events are generic over the element type — use the specific event type for accurate \`target\` properties.

## useState and useRef

\`\`\`tsx
const [count, setCount] = useState(0); // inferred number
const [post, setPost] = useState<Post | null>(null);
const inputRef = useRef<HTMLInputElement>(null);
\`\`\`

Provide explicit generics when the initial value does not narrow the full range (\`null\` starts, fetched data later).

## Custom hooks

Return typed tuples or objects from hooks:

\`\`\`tsx
function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  return { posts, loading, setPosts } as const;
}
\`\`\`

Export the return type with \`ReturnType<typeof usePosts>\` when consumers need it.

## Practice

1. Convert a JavaScript component to TypeScript with typed props.
2. Type a \`useFetch<T>(url: string)\` generic hook.
3. Add a discriminated union for async UI state: idle | loading | success | error.`,
    },
    capstoneChapter("typescript-fundamentals", "Typed API Client", [
      "Define interfaces for `Post`, `Comment`, and paginated list responses. Include optional fields and readonly timestamps.",
      "Create a generic `request<T>(path: string, init?: RequestInit): Promise<T>` wrapper that sets JSON headers, parses errors into a typed `ApiError` discriminated union, and throws on non-2xx status codes.",
      "Implement `getPosts(page?: number)`, `getPost(slug: string)`, and `createPost(input: Partial<Post>)` methods on a `BlogApiClient` class. Use generics so each method returns the correct type.",
      "Add runtime validation with a lightweight schema library (e.g. Zod) for one endpoint — compare inferred types with your interfaces.",
      "Write a small CLI or script that fetches posts, prints titles, and handles network failures with exhaustive error rendering. Commit the project with strict tsconfig enabled.",
    ]),
  ]),

  ...buildPathChapters("golang-intro", [
    introChapter(
      "golang-intro",
      "Go",
      "Go (Golang) is a statically typed language from Google designed for simplicity, fast compilation, and excellent concurrency support. It powers infrastructure tools like Docker and Kubernetes, backend microservices, CLIs, and cloud-native APIs. Go trades generics complexity for readable code, garbage collection, and goroutines that make parallel work approachable.",
      [
        "Learn Go syntax, packages, and the standard library layout",
        "Model data with structs and compose behavior with interfaces",
        "Run concurrent work with goroutines and channels",
        "Manage dependencies with Go modules",
        "Build a command-line tool as a capstone project",
      ],
      "Install Go 1.22+ from [go.dev/dl](https://go.dev/dl). Verify with `go version`. Set `GOPATH` if needed (modern Go uses module mode by default). Create a folder, run `go mod init example.com/hello`, and add `main.go` with a `package main` and `func main()`. Run with `go run .` or build a binary with `go build -o hello`.",
    ),
    {
      slug: "syntax",
      title: "Go Syntax Basics",
      description: "Packages, variables, functions, control flow, and error handling idioms.",
      level: "beginner",
      minutes: 20,
      content: `## Package layout

Every Go file starts with \`package name\`. Executable programs use \`package main\` and expose entry via \`func main()\`. Libraries use descriptive package names (\`http\`, \`json\`, \`fmt\`).

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
\`\`\`

Imports are grouped: standard library first, blank line, third-party modules.

## Variables and constants

\`\`\`go
var count int = 0
name := "devblog"       // short declaration, type inferred
const MaxRetries = 3
\`\`\`

Use \`:=\` inside functions for brevity. At package level, use \`var\` or \`const\`.

## Functions and multiple returns

Go functions can return multiple values — the standard pattern for errors:

\`\`\`go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}
\`\`\`

Callers check \`err != nil\` immediately. Ignoring errors is considered a bug.

## Control flow

Go has \`if\`, \`for\` (no \`while\` — \`for\` covers all loops), and \`switch\`. \`if\` may include a short statement:

\`\`\`go
if err := save(); err != nil {
    return err
}
\`\`\`

\`switch\` does not fall through unless you use \`fallthrough\`.

## Zero values

Uninitialized variables get **zero values**: \`0\` for numbers, \`""\` for strings, \`nil\` for pointers, slices, maps, channels, and interfaces. Design APIs knowing empty structs and slices are usable without manual initialization in many cases.

## Practice

1. Write a \`greet(name string) string\` function and call it from \`main\`.
2. Implement \`parsePort(s string) (int, error)\` that rejects non-numeric input.
3. Loop over a slice of strings and print indexed lines with \`for i, v := range items\`.`,
    },
    {
      slug: "structs",
      title: "Structs & Methods",
      description: "Define custom types, attach methods, and use struct embedding for composition.",
      level: "beginner",
      minutes: 18,
      content: `## Defining structs

Structs group fields into a single type:

\`\`\`go
type Post struct {
    ID        int
    Title     string
    Slug      string
    Published bool
}
\`\`\`

Create values with literal syntax or field-by-field:

\`\`\`go
p := Post{Title: "Hello", Slug: "hello", Published: true}
p.ID = 1
\`\`\`

Exported fields (capitalized) are visible outside the package; unexported fields are package-private.

## Methods

Attach behavior with receiver functions:

\`\`\`go
func (p Post) URL(base string) string {
    return base + "/posts/" + p.Slug
}

func (p *Post) Publish() {
    p.Published = true
}
\`\`\`

Use **pointer receivers** when the method mutates state or the struct is large. Use value receivers for small, immutable types.

## Embedding

Go favors **composition over inheritance**. Embed types anonymously to promote fields and methods:

\`\`\`go
type Timestamps struct {
    CreatedAt time.Time
    UpdatedAt time.Time
}

type Article struct {
    Timestamps
    Title string
}
\`\`\`

\`Article\` now has \`CreatedAt\` and \`UpdatedAt\` fields directly accessible.

## JSON tags

Struct tags control encoding:

\`\`\`go
type Post struct {
    Title string \`json:"title"\`
    Draft bool   \`json:"draft,omitempty"\`
}
\`\`\`

Use with \`json.Marshal\` and \`json.Unmarshal\` for API handlers.

## Practice

1. Define a \`User\` struct with \`Name\` and \`Email\`, plus a \`String()\` method.
2. Embed a \`Metadata\` struct into \`Post\` and access embedded fields.
3. Marshal a struct to JSON and print the result.`,
    },
    {
      slug: "interfaces",
      title: "Interfaces & Polymorphism",
      description: "Implicit interface satisfaction, small interfaces, and testing with fakes.",
      level: "intermediate",
      minutes: 20,
      content: `## Implicit interfaces

Go interfaces define **behavior**, not inheritance. A type satisfies an interface automatically if it implements all methods — no \`implements\` keyword:

\`\`\`go
type Reader interface {
    Read(p []byte) (n int, err error)
}
\`\`\`

Anything with a matching \`Read\` method is a \`Reader\`, including \`*os.File\`, \`bytes.Buffer\`, and custom types.

## Small interfaces

The standard library favors tiny interfaces:

\`\`\`go
type Stringer interface {
    String() string
}
\`\`\`

Small interfaces compose well and make mocking easy in tests.

## Accept interfaces, return structs

Design functions to accept interface parameters for flexibility but return concrete types when possible:

\`\`\`go
type PostStore interface {
    Get(slug string) (Post, error)
    Save(p Post) error
}

func NewHandler(store PostStore) http.Handler { /* ... */ }
\`\`\`

Tests pass an in-memory \`fakeStore\`; production passes PostgreSQL-backed implementation.

## Type assertions and type switches

When you need the concrete type behind an interface:

\`\`\`go
var v any = "hello"
s, ok := v.(string)
if !ok { /* not a string */ }
\`\`\`

Type switches handle multiple concrete types cleanly.

## nil interfaces

An interface value is nil only if **both** type and value are nil. A common bug assigns a typed nil pointer to an interface — it is not equal to \`nil\`. Always return bare \`nil\` error values from functions that return \`error\`.

## Practice

1. Define \`Logger\` with \`Info(msg string)\` and implement \`ConsoleLogger\` plus \`SilentLogger\`.
2. Write a function that accepts \`io.Reader\` and counts bytes.
3. Create a fake \`PostStore\` for unit tests.`,
    },
    {
      slug: "goroutines",
      title: "Goroutines & Concurrency",
      description: "Launch lightweight concurrent tasks and synchronize with WaitGroups.",
      level: "intermediate",
      minutes: 22,
      content: `## Goroutines

A **goroutine** is a lightweight thread managed by the Go runtime. Start one with the \`go\` keyword:

\`\`\`go
go fetchURL("https://example.com")
fmt.Println("started fetch") // runs concurrently
\`\`\`

Goroutines share memory; you must coordinate access to avoid **data races**. Run \`go test -race\` to detect races in tests.

## WaitGroups

Wait for a batch of goroutines to finish:

\`\`\`go
var wg sync.WaitGroup
for _, url := range urls {
    wg.Add(1)
    go func(u string) {
        defer wg.Done()
        fetch(u)
    }(url)
}
wg.Wait()
\`\`\`

Always pass loop variables as parameters to the goroutine closure — capturing the loop variable directly is a classic bug.

## Mutexes

Protect shared state with \`sync.Mutex\`:

\`\`\`go
var mu sync.Mutex
var count int

func inc() {
    mu.Lock()
    defer mu.Unlock()
    count++
}
\`\`\`

Prefer channels for ownership transfer; use mutexes for simple shared counters or caches.

## Context for cancellation

\`context.Context\` propagates deadlines and cancellation:

\`\`\`go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
\`\`\`

Pass \`ctx\` as the first parameter in IO-bound functions.

## GOMAXPROCS

By default Go uses all CPU cores. \`runtime.GOMAXPROCS\` adjusts parallelism; usually leave it alone unless profiling shows benefit.

## Practice

1. Fetch three URLs concurrently and print response status codes.
2. Use \`sync.WaitGroup\` to wait for all goroutines before exiting \`main\`.
3. Add a 2-second timeout with \`context.WithTimeout\` around an HTTP call.`,
    },
    {
      slug: "channels",
      title: "Channels & Select",
      description: "Communicate between goroutines with typed channels and the select statement.",
      level: "intermediate",
      minutes: 22,
      content: `## Channel basics

Channels typed conduits send values between goroutines:

\`\`\`go
ch := make(chan string)
go func() { ch <- "done" }()
msg := <-ch
\`\`\`

Unbuffered channels **synchronize** — the sender blocks until a receiver is ready.

## Buffered channels

\`\`\`go
ch := make(chan int, 10)
ch <- 1 // does not block until buffer full
\`\`\`

Use buffer size when producers and consumers run at different rates, but avoid unbounded buffering — it hides backpressure problems.

## Closing channels

\`\`\`go
close(ch)
v, ok := <-ch
if !ok { /* channel closed */ }
\`\`\`

Only the sender should close. Ranging over a channel reads until closed:

\`\`\`go
for v := range ch {
    process(v)
}
\`\`\`

## Select

\`select\` waits on multiple channel operations:

\`\`\`go
select {
case msg := <-messages:
    fmt.Println(msg)
case <-time.After(time.Second):
    fmt.Println("timeout")
case <-ctx.Done():
    return ctx.Err()
}
\`\`\`

Add a \`default\` case for non-blocking attempts.

## Fan-in and worker pools

Common patterns: merge multiple channels into one (**fan-in**), or spawn N workers reading jobs from a shared channel (**worker pool**). These patterns scale IO-bound pipelines without uncontrolled goroutine counts.

## Practice

1. Build a pipeline: generator → square numbers → printer using two channels.
2. Implement a timeout with \`select\` and \`time.After\`.
3. Create a worker pool of 3 goroutines processing jobs from a channel.`,
    },
    {
      slug: "modules",
      title: "Go Modules & Packages",
      description: "Version dependencies, publish modules, and organize multi-package repos.",
      level: "intermediate",
      minutes: 18,
      content: `## Module initialization

\`go mod init example.com/myapp\` creates \`go.mod\` declaring the module path and Go version:

\`\`\`
module example.com/myapp

go 1.22

require github.com/go-chi/chi/v5 v5.0.12
\`\`\`

Import paths mirror the module path: \`example.com/myapp/internal/store\`.

## Adding dependencies

\`\`\`bash
go get github.com/go-chi/chi/v5
go mod tidy   # add missing, remove unused
\`\`\`

\`go.sum\` records cryptographic checksums for reproducible builds. Commit both \`go.mod\` and \`go.sum\`.

## Internal packages

Code under \`internal/\` is importable only by modules rooted at or above that directory — Go enforces this at compile time. Use \`internal/\` for implementation details consumers should not touch.

## Versioning semantics

Go follows **semantic import versioning**: breaking changes require a \`/v2\` module path suffix. Tag releases with git tags matching the module version (\`v1.2.3\`).

## Workspaces (monorepos)

\`go work init\` plus \`go work use ./pkg-a ./pkg-b\` lets multiple modules develop together locally without publishing pseudo-versions.

## Build and install

\`\`\`bash
go build -o bin/myapp ./cmd/myapp
go install ./cmd/myapp@latest
\`\`\`

Place CLI entrypoints in \`cmd/name/main.go\` — a widely adopted convention.

## Practice

1. Split a project into \`cmd/app\` and \`internal/api\` packages.
2. Add an external dependency with \`go get\` and run \`go mod tidy\`.
3. Run \`go vet ./...\` and \`go test ./...\` on your module.`,
    },
    capstoneChapter("golang-intro", "CLI Task Manager", [
      "Create `cmd/tasks/main.go` using the `flag` or `cobra` package. Subcommands: `add`, `list`, `done`, and `delete`.",
      "Store tasks in a JSON file under the user's home directory (`~/.tasks.json`). Define a `Task` struct with ID, title, done flag, and created timestamp.",
      "Implement file locking or atomic writes (write to temp file, rename) so concurrent runs do not corrupt data.",
      "Add colored output for overdue tasks and validate that `done` and `delete` accept numeric IDs with helpful error messages.",
      "Write table-driven tests for parsing and persistence logic. Build with `go build` and distribute a single static binary.",
    ]),
  ]),

  ...buildPathChapters("rust-intro", [
    introChapter(
      "rust-intro",
      "Rust",
      "Rust is a systems programming language focused on memory safety without garbage collection. Its ownership model eliminates data races at compile time, making it ideal for CLIs, WebAssembly, embedded devices, and performance-critical services. Rust has grown rapidly in backend and infrastructure tooling because it combines C++-level speed with strong guarantees.",
      [
        "Understand ownership, moves, and the borrow checker",
        "Model data with structs, enums, and pattern matching",
        "Handle errors explicitly with Result and Option",
        "Manage projects and crates with Cargo",
        "Build a CLI tool as a capstone project",
      ],
      "Install Rust via [rustup.rs](https://rustup.rs): `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`. Verify with `rustc --version` and `cargo --version`. Create a project: `cargo new hello_rust && cd hello_rust && cargo run`. Use `rust-analyzer` in your editor for inline errors and completions.",
    ),
    {
      slug: "ownership",
      title: "Ownership & Moves",
      description: "How Rust tracks memory, moves values, and frees resources automatically.",
      level: "beginner",
      minutes: 25,
      content: `## The ownership rules

Rust manages memory through three rules enforced at compile time:

1. Each value has exactly one **owner**
2. When the owner goes out of scope, the value is **dropped**
3. There can be either one mutable reference or many immutable references (covered next chapter)

These rules prevent use-after-free and double-free bugs without a garbage collector.

## Move semantics

Assignment **moves** heap data instead of copying:

\`\`\`rust
let s1 = String::from("hello");
let s2 = s1; // s1 is no longer valid
// println!("{s1}"); // compile error
\`\`\`

Stack-only types like \`i32\` and \`bool\` implement \`Copy\` and duplicate instead of moving.

## Functions and ownership

Passing a \`String\` to a function moves ownership:

\`\`\`rust
fn takes(s: String) {
    println!("{s}");
} // s dropped here

fn main() {
    let name = String::from("Rust");
    takes(name);
    // name unavailable
}
\`\`\`

Return values transfer ownership back to the caller.

## Clone when you need a deep copy

\`\`\`rust
let s2 = s1.clone(); // explicit heap copy
\`\`\`

Cloning is intentional and visible — unlike implicit copies in some languages.

## Drop trait

Types implement \`Drop\` to run cleanup code. \`Vec\`, \`File\`, and \`MutexGuard\` release resources when they leave scope — Rust calls \`drop\` automatically.

## Practice

1. Predict which lines fail to compile when moving \`String\` values between variables.
2. Write a function that takes ownership of a \`Vec<i32>\` and returns its sum.
3. Compare behavior of \`Copy\` types (\`i32\`) vs move types (\`String\`).`,
    },
    {
      slug: "borrowing",
      title: "Borrowing & References",
      description: "Immutable and mutable references, lifetimes, and common borrow checker errors.",
      level: "intermediate",
      minutes: 25,
      content: `## References without taking ownership

**Borrowing** lets you use a value without moving it:

\`\`\`rust
fn len(s: &String) -> usize {
    s.len()
}

let name = String::from("devblog");
let l = len(&name);
println!("{name} has length {l}");
\`\`\`

\`&T\` is an immutable reference; the owner remains valid after the call.

## Mutable references

Only **one** \`&mut T\` may exist at a time in a scope:

\`\`\`rust
fn push_exclaim(s: &mut String) {
    s.push('!');
}
\`\`\`

This prevents data races at compile time — no runtime locks needed for single-threaded aliasing rules.

## Borrowing rules in practice

You cannot hold an immutable reference while a mutable reference is active:

\`\`\`rust
let mut s = String::from("hi");
let r1 = &s;
// let r2 = &mut s; // error while r1 lives
println!("{r1}");
\`\`\`

Splitting borrows across functions often resolves conflicts — extract logic so references do not overlap.

## Slices

\`&str\` and \`&[T]\` are **fat pointers** referencing contiguous data without ownership:

\`\`\`rust
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}
\`\`\`

Prefer \`&str\` parameters over \`&String\` — deref coercion accepts both.

## Lifetimes (intro)

Lifetime annotations (\`'a\`) tell the compiler how long references must remain valid. Most of the time inference suffices; explicit lifetimes appear in structs holding references or complex generic functions. Error messages name the two conflicting borrows — read them carefully.

## Practice

1. Fix a borrow checker error by shortening reference scope.
2. Write \`fn longest<'a>(a: &'a str, b: &'a str) -> &'a str\`.
3. Iterate a \`Vec<String>\` by shared reference without consuming the vector.`,
    },
    {
      slug: "structs",
      title: "Structs & Methods",
      description: "Define custom types, impl blocks, associated functions, and derive macros.",
      level: "beginner",
      minutes: 20,
      content: `## Struct definitions

\`\`\`rust
struct Post {
    id: u64,
    title: String,
    published: bool,
}

let p = Post {
    id: 1,
    title: String::from("Hello Rust"),
    published: false,
};
\`\`\`

Use **tuple structs** for newtypes (\`struct Meters(f64);\`) and **unit structs** for markers.

## Methods with impl

\`\`\`rust
impl Post {
    fn slug(&self) -> String {
        self.title.to_lowercase().replace(' ', "-")
    }

    fn publish(&mut self) {
        self.published = true;
    }

    fn new(title: String) -> Self {
        Self { id: 0, title, published: false }
    }
}
\`\`\`

\`&self\`, \`&mut self\`, and \`Self\` (no receiver) for constructors are the three common forms.

## Derive macros

\`\`\`rust
#[derive(Debug, Clone, PartialEq)]
struct User {
    name: String,
    email: String,
}
\`\`\`

\`Debug\` enables \`{:?}\` printing; \`Clone\` duplicates; \`PartialEq\` compares. Serde adds \`Serialize\`/\`Deserialize\` for JSON APIs.

## Modules and visibility

\`pub\` exports items across module boundaries. Keep fields private and expose getters or methods — encapsulation works like other languages.

## Builder pattern

For many optional fields, a builder struct with chained methods avoids huge constructors — common in HTTP clients and config parsing crates.

## Practice

1. Add \`impl Post\` with \`is_draft(&self) -> bool\`.
2. Derive \`Debug\` and print a struct with \`println!("{:?}", post)\`.
3. Split code into \`models/post.rs\` and import with \`mod post;\`.`,
    },
    {
      slug: "enums",
      title: "Enums & Pattern Matching",
      description: "Sum types, match expressions, if let, and modeling state machines.",
      level: "intermediate",
      minutes: 22,
      content: `## Enums with data

Rust enums can carry payloads — more powerful than C-style enums:

\`\`\`rust
enum Status {
    Draft,
    Published { at: String },
    Archived,
}

enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}
\`\`\`

Each variant can hold different types, making enums ideal for **state machines**.

## match expressions

\`\`\`rust
fn label(s: &Status) -> &str {
    match s {
        Status::Draft => "draft",
        Status::Published { .. } => "live",
        Status::Archived => "archived",
    }
}
\`\`\`

\`match\` must be **exhaustive** — every variant handled. Use \`_\` for catch-all when appropriate.

## if let and while let

For single-variant checks:

\`\`\`rust
if let Status::Published { at } = &post.status {
    println!("Published at {at}");
}
\`\`\`

Cleaner than a full \`match\` with one useful arm.

## Option and Result

\`Option<T>\` and \`Result<T, E>\` are enums used everywhere:

\`\`\`rust
enum Option<T> {
    Some(T),
    None,
}
\`\`\`

They replace null pointers and exceptions with explicit variants the compiler forces you to handle.

## Standard library helpers

\`.map\`, \`.and_then\`, \`.unwrap_or\`, and the \`?\` operator (next chapter) chain operations on \`Option\` and \`Result\` without nested \`match\` boilerplate.

## Practice

1. Model an HTTP method enum: Get, Post, Put, Delete.
2. Write \`match\` converting \`Option<i32>\` to \`0\` when None.
3. Represent a traffic light enum and implement \`next(&self) -> Self\`.`,
    },
    {
      slug: "result",
      title: "Error Handling with Result",
      description: "Recoverable errors, the ? operator, custom error types, and anyhow/thiserror.",
      level: "intermediate",
      minutes: 22,
      content: `## Result for recoverable errors

\`\`\`rust
fn read_config(path: &str) -> Result<String, std::io::Error> {
    std::fs::read_to_string(path)
}
\`\`\`

\`Ok(T)\` signals success; \`Err(E)\` signals failure. Callers decide whether to propagate, log, or retry.

## The ? operator

Inside functions returning \`Result\`, \`?\` early-returns errors:

\`\`\`rust
fn load() -> Result<Config, Box<dyn std::error::Error>> {
    let raw = std::fs::read_to_string("config.toml")?;
    let cfg: Config = toml::from_str(&raw)?;
    Ok(cfg)
}
\`\`\`

This replaces verbose \`match\` chains for the happy path.

## Custom error types

Libraries define enums wrapping underlying errors:

\`\`\`rust
#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse(String),
}
\`\`\`

Crates like **thiserror** derive \`Display\` and \`Error\` automatically; **anyhow** suits application binaries with flexible error context.

## panic! for unrecoverable faults

\`panic!\` aborts the current thread (or unwinds if enabled). Use for programmer bugs and invariant violations — not for expected failures like missing files.

## Combining Option and Result

\`.ok_or\` converts \`Option\` to \`Result\`; \`.transpose\` flips nested types. Learning these adapters reduces nested control flow.

## Practice

1. Chain two fallible operations with \`?\` in \`main\`.
2. Map a \`ParseIntError\` into a custom \`AppError\` variant.
3. Replace \`.unwrap()\` calls with proper error propagation.`,
    },
    {
      slug: "cargo",
      title: "Cargo & Crates",
      description: "Project layout, dependencies, features, tests, and publishing to crates.io.",
      level: "intermediate",
      minutes: 18,
      content: `## Project structure

\`cargo new\` generates:

\`\`\`
myapp/
  Cargo.toml
  src/main.rs      # binary root
  src/lib.rs       # library root (optional)
\`\`\`

Binaries live in \`src/main.rs\` or \`src/bin/*.rs\`; libraries export a public API from \`src/lib.rs\`.

## Cargo.toml dependencies

\`\`\`toml
[package]
name = "myapp"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
reqwest = { version = "0.12", features = ["json"] }
\`\`\`

Run \`cargo build\`, \`cargo run\`, \`cargo test\`, and \`cargo doc --open\`.

## Features and profiles

Optional functionality uses **features**:

\`\`\`toml
[features]
default = ["serde"]
serde = ["dep:serde"]
\`\`\`

Release profile tuning (\`opt-level\`, \`lto\`) shrinks and speeds production binaries.

## Tests and benchmarks

\`\`\`rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}
\`\`\`

Integration tests go in \`tests/*.rs\`; \`cargo bench\` runs benchmarks behind the \`unstable\` bench harness or criterion crate.

## Workspaces

Multi-crate repos use a root \`Cargo.toml\`:

\`\`\`toml
[workspace]
members = ["crates/core", "crates/cli"]
\`\`\`

Shared \`target/\` and lockfile simplify CI.

## Practice

1. Add \`clap\` and \`serde_json\` dependencies and run \`cargo tree\`.
2. Write an integration test in \`tests/api.rs\`.
3. Build optimized release binary with \`cargo build --release\`.`,
    },
    capstoneChapter("rust-intro", "CLI File Search Tool", [
      "Create a binary crate `rg-lite` that walks directories recursively and searches file contents for a regex pattern passed as a CLI argument. Use `clap` for argument parsing.",
      "Skip hidden files and honor a `--ignore-case` flag. Print matches as `path:line:column: snippet` with colored output via `colored` or ANSI codes.",
      "Return exit code 0 when matches found, 1 when none, 2 on usage errors. Propagate IO errors with `?` and map them to readable stderr messages.",
      "Add unit tests for the matching logic and an integration test with temporary fixture files using `tempfile`.",
      "Benchmark against a large directory and document trade-offs in a README. Publish optional: `cargo install --path .` for local use.",
    ]),
  ]),

  ...buildPathChapters("java-intro", [
    introChapter(
      "java-intro",
      "Java",
      "Java is a mature, platform-independent language running on the JVM. It dominates enterprise backends, Android development (with Kotlin), and large-scale systems at banks and SaaS companies. Strong typing, garbage collection, and a vast ecosystem (Spring, Maven, Gradle) make Java a reliable choice for long-lived services and REST APIs.",
      [
        "Write Java syntax, classes, and entry points",
        "Apply object-oriented design: encapsulation, inheritance, polymorphism",
        "Use collections and streams for data processing",
        "Manage builds and dependencies with Maven",
        "Get an overview of Spring Boot and build a REST API capstone",
      ],
      "Install JDK 21 (LTS) from [Adoptium](https://adoptium.net) or your package manager. Verify `java -version` and `javac -version`. Use IntelliJ IDEA Community or VS Code with Extension Pack for Java. Create `Hello.java`, compile with `javac Hello.java`, run with `java Hello`.",
    ),
    {
      slug: "syntax",
      title: "Java Syntax & Basics",
      description: "Classes, methods, primitives, strings, and the main entry point.",
      level: "beginner",
      minutes: 20,
      content: `## Class-centric structure

Every Java file contains at least one class. The entry point is \`public static void main(String[] args)\`:

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
\`\`\`

Class name must match filename (\`Hello.java\`).

## Types and variables

\`\`\`java
int count = 0;
double price = 9.99;
boolean active = true;
String title = "DevBlog";
final int MAX = 100; // constant
\`\`\`

Primitives (\`int\`, \`long\`, \`double\`, \`boolean\`, etc.) live on the stack; objects like \`String\` live on the heap with references on the stack.

## Methods

\`\`\`java
public static int add(int a, int b) {
    return a + b;
}
\`\`\`

Overloading allows multiple methods with the same name but different parameters. Access modifiers: \`public\`, \`protected\`, \`private\`, package-private (default).

## Control flow

Java has \`if/else\`, \`switch\` (expression-style since Java 14), \`for\`, enhanced \`for-each\`, and \`while\`. \`switch\` on strings and enums is common in handlers:

\`\`\`java
String label = switch (status) {
    case DRAFT -> "Draft";
    case PUBLISHED -> "Live";
    default -> "Unknown";
};
\`\`\`

## Strings and text blocks

\`String\` is immutable. Java 15+ **text blocks** simplify multiline strings:

\`\`\`java
String json = """
    {"title": "Hello"}
    """;
\`\`\`

Use \`String.format\` or formatted strings (\`"Hello %s".formatted(name)\`) for interpolation.

## Practice

1. Write a class with \`main\` that prints CLI arguments.
2. Implement \`max(int a, int b)\` and overload for \`double\`.
3. Parse an integer from \`args[0]\` with try/catch for \`NumberFormatException\`.`,
    },
    {
      slug: "oop",
      title: "Object-Oriented Programming",
      description: "Classes, inheritance, interfaces, encapsulation, and records.",
      level: "beginner",
      minutes: 22,
      content: `## Classes and objects

\`\`\`java
public class Post {
    private final long id;
    private String title;

    public Post(long id, String title) {
        this.id = id;
        this.title = title;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
\`\`\`

**Encapsulation** hides fields behind methods so invariants stay enforced.

## Inheritance

\`\`\`java
public class Article extends Post {
    private String body;

    public Article(long id, String title, String body) {
        super(id, title);
        this.body = body;
    }
}
\`\`\`

Java supports single inheritance for classes. Use \`super\` to call parent constructors and methods.

## Interfaces

Interfaces define contracts without implementation (Java 8+ allows \`default\` methods):

\`\`\`java
public interface Publishable {
    void publish();
    default boolean isDraft() { return true; }
}
\`\`\`

A class \`implements\` multiple interfaces — favor composition and interfaces over deep inheritance trees.

## Abstract classes vs interfaces

Abstract classes share code and state; interfaces define capabilities. Rule of thumb: use interfaces for APIs; abstract classes when subclasses share substantial implementation.

## Records (Java 16+)

Immutable data carriers with generated constructors, getters, \`equals\`, and \`hashCode\`:

\`\`\`java
public record Comment(long id, String body, String author) {}
\`\`\`

Perfect for DTOs returned from REST endpoints.

## Practice

1. Create an interface \`Identifiable\` with \`long getId()\` and implement it on \`Post\`.
2. Convert a simple data class to a \`record\` and compare boilerplate.
3. Override \`toString\` for debugging or rely on record auto-generation.`,
    },
    {
      slug: "collections",
      title: "Collections Framework",
      description: "List, Set, Map, generics, and choosing the right collection.",
      level: "intermediate",
      minutes: 20,
      content: `## Core interfaces

The **java.util** collections framework provides:

| Interface | Implementations | Use case |
|-----------|-----------------|----------|
| \`List\` | \`ArrayList\`, \`LinkedList\` | Ordered, duplicates allowed |
| \`Set\` | \`HashSet\`, \`TreeSet\` | Unique elements |
| \`Map\` | \`HashMap\`, \`TreeMap\` | Key-value lookup |

\`\`\`java
List<String> tags = new ArrayList<>();
tags.add("java");
tags.add("backend");

Map<String, Post> bySlug = new HashMap<>();
bySlug.put(post.slug(), post);
\`\`\`

## Generics

Generics compile-time type safety without casts:

\`\`\`java
public Optional<Post> findBySlug(Map<String, Post> map, String slug) {
    return Optional.ofNullable(map.get(slug));
}
\`\`\`

Raw types (\`List\` without \`<T>\`) still compile with warnings — avoid them.

## Iteration

\`\`\`java
for (Post p : posts) {
    System.out.println(p.getTitle());
}

Iterator<Post> it = posts.iterator();
while (it.hasNext()) { /* ... */ }
\`\`\`

## Comparable and Comparator

Sort with natural order (\`Comparable\`) or custom \`Comparator\`:

\`\`\`java
posts.sort(Comparator.comparing(Post::getTitle));
\`\`\`

## Immutable collections

Java 9+ \`List.of\`, \`Set.of\`, \`Map.of\` create immutable instances — prefer for constants and return values when mutation is not needed.

## Practice

1. Count word frequency in a string using \`HashMap<String, Integer>\`.
2. Remove duplicates from a \`List\` via \`LinkedHashSet\`.
3. Sort posts by published date descending with \`Comparator\`.`,
    },
    {
      slug: "streams",
      title: "Streams API",
      description: "Functional-style pipeline operations: map, filter, reduce, and collectors.",
      level: "intermediate",
      minutes: 22,
      content: `## What streams provide

The **Stream API** (Java 8+) processes collections declaratively:

\`\`\`java
List<String> titles = posts.stream()
    .filter(Post::isPublished)
    .map(Post::getTitle)
    .sorted()
    .toList();
\`\`\`

Streams do not store data — they pipe elements through operations, often lazily.

## Common operations

- **Intermediate** (lazy): \`filter\`, \`map\`, \`flatMap\`, \`distinct\`, \`sorted\`, \`peek\`
- **Terminal** (eager): \`collect\`, \`forEach\`, \`reduce\`, \`count\`, \`findFirst\`

\`\`\`java
int totalChars = posts.stream()
    .map(Post::getTitle)
    .mapToInt(String::length)
    .sum();
\`\`\`

Primitive streams (\`IntStream\`, \`LongStream\`) avoid boxing overhead.

## Collectors

\`\`\`java
Map<Boolean, List<Post>> byStatus = posts.stream()
    .collect(Collectors.partitioningBy(Post::isPublished));
\`\`\`

\`groupingBy\`, \`joining\`, and \`toMap\` cover most aggregation needs.

## Parallel streams

\`.parallelStream()\` splits work across threads — useful for CPU-heavy transforms on large lists. Avoid for IO-bound tasks or when order matters unless you understand fork/join overhead.

## When not to use streams

Simple loops are clearer for mutations with side effects or early complex breaks. Streams shine for read-only transformations and aggregations.

## Practice

1. Find the longest published post title using \`max(Comparator.comparingInt(String::length))\`.
2. Group tags by first letter with \`groupingBy\`.
3. Rewrite an imperative loop as a stream pipeline and compare readability.`,
    },
    {
      slug: "maven",
      title: "Maven & Project Structure",
      description: "pom.xml, dependencies, lifecycle phases, and multi-module layouts.",
      level: "intermediate",
      minutes: 20,
      content: `## Maven coordinates

Maven identifies artifacts with **groupId**, **artifactId**, and **version**:

\`\`\`xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.devblog</groupId>
  <artifactId>blog-api</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>jar</packaging>
</project>
\`\`\`

Dependencies download from Maven Central (or private repos):

\`\`\`xml
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.10.2</version>
  <scope>test</scope>
</dependency>
\`\`\`

## Standard directory layout

\`\`\`
src/main/java       Production code
src/main/resources  Config, static assets
src/test/java       Tests
target/             Build output (gitignored)
\`\`\`

Convention over configuration — Maven expects this layout by default.

## Lifecycle phases

Common commands:

- \`mvn compile\` — compile main sources
- \`mvn test\` — run unit tests
- \`mvn package\` — build JAR/WAR
- \`mvn spring-boot:run\` — run Spring Boot apps (with plugin)

Phases run in order: validate → compile → test → package → verify → install → deploy.

## BOM and dependency management

Import a **BOM** (Bill of Materials) to align versions:

\`\`\`xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-dependencies</artifactId>
      <version>3.2.5</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
\`\`\`

## Practice

1. Generate a project with [start.spring.io](https://start.spring.io) and inspect the POM.
2. Add a dependency and run \`mvn dependency:tree\`.
3. Configure the compiler plugin for Java 21 \`release\` target.`,
    },
    {
      slug: "spring-boot-intro",
      title: "Spring Boot Introduction",
      description: "Auto-configuration, REST controllers, dependency injection, and application.properties.",
      level: "intermediate",
      minutes: 25,
      content: `## Why Spring Boot

**Spring Boot** opinionates Spring Framework setup: embedded Tomcat, auto-configuration, and starter dependencies reduce XML and boilerplate. It is the default stack for Java REST APIs and microservices.

\`\`\`java
@SpringBootApplication
public class BlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogApplication.class, args);
    }
}
\`\`\`

\`@SpringBootApplication\` combines configuration, component scan, and auto-config.

## REST controllers

\`\`\`java
@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    public List<PostDto> list() {
        return service.findAll();
    }

    @GetMapping("/{slug}")
    public PostDto get(@PathVariable String slug) {
        return service.findBySlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
\`\`\`

JSON serialization uses Jackson on the classpath by default.

## Dependency injection

Spring manages object graphs with **constructor injection** (preferred):

\`\`\`java
@Service
public class PostService {
    private final PostRepository repo;
    public PostService(PostRepository repo) { this.repo = repo; }
}
\`\`\`

Mark components with \`@Service\`, \`@Repository\`, \`@Component\`. Avoid field injection in new code.

## Configuration

\`application.properties\` or \`application.yml\`:

\`\`\`properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost/blog
\`\`\`

Profiles (\`application-dev.yml\`) separate environments.

## DevTools and testing

\`spring-boot-starter-test\` includes JUnit 5, MockMvc, and AssertJ. \`@WebMvcTest\` slices controller tests without full context startup.

## Practice

1. Scaffold a project from start.spring.io with Web dependency.
2. Add a \`GET /api/health\` returning \`{"status":"ok"}\`.
3. Write a MockMvc test asserting 200 on \`/api/health\`.`,
    },
    capstoneChapter("java-intro", "Blog REST API", [
      "Create a Spring Boot project with Web, Validation, and Spring Data JPA (H2 for local dev). Define `Post` entity with id, title, slug, body, published flag, and timestamps.",
      "Implement `PostRepository extends JpaRepository<Post, Long>` and `PostService` with CRUD methods. Enforce unique slug with a database constraint and handle conflicts with `@ControllerAdvice`.",
      "Expose REST endpoints: `GET /api/posts`, `GET /api/posts/{slug}`, `POST /api/posts`, `PATCH /api/posts/{id}`, `DELETE /api/posts/{id}`. Use DTO records for requests and responses.",
      "Add request validation (`@NotBlank`, `@Size`) and return Problem Details or consistent JSON error bodies for 400/404 responses.",
      "Write integration tests with `@SpringBootTest` and MockMvc covering happy path and not-found cases. Document endpoints in README and run with `mvn spring-boot:run`.",
    ]),
  ]),

  ...buildPathChapters("csharp-dotnet", [
    introChapter(
      "csharp-dotnet",
      "C# & .NET",
      "C# is a modern, type-safe language from Microsoft running on .NET. It powers web APIs with ASP.NET Core, desktop apps, games with Unity, and cloud services on Azure. .NET is cross-platform (Windows, macOS, Linux) and offers high performance, async I/O, and excellent tooling in Visual Studio and VS Code.",
      [
        "Learn C# syntax, classes, and nullable reference types",
        "Query data with LINQ",
        "Write asynchronous code with async/await",
        "Build HTTP APIs with ASP.NET Core minimal APIs",
        "Persist data with Entity Framework Core and complete a capstone API",
      ],
      "Install the .NET 8 SDK from [dotnet.microsoft.com](https://dotnet.microsoft.com/download). Verify `dotnet --version`. Create a console app: `dotnet new console -n HelloCsharp && cd HelloCsharp && dotnet run`. For web work: `dotnet new webapi -n BlogApi`. Use C# Dev Kit in VS Code or Visual Studio 2022.",
    ),
    {
      slug: "syntax",
      title: "C# Syntax & Types",
      description: "Variables, classes, properties, nullable types, and modern C# features.",
      level: "beginner",
      minutes: 20,
      content: `## Program structure

Top-level statements (C# 9+) simplify small programs; larger apps use classes and namespaces:

\`\`\`csharp
namespace DevBlog;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public bool Published { get; set; }
}
\`\`\`

**Properties** replace Java-style getters/setters with concise syntax.

## Types and var

\`\`\`csharp
int count = 0;
string title = "Hello";
var items = new List<string>(); // inferred List<string>
decimal price = 19.99m;
\`\`\`

Value types (\`int\`, \`struct\`) vs reference types (\`class\`, \`string\`) affect assignment semantics — structs copy on assignment.

## Nullable reference types

Enable NRT in \`.csproj\` (\`<Nullable>enable</Nullable>\`) to catch null dereferences at compile time:

\`\`\`csharp
string? optional = null;
Console.WriteLine(optional?.Length ?? 0);
\`\`\`

Non-nullable \`string\` parameters must receive non-null values or the compiler warns.

## Pattern matching

\`\`\`csharp
public string Describe(object input) => input switch
{
    int n => $"number {n}",
    string s => $"text {s}",
    _ => "unknown"
};
\`\`\`

Switch expressions and \`is\` patterns reduce boilerplate versus chained \`if/else\`.

## Records

\`public record Comment(int Id, string Body);\` creates immutable data types with value equality — ideal for API models.

## Practice

1. Create a \`Post\` class with init-only properties (C# 9 \`init\`).
2. Enable nullable context and fix warnings in a scratch project.
3. Use a switch expression on an enum \`PostStatus\`.`,
    },
    {
      slug: "linq",
      title: "LINQ Queries",
      description: "Query collections with method syntax and query syntax, deferred execution.",
      level: "intermediate",
      minutes: 20,
      content: `## Language Integrated Query

**LINQ** unifies querying objects, XML, and databases with composable operators:

\`\`\`csharp
var titles = posts
    .Where(p => p.Published)
    .OrderBy(p => p.Title)
    .Select(p => p.Title)
    .ToList();
\`\`\`

Method syntax (shown above) is idiomatic in modern C#; query syntax resembles SQL:

\`\`\`csharp
var query = from p in posts
            where p.Published
            orderby p.Title
            select p.Title;
\`\`\`

Both compile to the same IL.

## Common operators

- **Filtering**: \`Where\`
- **Projection**: \`Select\`, \`SelectMany\`
- **Ordering**: \`OrderBy\`, \`ThenBy\`
- **Grouping**: \`GroupBy\`
- **Aggregation**: \`Count\`, \`Sum\`, \`Max\`, \`Average\`
- **Element**: \`FirstOrDefault\`, \`Single\`

\`\`\`csharp
var top = posts
    .GroupBy(p => p.Author)
    .Select(g => new { Author = g.Key, Count = g.Count() })
    .OrderByDescending(x => x.Count)
    .FirstOrDefault();
\`\`\`

## Deferred execution

LINQ to Objects chains are **lazy** until a terminal operator (\`ToList\`, \`Count\`, \`foreach\`) runs. Multiple enumerations re-execute the pipeline — materialize with \`.ToList()\` when needed.

## LINQ to EF Core

Entity Framework translates \`IQueryable\` expressions to SQL. Filter before materializing:

\`\`\`csharp
var page = db.Posts
    .Where(p => p.Published)
    .OrderByDescending(p => p.CreatedAt)
    .Take(10)
    .ToListAsync();
\`\`\`

## Practice

1. Find published posts whose title contains a search term (case-insensitive).
2. Group posts by year-month of \`CreatedAt\`.
3. Compare performance of \`Where\` before \`Select\` vs projecting early.`,
    },
    {
      slug: "async",
      title: "Async & Await",
      description: "Non-blocking I/O, Task types, cancellation, and async best practices.",
      level: "intermediate",
      minutes: 22,
      content: `## Why async matters

Blocking threads during IO wastes server resources. **async/await** frees threads while waiting on databases, HTTP, or files:

\`\`\`csharp
public async Task<Post?> GetPostAsync(string slug, CancellationToken ct = default)
{
    return await db.Posts
        .AsNoTracking()
        .FirstOrDefaultAsync(p => p.Slug == slug, ct);
}
\`\`\`

The method returns a \`Task\` representing in-flight work; \`await\` resumes when complete without blocking a thread pool thread.

## async all the way

Avoid \`.Result\` or \`.Wait()\` on tasks — they cause deadlocks in ASP.NET contexts. Propagate \`async Task\` from controllers down to data access.

## Task vs ValueTask

Most APIs return \`Task<T>\`. \`ValueTask<T>\` reduces allocations when results are often synchronous (cached) — use when library guidance recommends it.

## Cancellation

Pass \`CancellationToken\` from \`HttpContext.RequestAborted\` in minimal APIs and controllers:

\`\`\`csharp
app.MapGet("/posts", async (BlogDb db, CancellationToken ct) =>
    await db.Posts.ToListAsync(ct));
\`\`\`

Cooperative cancellation stops wasted work when clients disconnect.

## Parallelism vs async

\`Task.Run\` offloads CPU work to the thread pool — not for IO. Use \`Parallel.ForEachAsync\` (.NET 6+) for bounded parallel IO with async lambdas.

## Exception handling

Exceptions thrown in async methods propagate to the awaiting caller wrapped in the task. Use \`try/catch\` around \`await\` like synchronous code.

## Practice

1. Convert a synchronous HTTP call to \`HttpClient.GetStringAsync\`.
2. Add cancellation support to a long-running loop.
3. Measure thread pool usage under load with sync vs async endpoints.`,
    },
    {
      slug: "aspnet-minimal-api",
      title: "ASP.NET Core Minimal APIs",
      description: "Route mapping, dependency injection, validation, and OpenAPI in .NET 8.",
      level: "intermediate",
      minutes: 25,
      content: `## Minimal API setup

.NET 6+ **minimal APIs** map routes with less ceremony than controllers:

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
\`\`\`

Single-file style suits microservices and small services; scale up with endpoint groups and filters.

## Dependency injection

Register services in \`builder.Services\`:

\`\`\`csharp
builder.Services.AddDbContext<BlogDb>(opt =>
    opt.UseSqlite("Data Source=blog.db"));
builder.Services.AddScoped<IPostService, PostService>();
\`\`\`

Handlers receive dependencies as parameters — the framework resolves them per scope.

## CRUD endpoints

\`\`\`csharp
app.MapGet("/api/posts", async (BlogDb db) =>
    await db.Posts.ToListAsync());

app.MapPost("/api/posts", async (CreatePostDto dto, BlogDb db) =>
{
    var post = new Post { Title = dto.Title, Slug = dto.Slug };
    db.Posts.Add(post);
    await db.SaveChangesAsync();
    return Results.Created($"/api/posts/{post.Id}", post);
});
\`\`\`

Return \`IResult\` types (\`Ok\`, \`NotFound\`, \`ValidationProblem\`) for correct status codes.

## Validation

Use **FluentValidation** or built-in \`[Required]\` on DTOs with filter APIs (.NET 7+ \`AddEndpointsApiExplorer\` + validation extensions) to reject bad input with 400 responses.

## Middleware pipeline

Order matters: exception handler → HTTPS → auth → routing → endpoints. Add \`UseAuthentication\` / \`UseAuthorization\` when securing routes.

## Practice

1. Add \`MapGroup("/api/posts")\` with shared OpenAPI tags.
2. Implement \`GET /api/posts/{id}\` returning 404 when missing.
3. Enable Swagger UI and test endpoints from the browser.`,
    },
    {
      slug: "ef-core-intro",
      title: "Entity Framework Core",
      description: "DbContext, entities, migrations, relationships, and querying with EF Core.",
      level: "intermediate",
      minutes: 25,
      content: `## ORM role

**Entity Framework Core** maps C# classes to database tables, tracks changes, and generates SQL:

\`\`\`csharp
public class BlogDb : DbContext
{
    public BlogDb(DbContextOptions<BlogDb> options) : base(options) { }
    public DbSet<Post> Posts => Set<Post>();
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Slug { get; set; } = "";
    public List<Comment> Comments { get; set; } = new();
}
\`\`\`

Register with \`AddDbContext\` and inject into endpoints or services.

## Migrations

Schema changes are versioned:

\`\`\`bash
dotnet ef migrations add InitialCreate
dotnet ef database update
\`\`\`

Install tools: \`dotnet tool install --global dotnet-ef\`. Migrations live in \`Migrations/\` — commit them to source control.

## Relationships

Configure one-to-many with conventions or Fluent API:

\`\`\`csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Comment>()
        .HasOne<Post>()
        .WithMany(p => p.Comments)
        .HasForeignKey(c => c.PostId);
}
\`\`\`

Use \`.Include(p => p.Comments)\` to eager-load related data and avoid N+1 queries.

## Tracking vs no-tracking

Read-only queries should use \`.AsNoTracking()\` for performance. \`SaveChangesAsync\` persists inserts, updates, and deletes tracked by the context.

## SQLite vs SQL Server vs PostgreSQL

Develop locally with SQLite; deploy to PostgreSQL or SQL Server by swapping the connection string and provider package (\`Npgsql.EntityFrameworkCore.PostgreSQL\`).

## Practice

1. Add a \`Comment\` entity and migration.
2. Seed sample posts in \`OnModelCreating\` or at startup.
3. Query posts with comments using \`.Include\` and project to DTOs with \`.Select\`.`,
    },
    capstoneChapter("csharp-dotnet", "Blog API with EF Core", [
      "Scaffold `dotnet new webapi -n DevBlog.Api` and add EF Core with SQLite. Define `Post` and `Tag` entities with many-to-many relationship.",
      "Implement minimal API route group `/api/posts` with list (paginated), get by slug, create, update, and delete. Use record DTOs and return `Results` types.",
      "Add FluentValidation for create/update DTOs and a global exception handler returning RFC 7807 problem details.",
      "Generate migrations, seed tags (`csharp`, `dotnet`, `api`), and write integration tests with `WebApplicationFactory` asserting CRUD flows.",
      "Document the API with Swagger, add a `/api/stats` endpoint using LINQ aggregates, and publish a README with `dotnet run` instructions.",
    ]),
  ]),
];
