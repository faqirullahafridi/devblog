import type { LearnChapter } from "../types";

const PATH = "javascript-fundamentals";

export const javascriptFundamentalsChapters: LearnChapter[] = [
  {
    pathSlug: PATH,
    slug: "intro",
    title: "Introduction to JavaScript",
    description: "What JavaScript is, where it runs, and your first program.",
    level: "beginner",
    minutes: 12,
    content: `## What is JavaScript?

JavaScript (JS) is the programming language of the web. It runs in every browser, powers interactive UIs, and with Node.js runs on servers too. If you build for the web, JavaScript is unavoidable — and incredibly powerful once you learn it well.

## Where JavaScript runs

| Environment | Use case |
|-------------|----------|
| **Browser** | Buttons, forms, animations, SPAs (React, Vue) |
| **Node.js** | APIs, scripts, build tools, CLIs |
| **Deno / Bun** | Modern JS runtimes with built-in tooling |

## Your first program

Open your browser DevTools (F12 → Console) or create \`hello.js\`:

\`\`\`javascript
console.log("Hello, devblog!");
\`\`\`

Run with Node: \`node hello.js\`

## How to learn effectively

1. **Type code yourself** — don't only read
2. **Break things on purpose** — errors teach you
3. **Build small projects** — todo list, weather app, API client
4. **Use our tools** — [JSON Formatter](/tools/json-formatter), [Regex Tester](/tools/regex-tester)

## Practice

Change the message, log your name, and log the result of \`2 + 2\`.`,
  },
  {
    pathSlug: PATH,
    slug: "variables-types",
    title: "Variables, Types & Operators",
    description: "let, const, primitives, coercion, and comparison.",
    level: "beginner",
    minutes: 18,
    content: `## Declaring variables

\`\`\`javascript
let count = 0;        // reassignable
const API_URL = "/api"; // constant binding
var old = true;       // avoid in modern code
\`\`\`

**Rule of thumb:** use \`const\` by default, \`let\` when you reassign.

## Primitive types

| Type | Example |
|------|---------|
| string | \`"hello"\` |
| number | \`42\`, \`3.14\` |
| boolean | \`true\`, \`false\` |
| null | intentional empty |
| undefined | not assigned |
| bigint | \`100n\` |
| symbol | unique keys |

\`\`\`javascript
typeof "hi"      // "string"
typeof null      // "object" (historical quirk)
typeof undefined // "undefined"
\`\`\`

## Operators

\`\`\`javascript
5 + 3          // 8
"5" + 3        // "53" — coercion!
5 === "5"      // false — strict equal
5 == "5"       // true — avoid ==
value ?? "default"  // nullish coalesce
obj?.nested?.x      // optional chaining
\`\`\`

## Type coercion pitfalls

Always prefer \`===\` and \`!==\`. Be careful mixing strings and numbers in \`+\`.

## Practice

1. Create variables for your name, age, and whether you like JS
2. Predict results before running: \`"10" - 5\`, \`true + 1\`, \`!""\`
3. Read more: [JavaScript cheatsheet](/refs/javascript#variables-and-types)`,
  },
  {
    pathSlug: PATH,
    slug: "control-flow",
    title: "Control Flow",
    description: "if/else, switch, loops, and truthy/falsy values.",
    level: "beginner",
    minutes: 15,
    content: `## Conditionals

\`\`\`javascript
const score = 85;

if (score >= 90) {
  console.log("A");
} else if (score >= 80) {
  console.log("B");
} else {
  console.log("Keep practicing");
}
\`\`\`

## Truthy and falsy

Falsy: \`false\`, \`0\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`

\`\`\`javascript
if (user) { /* runs if user is truthy */ }
const name = input || "Guest";
const port = config.port ?? 3000;
\`\`\`

## Switch

\`\`\`javascript
switch (method) {
  case "GET": handleGet(); break;
  case "POST": handlePost(); break;
  default: res.status(405);
}
\`\`\`

## Loops

\`\`\`javascript
for (let i = 0; i < 3; i++) console.log(i);

const items = ["a", "b", "c"];
for (const item of items) console.log(item);

let n = 0;
while (n < 5) { n++; }
\`\`\`

## Practice

Write a function \`grade(score)\` returning A/B/C/D/F. Loop 0–100 and log grades for multiples of 17.`,
  },
  {
    pathSlug: PATH,
    slug: "functions-scope",
    title: "Functions & Scope",
    description: "Declarations, arrows, closures, and the this keyword.",
    level: "beginner",
    minutes: 20,
    content: `## Function forms

\`\`\`javascript
function add(a, b) { return a + b; }

const multiply = (a, b) => a * b;

const greet = name => \`Hello, \${name}\`;
\`\`\`

## Scope

\`let\` and \`const\` are **block-scoped** (inside \`{}\`). Functions create their own scope.

\`\`\`javascript
function outer() {
  const x = 1;
  function inner() {
    console.log(x); // closure — sees outer x
  }
  return inner;
}
\`\`\`

## Closures

A closure is when a function remembers variables from where it was created. Used in:

- Event handlers
- [Debounce snippet](/snippets/debounce)
- Module patterns
- React hooks

## this keyword

\`\`\`javascript
const user = {
  name: "Dev",
  greet() { return this.name; },
};
user.greet(); // "Dev"

const fn = user.greet;
fn(); // undefined in strict mode — lost this
\`\`\`

Arrow functions **don't have their own \`this\`** — they inherit from the enclosing scope.

## Practice

Build \`makeCounter()\` returning \`{ increment, get }\` using closures.`,
  },
  {
    pathSlug: PATH,
    slug: "arrays-objects",
    title: "Arrays & Objects",
    description: "map, filter, reduce, destructuring, and spread.",
    level: "beginner",
    minutes: 22,
    content: `## Arrays

\`\`\`javascript
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);           // [2,4,6,8,10]
nums.filter(n => n % 2 === 0);  // [2,4]
nums.reduce((sum, n) => sum + n, 0); // 15
nums.find(n => n > 3);          // 4
nums.includes(3);               // true
\`\`\`

## Objects

\`\`\`javascript
const post = { title: "Hi", views: 0, tags: ["js"] };

post.title;
post["title"];

const { title, views = 0 } = post;
const { tags: postTags } = post;

const updated = { ...post, views: post.views + 1 };
\`\`\`

## Array destructuring

\`\`\`javascript
const [first, ...rest] = [1, 2, 3];
// first=1, rest=[2,3]
\`\`\`

## When to use what

| Method | Use when |
|--------|----------|
| map | Transform each item |
| filter | Keep some items |
| reduce | Combine into one value |
| find | First match |
| some/every | Test all/any |

## Practice

Given \`users = [{name:"A",age:20},{name:"B",age:17}]\`, get names of users 18+.`,
  },
  {
    pathSlug: PATH,
    slug: "strings-templates",
    title: "Strings & Template Literals",
    description: "Methods, slicing, regex basics, and template strings.",
    level: "beginner",
    minutes: 12,
    content: `## Template literals

\`\`\`javascript
const name = "dev";
const msg = \`Hello, \${name}!\`;
const multiline = \`
  Line 1
  Line 2
\`;
\`\`\`

## Useful string methods

\`\`\`javascript
"  hello  ".trim();
"hello world".includes("world");
"a-b-c".split("-");
["a","b"].join(",");
"file.js".endsWith(".js");
"slug".replace(/\\s+/g, "-");
\`\`\`

## Regex intro

\`\`\`javascript
const email = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
email.test("dev@example.com"); // true
\`\`\`

Use our [Regex Tester](/tools/regex-tester) to experiment.

## Practice

Write \`slugify(title)\` that lowercases and replaces spaces with hyphens.`,
  },
  {
    pathSlug: PATH,
    slug: "errors-debugging",
    title: "Errors & Debugging",
    description: "try/catch, common errors, and DevTools debugging.",
    level: "intermediate",
    minutes: 15,
    content: `## try / catch / finally

\`\`\`javascript
async function load() {
  try {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err.message);
    return [];
  } finally {
    console.log("Request finished");
  }
}
\`\`\`

## Common errors

| Error | Cause |
|-------|-------|
| ReferenceError | Variable not defined |
| TypeError | Wrong type operation |
| SyntaxError | Invalid code |
| JSON.parse error | Invalid JSON |

## Debugging tips

1. \`console.log\` with labels: \`console.log({ user, posts })\`
2. **Breakpoints** in DevTools Sources tab
3. **Network tab** for API failures
4. Read stack traces bottom-up

## Practice

Wrap \`JSON.parse\` in a safe function that returns \`null\` on failure.`,
  },
  {
    pathSlug: PATH,
    slug: "async-promises",
    title: "Async JavaScript: Promises",
    description: "Callbacks vs promises, chaining, and Promise.all.",
    level: "intermediate",
    minutes: 20,
    content: `## Why async?

Network requests, timers, and file I/O take time. JavaScript doesn't block the main thread — it uses callbacks, then promises, then async/await.

## Promises

\`\`\`javascript
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000);
});

p.then(value => console.log(value))
 .catch(err => console.error(err));
\`\`\`

## Chaining

\`\`\`javascript
fetch("/api/user")
  .then(r => r.json())
  .then(user => fetch(\`/api/posts?user=\${user.id}\`))
  .then(r => r.json())
  .then(posts => console.log(posts));
\`\`\`

## Promise.all

\`\`\`javascript
const [user, posts] = await Promise.all([
  fetch("/api/user").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);
\`\`\`

## Practice

Convert a callback \`setTimeout\` to a promise \`delay(ms)\` helper.`,
  },
  {
    pathSlug: PATH,
    slug: "async-await-fetch",
    title: "async/await & Fetch API",
    description: "Modern async syntax and calling REST APIs.",
    level: "intermediate",
    minutes: 22,
    content: `## async/await

\`\`\`javascript
async function getPosts() {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed");
  return res.json();
}
\`\`\`

Cleaner than \`.then()\` chains for sequential logic.

## Fetch options

\`\`\`javascript
await fetch("/api/contact", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ name, email, message }),
});
\`\`\`

See [Fetch JSON POST snippet](/snippets/fetch-json-post).

## Error handling pattern

\`\`\`javascript
async function api(path, options) {
  const res = await fetch(\`/api\${path}\`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
\`\`\`

## Practice

Build \`getPost(slug)\` and \`createPost(body)\` using fetch.`,
  },
  {
    pathSlug: PATH,
    slug: "json-modules",
    title: "JSON & ES Modules",
    description: "Parse/stringify JSON, import/export modules, npm basics.",
    level: "intermediate",
    minutes: 18,
    content: `## JSON

\`\`\`javascript
const obj = { name: "dev", active: true };
const str = JSON.stringify(obj, null, 2);
const back = JSON.parse(str);
\`\`\`

Use [JSON Formatter](/tools/json-formatter) to validate API responses.

## ES modules

\`\`\`javascript
// math.js
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { add } from "./math.js";
\`\`\`

## npm basics

\`\`\`bash
npm init -y
npm install lodash
npm install -D vitest
\`\`\`

\`package.json\` tracks dependencies. \`node_modules\` holds installed packages.

## Practice

Create two files: \`utils.js\` exporting helpers, \`main.js\` importing them.`,
  },
  {
    pathSlug: PATH,
    slug: "dom-browser",
    title: "DOM & Browser APIs",
    description: "Selecting elements, events, and basic DOM manipulation.",
    level: "intermediate",
    minutes: 20,
    content: `## Selecting elements

\`\`\`javascript
document.getElementById("app");
document.querySelector(".btn");
document.querySelectorAll("li");
\`\`\`

## Events

\`\`\`javascript
const btn = document.querySelector("#save");
btn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("clicked");
});
\`\`\`

## Updating the DOM

\`\`\`javascript
const el = document.createElement("p");
el.textContent = "Hello";
el.classList.add("text-muted");
document.body.appendChild(el);
\`\`\`

Modern apps use **React/Vue** instead of manual DOM updates — but understanding the DOM helps you debug and learn frameworks.

## Practice

Build a click counter that updates a \`<span>\` on each button click.`,
  },
  {
    pathSlug: PATH,
    slug: "es6-patterns",
    title: "ES6+ Patterns & Best Practices",
    description: "Modern syntax, immutability, and common patterns.",
    level: "advanced",
    minutes: 25,
    content: `## Modern patterns

\`\`\`javascript
// Optional chaining & nullish coalescing
const city = user?.address?.city ?? "Unknown";

// Logical assignment
config.timeout ||= 5000;

// Array flatMap
const tags = posts.flatMap(p => p.tags);

// Object shorthand
const name = "dev";
const obj = { name, greet() { return this.name; } };
\`\`\`

## Immutability

Prefer spreading over mutation:

\`\`\`javascript
const next = { ...state, count: state.count + 1 };
const items = [...list, newItem];
\`\`\`

## Utility patterns

- [Debounce](/snippets/debounce) — search input
- [Throttle](/snippets/throttle) — scroll handlers
- [Sleep](/snippets/sleep-promise) — polling

## Code quality

- Use ESLint + Prettier
- Prefer small pure functions
- Name things clearly
- Write tests for critical logic

## Practice

Refactor a nested \`if\` chain using early returns and optional chaining.`,
  },
  {
    pathSlug: PATH,
    slug: "project-todo-api",
    title: "Project: Todo App + API Client",
    description: "Capstone — combine everything into a small real project.",
    level: "advanced",
    minutes: 40,
    content: `## Project goals

Build a browser todo app that:

1. Adds/removes todos in memory
2. Persists to \`localStorage\`
3. Optionally fetches a quote from a public API

## Step 1: Data model

\`\`\`javascript
let todos = JSON.parse(localStorage.getItem("todos") || "[]");

function save() {
  localStorage.setItem("todos", JSON.stringify(todos));
}
\`\`\`

## Step 2: CRUD functions

\`\`\`javascript
function addTodo(text) {
  todos.push({ id: Date.now(), text, done: false });
  save();
}

function toggleTodo(id) {
  todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  save();
}
\`\`\`

## Step 3: Render UI

Wire buttons to functions. Re-render list on each change.

## Step 4: API bonus

\`\`\`javascript
async function fetchQuote() {
  const res = await fetch("https://api.quotable.io/random");
  const { content, author } = await res.json();
  return \`"\${content}" — \${author}\`;
}
\`\`\`

## Next steps

- Learn [React](/learn/frontend-react/intro) to componentize this
- Add [TypeScript](/learn/frontend-react/typescript-react)
- Study [Web APIs](/learn/web-apis/http-intro) for your own backend

Congratulations — you've completed JavaScript Fundamentals!`,
  },
];
