import type { LearnChapter } from "../types";

const PATH = "frontend-react";

export const frontendReactChapters: LearnChapter[] = [
  {
    pathSlug: PATH,
    slug: "intro",
    title: "Introduction to React",
    description:
      "Understand what React is, scaffold a Vite project, and write your first JSX.",
    level: "beginner",
    minutes: 12,
    content: `# Introduction to React

React is a JavaScript library for building user interfaces. Instead of manually updating the DOM when data changes, you describe what the UI should look like for a given state, and React efficiently updates the browser for you. That declarative model is why React powers everything from marketing sites to complex dashboards.

## Why React?

Traditional web pages often use imperative DOM manipulation: find an element, change its text, attach a listener, repeat. As apps grow, that code becomes hard to reason about. React inverts the problem. You write **components**—reusable pieces of UI—and pass **props** (data) into them. When state changes, React re-renders the affected components.

React is not a full framework. It focuses on the view layer. Routing, data fetching, and global state are usually added with libraries like React Router or TanStack Query. That flexibility is a feature: you adopt tools as your app needs them.

## Create a project with Vite

[Vite](https://vite.dev) is the modern default for new React apps. It uses native ES modules in development for fast refresh and bundles with Rollup for production.

\`\`\`bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
\`\`\`

Open the URL Vite prints (usually \`http://localhost:5173\`). You will see a starter page with a counter button. Explore \`src/main.tsx\` (entry point), \`src/App.tsx\` (root component), and \`index.html\` (mount point \`<div id="root">\`).

The entry file typically looks like this:

\`\`\`tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
\`\`\`

\`createRoot\` attaches your React tree to the DOM. \`StrictMode\` runs extra checks in development to surface unsafe patterns.

## JSX: HTML-like syntax in JavaScript

JSX looks like HTML but compiles to plain JavaScript function calls. React 17+ uses an automatic JSX runtime, so you often do not need \`import React from "react"\` in every file.

\`\`\`tsx
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
\`\`\`

Rules to remember:

- **One root element** per return (or use a fragment \`<>...</>\`).
- **JavaScript expressions** go inside curly braces: \`{user.name}\`, \`{items.length}\`.
- **className** instead of \`class\`; **htmlFor** instead of \`for\`.
- **Self-closing tags** must end with \`/\`: \`<img src="..." alt="" />\`.

JSX prevents many XSS issues by escaping values by default. Never use \`dangerouslySetInnerHTML\` unless you fully trust and sanitize the source.

## Your first component

Replace the default \`App\` content with something minimal:

\`\`\`tsx
export default function App() {
  const title = "My React App";
  return (
    <main>
      <h1>{title}</h1>
      <p>Edit src/App.tsx and save to see hot reload.</p>
    </main>
  );
}
\`\`\`

Save the file—the browser updates without a full page reload. That **Fast Refresh** loop is central to React development productivity.

## Mental model

Think in three layers: **components** (structure), **state** (data that changes over time), and **effects** (syncing with the outside world). This chapter covered components and JSX; the next chapters add props, state, and effects.

## Summary

- React is declarative: UI = f(state).
- Vite scaffolds a fast dev environment with TypeScript support.
- JSX embeds markup in JavaScript; expressions use \`{}\`.
- Components are functions that return UI; compose them to build apps.

You now have a running project and the vocabulary to read any React codebase.`,
  },
  {
    pathSlug: PATH,
    slug: "components-props",
    title: "Components, Props & Children",
    description:
      "Build reusable UI with function components, pass data via props, and compose with children.",
    level: "beginner",
    minutes: 10,
    content: `# Components, Props & Children

React applications are trees of **components**. A component is a function (or class, in legacy code) that returns JSX. Small, focused components are easier to test, reuse, and reason about than one giant file.

## Function components

Modern React uses function components exclusively for new code:

\`\`\`tsx
function Button({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
}
\`\`\`

Name components with PascalCase (\`UserCard\`, not \`userCard\`). Export them as default or named exports depending on your project convention.

## Props: read-only inputs

**Props** are arguments passed from parent to child. They flow one way: down the tree. A child must never mutate props directly.

\`\`\`tsx
type AvatarProps = {
  src: string;
  alt: string;
  size?: number;
};

function Avatar({ src, alt, size = 40 }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}

function ProfileHeader() {
  return (
    <header>
      <Avatar src="/me.jpg" alt="Developer photo" size={64} />
      <h1>Jane Developer</h1>
    </header>
  );
}
\`\`\`

Optional props use \`?\` in TypeScript or default parameters. Destructure props in the parameter list for clarity.

## Composition over configuration

Instead of dozens of boolean props (\`showIcon\`, \`showBadge\`, \`variant="compact"\`), prefer **composition**: wrap or nest components.

\`\`\`tsx
function Card({ children }: { children: React.ReactNode }) {
  return <article className="card">{children}</article>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="card-title">{children}</h2>;
}

// Usage
<Card>
  <CardTitle>Weekly stats</CardTitle>
  <p>1,240 visitors</p>
</Card>
\`\`\`

This pattern mirrors HTML: \`<ul>\` contains \`<li>\` elements rather than a single mega-component with every option baked in.

## The \`children\` prop

When you write JSX between opening and closing tags, that content becomes \`props.children\`:

\`\`\`tsx
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <nav>...</nav>
      <main>{children}</main>
    </div>
  );
}
\`\`\`

\`React.ReactNode\` accepts strings, numbers, elements, fragments, and arrays—anything renderable.

## Spreading props

Sometimes you want to forward unknown props to a native element:

\`\`\`tsx
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}
\`\`\`

The spread must usually come **before** explicit overrides if you want your defaults to win.

## Keys preview

When mapping arrays to components, each sibling needs a stable \`key\` (covered in depth later). For now, know that keys help React match list items across updates.

## Splitting components thoughtfully

A useful heuristic: if a section of JSX has its own name in your head (“sidebar”, “stat card”, “empty state”), it probably deserves its own component. Start with one file; extract when reuse or testability demands it. Co-locate small components in the same file until they grow or serve multiple routes.

Pass **callbacks** as props when the child needs to notify the parent:

\`\`\`tsx
function TodoItem({ text, onDelete }: { text: string; onDelete: () => void }) {
  return (
    <li>
      {text}
      <button type="button" aria-label="Delete" onClick={onDelete}>
        ×
      </button>
    </li>
  );
}
\`\`\`

The parent owns state; the child emits intent. That separation keeps data flow predictable.

## Common mistakes

- Defining components **inside** another component’s render function creates a new type every render and resets state—define siblings at module scope.
- Passing freshly created objects or functions as props without memoization can cause unnecessary re-renders in optimized children (advanced topic).
- Using plain objects or inline arrow functions as props on every render is fine for most apps; optimize only when profiling shows a problem.

## Summary

- Components are reusable UI functions; props are their inputs.
- Data flows one way: parent → child.
- Use \`children\` and small wrapper components for flexible layouts.
- Prefer composition to giant prop lists.

With props mastered, you are ready to add **state** so components can change over time.`,
  },
  {
    pathSlug: PATH,
    slug: "state-usestate",
    title: "State with useState",
    description:
      "Manage local state, handle events, and wire controlled inputs in React.",
    level: "beginner",
    minutes: 12,
    content: `# State with useState

**State** is data that changes over time and affects what the user sees. When state updates, React re-renders the component and reconciles the DOM. The \`useState\` hook is the primary way to add local state to function components.

## Declaring state

\`\`\`tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
\`\`\`

\`useState(initialValue)\` returns a tuple: current value and an updater function. Call \`setCount\` to schedule a re-render with the new value.

## State updates are asynchronous batches

React may batch multiple \`setState\` calls in one event for performance. If the next value depends on the previous one, use the **functional updater**:

\`\`\`tsx
setCount((prev) => prev + 1);
\`\`\`

This avoids stale closures when several updates happen in the same tick.

## Events in React

React uses **SyntheticEvents** that wrap native browser events. Handlers are camelCase: \`onClick\`, \`onChange\`, \`onSubmit\`.

\`\`\`tsx
function SearchBox() {
  const [query, setQuery] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  return (
    <input
      type="search"
      value={query}
      onChange={handleChange}
      placeholder="Search..."
    />
  );
}
\`\`\`

Pass a **function reference** (\`onClick={handleClick}\`), not an immediate call (\`onClick={handleClick()}\`), unless you intentionally invoke a factory.

## Controlled inputs

An input whose \`value\` is tied to React state is **controlled**. React is the source of truth; the DOM reflects state.

| Input type   | Typical pattern                          |
| ------------ | ---------------------------------------- |
| text         | \`value\` + \`onChange\`                 |
| checkbox     | \`checked\` + \`onChange\`                 |
| select       | \`value\` + \`onChange\` on \`<select>\`   |
| textarea     | same as text                             |

\`\`\`tsx
const [agreed, setAgreed] = useState(false);

<label>
  <input
    type="checkbox"
    checked={agreed}
    onChange={(e) => setAgreed(e.target.checked)}
  />
  I agree to the terms
</label>
\`\`\`

For uncontrolled inputs, use refs (\`useRef\`)—useful for one-off forms or integrating non-React widgets.

## Multiple pieces of state

You can call \`useState\` multiple times. Group related fields into one object only when updates are always coupled:

\`\`\`tsx
const [form, setForm] = useState({ email: "", password: "" });

function updateField(field: "email" | "password", value: string) {
  setForm((prev) => ({ ...prev, [field]: value }));
}
\`\`\`

Spread the previous object when updating nested state to avoid accidental overwrites.

## State placement

Lift state to the **lowest common ancestor** of every component that needs it. If only one component cares about a value, keep state local. Premature global state adds complexity.

## Debugging tips

Log state inside \`useEffect\` or use React DevTools to inspect hooks. If UI does not update, verify you called the setter (not mutating state in place) and that you are reading the correct variable after render.

## Combining related state

When two values always change together—mouse \`x\` and \`y\`, or \`firstName\` and \`lastName\` in a wizard step—store them in one object or one \`useReducer\` call. When they change independently, separate \`useState\` calls keep updates simpler and avoid unrelated re-renders in memoized children.

\`\`\`tsx
const [position, setPosition] = useState({ x: 0, y: 0 });

function moveTo(x: number, y: number) {
  setPosition({ x, y });
}
\`\`\`

Never mutate \`position.x\` directly; always replace the object so React detects the change.

## Summary

- \`useState\` holds local, reactive data.
- Use functional updaters when the new state depends on the old.
- Controlled inputs bind \`value\`/\`checked\` to state and \`onChange\`.
- Place state where it is needed; lift when siblings must share it.

Next you will learn **useEffect** for synchronizing with APIs, timers, and the browser outside pure render logic.`,
  },
  {
    pathSlug: PATH,
    slug: "effects-useeffect",
    title: "Effects with useEffect",
    description:
      "Run side effects after render, control dependency arrays, and clean up subscriptions.",
    level: "intermediate",
    minutes: 15,
    content: `# Effects with useEffect

Rendering should be **pure**: given the same props and state, a component returns the same JSX. Anything that touches the outside world—fetching data, subscribing to events, starting timers—belongs in an **effect**. The \`useEffect\` hook runs code after React commits changes to the DOM.

## Basic syntax

\`\`\`tsx
import { useEffect, useState } from "react";

function DocumentTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  });

  return null;
}
\`\`\`

With no dependency array, the effect runs after **every** render. That is rarely what you want.

## Dependency array

Pass a second argument—an array of values the effect depends on:

\`\`\`tsx
useEffect(() => {
  document.title = \`\${count} items\`;
}, [count]);
\`\`\`

React compares dependencies with \`Object.is\`. The effect re-runs only when \`count\` changes. Include every reactive value from the component body that the effect reads (props, state, functions defined in the component unless stabilized).

An **empty array** \`[]\` means run once after mount (plus Strict Mode double-invoke in development).

## Fetching data

\`\`\`tsx
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (!cancelled) setUser(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
\`\`\`

The \`cancelled\` flag prevents setting state after unmount or when \`userId\` changes mid-flight. Libraries like TanStack Query encapsulate this pattern.

## Cleanup functions

If an effect sets up a subscription, return a cleanup function from the effect:

\`\`\`tsx
useEffect(() => {
  function onResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
\`\`\`

Cleanup runs before the next effect execution and on unmount. Timers, WebSocket connections, and observers should always be torn down.

## When not to use useEffect

Avoid effects for:

- **Deriving data** from props/state—compute during render or use \`useMemo\`.
- **User events**—handle in event handlers (\`onClick\`, \`onSubmit\`).
- **Resetting state on prop change**—prefer \`key={userId}\` on a child or set state during render when safe (React docs: “adjusting state when props change”).

Overusing effects leads to race conditions and hard-to-follow data flow.

## Strict Mode in development

React 18 Strict Mode mounts, unmounts, and remounts components in development to surface missing cleanup. Your effects should tolerate double invocation—another reason cleanup matters.

## Rules of Hooks recap

Call hooks only at the top level of function components or custom hooks—never inside loops, conditions, or nested functions. That guarantees hook order stays consistent across renders.

## Separating concerns with multiple effects

Prefer several focused effects over one large effect with branching logic. If one effect syncs document title and another subscribes to a WebSocket, splitting them clarifies dependencies and cleanup:

\`\`\`tsx
useEffect(() => {
  document.title = pageTitle;
}, [pageTitle]);

useEffect(() => {
  const socket = connect(userId);
  return () => socket.close();
}, [userId]);
\`\`\`

Each effect documents one relationship between React state and the outside world.

## Layout effects

\`useLayoutEffect\` fires synchronously after DOM updates but before the browser paints. Use it sparingly—for measuring element size or synchronizing scroll position when \`useEffect\` would cause visible flicker. For most side effects, stick with \`useEffect\`.

## Summary

- \`useEffect\` synchronizes React with external systems after paint.
- The dependency array controls when the effect re-runs; omit nothing the effect uses.
- Return cleanup to avoid leaks and stale updates.
- Prefer event handlers and derived render logic over effects when possible.

You can now combine state and effects to build interactive views. Next: rendering **lists** and **conditional UI** efficiently.`,
  },
  {
    pathSlug: PATH,
    slug: "lists-keys",
    title: "Lists, Keys & Conditional UI",
    description:
      "Render collections with map(), choose stable keys, and show or hide UI based on state.",
    level: "beginner",
    minutes: 10,
    content: `# Lists, Keys & Conditional UI

Most interfaces repeat structure: comment threads, product grids, navigation items. React uses JavaScript’s \`map\` to turn arrays into element trees. **Keys** tell React which items persisted, moved, or were removed. **Conditional rendering** decides what to show when data or flags change.

## Rendering lists

\`\`\`tsx
type Todo = { id: string; text: string; done: boolean };

function TodoList({ items }: { items: Todo[] }) {
  return (
    <ul>
      {items.map((todo) => (
        <li key={todo.id}>
          <input type="checkbox" checked={todo.done} readOnly />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
\`\`\`

Each element in a list needs a \`key\` on the **top-level sibling** returned from \`map\` (on \`<li>\`, not an inner \`<span>\`).

## Choosing keys

Keys must be **stable**, **unique among siblings**, and **not change** when the same item re-renders.

| Good keys              | Bad keys                          |
| ---------------------- | --------------------------------- |
| Database id            | Array index (if list reorders)    |
| UUID assigned at create| \`Math.random()\` on each render  |

Index as key is acceptable for static lists that never reorder, filter, or insert in the middle. For dynamic lists, use ids.

## Filtering and sorting

Compute derived lists during render—no need for an effect:

\`\`\`tsx
const visible = todos
  .filter((t) => !t.done)
  .sort((a, b) => a.text.localeCompare(b.text));
\`\`\`

Then \`map\` over \`visible\`. Keys stay tied to entity ids, not filtered positions.

## Conditional rendering patterns

**Boolean &&**

\`\`\`tsx
{isLoggedIn && <Dashboard />}
\`\`\`

Beware: \`{count && <Badge />}\` renders \`0\` when count is zero. Use \`count > 0 &&\` or a ternary.

**Ternary**

\`\`\`tsx
{loading ? <Spinner /> : <Content data={data} />}
\`\`\`

**Early return**

\`\`\`tsx
if (!data) return <EmptyState />;
return <Chart data={data} />;
\`\`\`

Early returns keep JSX flat and readable in page-level components.

**Switching component types**

When entirely different components should mount, change \`key\` or use a lookup:

\`\`\`tsx
const views = { list: ListView, grid: GridView } as const;
const View = views[mode];
return <View items={items} />;
\`\`\`

## Fragments in lists

Sometimes you need multiple elements per row without an extra DOM node. Use a Fragment with a key:

\`\`\`tsx
items.map((item) => (
  <Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.definition}</dd>
  </Fragment>
));
\`\`\`

## Empty and loading states

Design explicit UI for zero items and in-flight requests. Empty states reduce confusion and guide the user’s next action.

\`\`\`tsx
if (items.length === 0) {
  return <p>No results. Try a different filter.</p>;
}
\`\`\`

## Performance note

Very long lists may need virtualization (react-window, TanStack Virtual) so only visible rows render. Keys and stable item components still apply.

## Inline vs extracted list items

Extract a \`TodoRow\` component when rows have their own state or handlers. Inline JSX is fine for simple, static rows:

\`\`\`tsx
function TodoRow({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {
  return (
    <li key={todo.id}>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        {todo.text}
      </label>
    </li>
  );
}
\`\`\`

Keeping event handlers in the parent or in the row depends on whether the row needs isolated memoization (\`React.memo\`).

## Nested conditionals

Avoid deeply nested ternaries. Extract boolean variables with meaningful names:

\`\`\`tsx
const showEmpty = !loading && items.length === 0;
const showList = !loading && items.length > 0;

if (loading) return <Spinner />;
if (showEmpty) return <EmptyState />;
if (showList) return <ItemList items={items} />;
\`\`\`

Readable conditions double as documentation for the next developer.

## Summary

- Use \`array.map\` to render lists; put \`key\` on the outermost element in each iteration.
- Prefer stable entity ids over index keys for dynamic lists.
- Conditionals: \`&&\`, ternary, or early return—pick the clearest for each case.
- Filter and sort in render; derive don’t synchronize with effects.

Lists and conditionals appear in almost every form and dashboard. The next chapter applies these ideas to **forms** and validation.`,
  },
  {
    pathSlug: PATH,
    slug: "forms",
    title: "Forms in React",
    description:
      "Handle submissions, controlled fields, and basic client-side validation patterns.",
    level: "intermediate",
    minutes: 12,
    content: `# Forms in React

Forms collect user input and often trigger mutations—creating accounts, posting comments, saving settings. React forms are usually **controlled**: field values live in state, and submit handlers send data to an API or update parent state.

## Controlled form fields

\`\`\`tsx
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log({ name, email, message });
      }}
    >
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </label>
      <button type="submit">Send</button>
    </form>
  );
}
\`\`\`

Always call \`e.preventDefault()\` on submit unless you want a full page navigation.

## Single state object

For larger forms, one state object reduces repetitive setters:

\`\`\`tsx
type FormState = { name: string; email: string };

const [form, setForm] = useState<FormState>({ name: "", email: "" });

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
}

<input name="email" value={form.email} onChange={handleChange} />
\`\`\`

Matching \`name\` attributes to object keys scales cleanly.

## Validation basics

Validation can happen on **blur**, on **change**, or on **submit**. Start simple:

\`\`\`tsx
const [errors, setErrors] = useState<Record<string, string>>({});

function validate(values: FormState) {
  const next: Record<string, string> = {};
  if (!values.email.includes("@")) next.email = "Invalid email";
  if (values.name.length < 2) next.name = "Name is too short";
  return next;
}

function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  const nextErrors = validate(form);
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;
  // proceed with API call
}
\`\`\`

Display errors next to fields and associate them with \`aria-invalid\` and \`aria-describedby\` for accessibility.

## Submitting and loading state

Disable the submit button while a request is in flight to prevent double submission:

\`\`\`tsx
const [submitting, setSubmitting] = useState(false);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSubmitting(true);
  try {
    await fetch("/api/contact", { method: "POST", body: JSON.stringify(form) });
  } finally {
    setSubmitting(false);
  }
}
\`\`\`

Show server errors in a banner if the API returns validation failures.

## Libraries vs hand-rolled

Small forms: hand-rolled state is fine. Complex forms with nested fields, async validation, or field arrays often benefit from **React Hook Form** or **Formik**. They reduce re-renders and centralize validation schemas (e.g. with Zod).

## Uncontrolled forms

For quick prototypes, \`useRef\` and \`FormData\` read values on submit without per-keystroke state:

\`\`\`tsx
const formRef = useRef<HTMLFormElement>(null);

function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  const data = new FormData(formRef.current!);
  console.log(Object.fromEntries(data));
}
\`\`\`

Hybrid approaches use uncontrolled inputs with default values for performance-critical fields.

## Accessibility in forms

Associate labels with controls using \`htmlFor\` and \`id\`. Mark required fields visually and with \`required\` or \`aria-required\`. Group related radios with \`<fieldset>\` and \`<legend>\`. Focus the first invalid field after failed validation so keyboard users know where to fix input.

\`\`\`tsx
<input
  id="email"
  name="email"
  aria-invalid={Boolean(errors.email)}
  aria-describedby={errors.email ? "email-error" : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email}
  </span>
)}
\`\`\`

## Resetting after success

Clear the form or navigate away after a successful submit so users do not accidentally resend:

\`\`\`tsx
await submitContact(form);
setForm({ name: "", email: "", message: "" });
setErrors({});
\`\`\`

Show a success toast or inline confirmation; avoid silent success with no feedback.

## File inputs and select elements

File inputs are often uncontrolled because the browser restricts programmatic value setting for security:

\`\`\`tsx
<input
  type="file"
  accept="image/*"
  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
/>
\`\`\`

For \`<select multiple>\`, \`value\` is an array of selected option values. Radio groups share one \`name\` and update a single state field via \`onChange\` on each input. Test keyboard navigation through the full form before shipping.

## Summary

- Prevent default on submit; keep field values in React state for controlled forms.
- Validate on submit first; add inline validation as UX requirements grow.
- Track \`submitting\` and surface server errors clearly.
- Reach for form libraries when complexity outweighs manual state.

Forms often share logic across pages—next, learn to extract that logic into **custom hooks**.`,
  },
  {
    pathSlug: PATH,
    slug: "custom-hooks",
    title: "Custom Hooks",
    description:
      "Extract reusable stateful logic and implement a useLocalStorage hook pattern.",
    level: "intermediate",
    minutes: 12,
    content: `# Custom Hooks

A **custom hook** is a function whose name starts with \`use\` and that may call other hooks. It lets you share stateful logic between components without duplicating \`useState\`/\`useEffect\` blocks or resorting to higher-order components.

## Why extract hooks?

Imagine two components that both need window width, or both sync theme preference to \`localStorage\`. Copy-pasting hook code violates DRY and makes bug fixes easy to miss. A custom hook encapsulates one concern and returns whatever API your components need.

\`\`\`tsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}
\`\`\`

\`\`\`tsx
function Sidebar() {
  const width = useWindowWidth();
  return width < 768 ? <MobileNav /> : <DesktopNav />;
}
\`\`\`

## Rules still apply

Custom hooks must obey the **Rules of Hooks**: call them at the top level, only from React functions. They are not general utilities—you cannot call \`useState\` inside a regular helper.

## useLocalStorage pattern

Persist state across sessions by reading and writing \`localStorage\`:

\`\`\`tsx
import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded or private mode
    }
  }, [key, value]);

  return [value, setValue] as const;
}
\`\`\`

Usage:

\`\`\`tsx
const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
\`\`\`

Lazy initialization in \`useState\` avoids parsing JSON on every render. The effect writes whenever \`value\` changes.

## Returning stable APIs

Hooks can return arrays (like \`useState\`) or objects. Objects are easier to extend without breaking call sites:

\`\`\`tsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return {
    on,
    toggle: () => setOn((v) => !v),
    setOn,
  };
}
\`\`\`

Memoize returned functions with \`useCallback\` only when passing them to optimized children that depend on referential equality.

## Composing hooks

Hooks can call other hooks. Build \`useAuth\` on top of \`useLocalStorage\` and a fetch effect, or \`useDebouncedValue\` from \`useState\` plus a timer effect. Keep each hook focused on one responsibility.

## Testing custom hooks

Use \`@testing-library/react\`’s \`renderHook\` to mount a hook in isolation and assert on \`result.current\` after \`act\` updates.

## Naming and discovery

Prefix with \`use\` so linters (eslint-plugin-react-hooks) and teammates recognize hook semantics. Colocate hooks in \`hooks/\` or next to the feature they serve.

## useFetch example

Another common extraction wraps data loading:

\`\`\`tsx
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}
\`\`\`

Consumers destructure \`{ data, loading, error }\` without repeating effect boilerplate. For production apps, prefer a dedicated data library with caching and deduplication.

## When not to extract

If logic is used once and fits in ten lines, inlining keeps jump-to-definition simple. Extract when duplication appears or when testing the logic in isolation saves time.

## Documenting hook contracts

Write a one-line JSDoc above exported hooks describing parameters, return shape, and side effects (“subscribes to \`storage\` events”, “persists to localStorage”). Future you—and teammates—will know whether a hook is safe to call conditionally or only once per tree.

## Summary

- Custom hooks share stateful logic; names start with \`use\`.
- \`useLocalStorage\` combines lazy init state with a sync effect.
- Return tuples or objects; compose small hooks into larger ones.
- Extract when you copy the same hook pattern twice—not prematurely.

When many components need the same **context** without prop drilling, reach for React Context— covered next.`,
  },
  {
    pathSlug: PATH,
    slug: "context",
    title: "Context with useContext",
    description:
      "Share data across the tree without prop drilling and learn when Context fits.",
    level: "intermediate",
    minutes: 10,
    content: `# Context with useContext

**Context** lets a provider component supply a value to any descendant, skipping intermediate layers that would otherwise pass the same props repeatedly (**prop drilling**). \`useContext\` reads that value in a child.

## Creating and providing context

\`\`\`tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
\`\`\`

Wrap your app (or a subtree) near the root:

\`\`\`tsx
<ThemeProvider>
  <App />
</ThemeProvider>
\`\`\`

Consumers call \`useTheme()\` anywhere below the provider.

## When to use Context

Good fits:

- **Theme**, locale, or accessibility preferences
- **Authenticated user** snapshot (not the full auth client—that may live in a dedicated library)
- **Feature flags** or CMS config for a section of the app

Poor fits:

- **Every piece of global state**—large contexts cause broad re-renders when value identity changes
- **High-frequency updates** (mouse position, animation frames)—prefer component state, refs, or external stores
- **Server data caches**—use TanStack Query, SWR, or similar

## Performance considerations

When \`Provider value={{ ... }}\` creates a new object every render, all consumers re-render. Mitigations:

- Split contexts (state vs dispatch)
- Memoize the value with \`useMemo\`
- Store frequently changing data outside React (Zustand, Jotai) and subscribe selectively

\`\`\`tsx
const value = useMemo(() => ({ theme, setTheme }), [theme]);
return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
\`\`\`

## Default values

\`createContext(defaultValue)\` supplies a fallback when no provider exists—useful for tests or optional features. For required app context, throw in a custom hook (as in \`useTheme\`) to fail fast.

## Context vs props

Props remain the default for explicit, local data flow. Context is for cross-cutting concerns many distant leaves need. If only two levels separate parent and child, props are simpler.

## Multiple providers

Nest providers for unrelated concerns:

\`\`\`tsx
<AuthProvider>
  <ThemeProvider>
    <RouterProvider router={router} />
  </ThemeProvider>
</AuthProvider>
\`\`\`

Order matters if inner hooks depend on outer context.

## Context with useReducer

For state plus actions, pair context with \`useReducer\` to avoid unstable function identities:

\`\`\`tsx
type Action = { type: "login"; user: User } | { type: "logout" };

function authReducer(state: User | null, action: Action): User | null {
  switch (action.type) {
    case "login":
      return action.user;
    case "logout":
      return null;
    default:
      return state;
  }
}

const AuthStateContext = createContext<User | null>(null);
const AuthDispatchContext = createContext<React.Dispatch<Action>>(() => {});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, dispatch] = useReducer(authReducer, null);
  return (
    <AuthStateContext.Provider value={user}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}
\`\`\`

Components that only call \`dispatch\` do not re-render when \`user\` changes if they subscribe only to the dispatch context.

## Testing with providers

Wrap components under test with the same providers used in production, or pass initial context values via test-specific providers. Document required providers in Storybook stories for visual regression.

Avoid putting rapidly changing values like scroll position into context consumed by large subtrees. Instead, pass them to the few components that need them, or use a lightweight external store with selectors.

## Summary

- \`createContext\`, \`Provider\`, and \`useContext\` distribute values down the tree.
- Wrap custom hooks around context for typed, safe consumption.
- Use for stable, widely shared settings—not fast-changing or all app state.
- Memoize provider values to limit unnecessary re-renders.

Even with good structure, runtime errors happen. **Error boundaries** catch render failures gracefully.`,
  },
  {
    pathSlug: PATH,
    slug: "error-boundaries",
    title: "Error Boundaries",
    description:
      "Catch rendering errors, show fallback UI, and integrate error handling in React apps.",
    level: "intermediate",
    minutes: 10,
    content: `# Error Boundaries

JavaScript errors during render can break the entire React tree, leaving users with a blank screen. **Error boundaries** are special class components (there is no hook equivalent yet) that catch errors in child renders, lifecycle methods, and constructors—then display fallback UI instead of crashing the whole app.

## What boundaries catch—and miss

**Caught:**

- Errors thrown while rendering child components
- Errors in lifecycle methods of descendants

**Not caught:**

- Event handler errors (wrap in \`try/catch\`)
- Async code (\`setTimeout\`, promises—handle in \`.catch\`)
- Errors in the boundary itself
- Server-side rendering limitations (boundaries work client-side)

For event handlers, use normal try/catch and set error state to show inline feedback.

## Minimal error boundary

\`\`\`tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Boundary caught:", error, info.componentStack);
    // send to Sentry, Datadog, etc.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert">
          <h2>Something went wrong</h2>
          <button type="button" onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
\`\`\`

Wrap risky subtrees—charts, third-party widgets, CMS-driven blocks—so one failure does not take down navigation or layout.

## Granularity strategy

Place boundaries at **route** or **feature** boundaries. A single top-level boundary is a safety net; nested boundaries isolate failures:

\`\`\`tsx
<ErrorBoundary fallback={<SidebarError />}>
  <Sidebar />
</ErrorBoundary>
<ErrorBoundary fallback={<MainError />}>
  <MainContent />
</ErrorBoundary>
\`\`\`

## Resetting after errors

\`getDerivedStateFromError\` flips \`hasError\` until you reset state. Recovery options:

- Button that clears error state (may re-throw if the bug persists)
- Change \`key\` on the boundary when navigating away
- Full page reload as last resort

## Libraries

\`react-error-boundary\` provides a functional-friendly API with \`FallbackComponent\` and \`resetKeys\` props, reducing boilerplate compared to hand-rolled classes.

## Async and data errors

Fetch failures are not render errors. Model them as state:

\`\`\`tsx
if (error) return <ErrorMessage message={error.message} />;
\`\`\`

Combine data error UI with boundaries: network errors inline, unexpected render exceptions in a boundary.

## Production monitoring

Log in \`componentDidCatch\` and forward to your observability stack with user id, route, and component stack. Never log secrets or PII without policy compliance.

## Integrating with React Router

When using a data router, route error elements (\`errorElement\`) handle loader and action failures at the route level—complementary to component error boundaries, not a replacement. Use both: loaders for expected failures, boundaries for unexpected render crashes.

## Development vs production

In development, React’s error overlay shows the stack trace. Boundaries replace that overlay inside their subtree with your fallback. Design fallbacks that help support teams: include a correlation id, link to status page, or offer contact options.

## Summary

- Error boundaries catch render-time errors in descendants only.
- Use class components or \`react-error-boundary\`; handle event/async errors separately.
- Place boundaries around routes and isolated features.
- Provide actionable fallback UI and reset paths.

Production React apps almost always use **TypeScript** for safer props and events—the final chapter covers typing React code.`,
  },
  {
    pathSlug: PATH,
    slug: "typescript-react",
    title: "TypeScript in React",
    description:
      "Type component props, DOM events, and common React patterns with TypeScript.",
    level: "intermediate",
    minutes: 15,
    content: `# TypeScript in React

TypeScript catches prop typos, impossible states, and incorrect event handling before runtime. Vite’s \`react-ts\` template ships with TypeScript configured; this chapter covers patterns you will use daily.

## Typing component props

Define a props type or interface and apply it to the component:

\`\`\`tsx
type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick: () => void;
};

function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      className={\`btn btn-\${variant}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
\`\`\`

For components that accept only \`children\`:

\`\`\`tsx
type Props = { children: React.ReactNode };
\`\`\`

\`ReactNode\` is the union of all renderable values.

## Extending HTML attributes

Wrap native elements and forward standard attributes:

\`\`\`tsx
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

function LabeledInput({ label, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label htmlFor={inputId}>
      {label}
      <input id={inputId} {...rest} />
    </label>
  );
}
\`\`\`

\`ComponentPropsWithoutRef<"button">\` is another handy utility for button wrappers.

## Typing events

React exports typed event interfaces:

\`\`\`tsx
function SearchInput() {
  const [q, setQ] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQ(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(q);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={q} onChange={handleChange} />
    </form>
  );
}
\`\`\`

Use \`ChangeEvent\`, \`FormEvent\`, \`MouseEvent\`, etc., parameterized by the element type.

## useRef types

DOM refs:

\`\`\`tsx
const inputRef = useRef<HTMLInputElement>(null);
inputRef.current?.focus();
\`\`\`

Mutable values without DOM:

\`\`\`tsx
const idRef = useRef<number>(0);
\`\`\`

## Generic components

Lists and tables often need generics:

\`\`\`tsx
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
};

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map((item) => <li key={String(item)}>{renderItem(item)}</li>)}</ul>;
}
\`\`\`

## Typing children with render props

\`\`\`tsx
type DataProps<T> = {
  url: string;
  children: (data: T) => React.ReactNode;
};
\`\`\`

Or use discriminated unions for component variants enforced at compile time.

## Strict null checks

Enable \`strict\` in \`tsconfig.json\`. Use optional chaining and narrow types after loading:

\`\`\`tsx
if (!user) return null;
return <span>{user.email}</span>; // user is narrowed
\`\`\`

## Common pitfalls

- Typing \`useState(null)\` without a union: use \`useState<User | null>(null)\`.
- Casting with \`as any\`—fix the type or use type guards instead.
- Forgetting \`readonly\` props when passing to immutable APIs.

## Typing useReducer and dispatch

\`\`\`tsx
type State = { count: number };
type Action = { type: "increment" } | { type: "add"; amount: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "add":
      return { count: state.count + action.amount };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
dispatch({ type: "add", amount: 5 }); // typed and exhaustive
\`\`\`

Discriminated unions on \`action.type\` give exhaustiveness checking in \`switch\` when \`noImplicitReturns\` is enabled.

## satisfies and const assertions

Use \`as const\` for fixed option lists shared between types and UI:

\`\`\`tsx
const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];
\`\`\`

That keeps runtime arrays and TypeScript types in sync without duplicating string literals.

## Component return types

Usually TypeScript infers \`JSX.Element\`. Explicit \`React.FC\` is discouraged—it implicitly included \`children\` in older types and adds little value. Annotate return types only when exporting APIs for libraries.

## Working with third-party components

When a library exports poorly typed components, wrap them in a typed facade in your codebase rather than sprinkling \`@ts-expect-error\`. Declare module augmentation in a \`*.d.ts\` file if the library ships incomplete types.

Install \`@types/react\` and \`@types/react-dom\` matching your React version. Enable \`jsx: react-jsx\` in \`tsconfig\` for the modern JSX transform used by Vite. Run \`tsc --noEmit\` in CI to catch type regressions on every pull request.

## Summary

- Define explicit prop types; use \`ReactNode\` for children.
- Extend \`HTMLAttributes\` when wrapping DOM elements.
- Use \`React.ChangeEvent<HTMLInputElement>\` and friends for handlers.
- Generics and strict null checks scale types with app complexity.

You now have a full React foundation: components, state, effects, lists, forms, hooks, context, errors, and TypeScript. Build a small project combining each topic to cement the learning.`,
  },
];
