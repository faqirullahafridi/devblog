import { buildPathChapters, introChapter, capstoneChapter } from "./path-factory";

const htmlCssBasics = buildPathChapters("html-css-basics", [
  introChapter(
    "html-css-basics",
    "HTML & CSS",
    "HTML structures content; CSS styles it. Together they form the foundation of every website and web app. Browsers parse HTML into a DOM tree, apply CSS rules, and render pixels. No JavaScript required — mastering these two languages first makes every framework easier later.",
    [
      "Write semantic HTML that search engines and screen readers understand",
      "Lay out pages with Flexbox and CSS Grid",
      "Build responsive layouts that work on phones and desktops",
      "Apply accessibility basics so everyone can use your pages",
    ],
    "Create a folder with `index.html` and `styles.css`. Open `index.html` in your browser (or use the VS Code Live Server extension). No build step needed — edit, save, refresh.",
  ),
  {
    slug: "semantic-html",
    title: "Semantic HTML",
    description: "Use meaningful elements instead of generic divs for structure, SEO, and accessibility.",
    level: "beginner",
    minutes: 15,
    content: `## Why semantics matter

A \`<div>\` with a class name works visually, but machines cannot infer meaning from \`class="header"\` alone. **Semantic elements** — \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<footer>\` — describe the role of content. Screen readers announce landmarks, search engines weigh headings properly, and your teammates read the markup like an outline.

## Document skeleton

Every page should start with a clear structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DevBlog — Learn HTML</title>
  </head>
  <body>
    <header>
      <nav aria-label="Main">...</nav>
    </header>
    <main>
      <h1>Page title</h1>
      <article>...</article>
    </main>
    <footer>...</footer>
  </body>
</html>
\`\`\`

Use **one** \`<h1>\` per page. Subsections use \`<h2>\` through \`<h6>\` without skipping levels.

## Lists, links, and images

- \`<ul>\` / \`<ol>\` for lists; \`<li>\` for items
- \`<a href="...">\` for navigation — avoid \`javascript:void(0)\` for real links
- \`<img src="..." alt="descriptive text">\` — alt text is required for meaningful images

## Forms with labels

Always associate labels with inputs:

\`\`\`html
<label for="email">Email</label>
<input id="email" name="email" type="email" required />
\`\`\`

## Practice

Refactor a div-heavy mockup into semantic HTML. Validate at [validator.w3.org](https://validator.w3.org). Tab through the page and confirm focus order matches reading order.`,
  },
  {
    slug: "flexbox",
    title: "Flexbox Layout",
    description: "Align and distribute items in one dimension with flex containers and flex items.",
    level: "beginner",
    minutes: 18,
    content: `## Flexbox mental model

**Flexbox** lays out children along a main axis (row or column). The parent is a **flex container**; direct children are **flex items**. It solves centering, equal-height columns, and navigation bars without floats or hacks.

\`\`\`css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
\`\`\`

## Key properties

**On the container:**

| Property | Effect |
|----------|--------|
| \`flex-direction\` | \`row\` (default) or \`column\` |
| \`justify-content\` | Align along main axis |
| \`align-items\` | Align along cross axis |
| \`flex-wrap\` | Allow items to wrap |
| \`gap\` | Space between items |

**On items:**

- \`flex: 1\` — grow to fill available space
- \`flex-shrink: 0\` — prevent squishing icons
- \`align-self\` — override alignment for one item

## Common patterns

**Centered card:**

\`\`\`css
.page {
  display: flex;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
}
\`\`\`

**Sticky footer:** wrap content in a column flex container with \`main { flex: 1; }\`.

## DevTools tip

Chrome and Firefox show flex overlays when you inspect an element with \`display: flex\`. Toggle \`justify-content\` and \`align-items\` live to build intuition.

## Practice

Build a horizontal nav with logo left, links right, and a mobile-friendly wrap at narrow widths using \`flex-wrap\` and \`gap\`.`,
  },
  {
    slug: "grid",
    title: "CSS Grid",
    description: "Create two-dimensional layouts with rows, columns, and named areas.",
    level: "intermediate",
    minutes: 20,
    content: `## When to use Grid vs Flexbox

Use **Flexbox** for one-dimensional flows (nav bars, toolbars). Use **CSS Grid** when you need rows *and* columns — dashboards, photo galleries, full-page layouts.

\`\`\`css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
\`\`\`

## Defining tracks

\`grid-template-columns\` accepts fixed sizes (\`200px\`), fractions (\`1fr\`), and \`repeat()\`:

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

\`auto-fill\` with \`minmax()\` creates responsive grids without media queries.

## Grid areas

Name regions for readable layouts:

\`\`\`css
.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  grid-template-columns: 220px 1fr;
}
.sidebar { grid-area: sidebar; }
\`\`\`

## Spanning cells

\`grid-column: 1 / -1\` spans full width. \`grid-row: span 2\` stretches vertically.

## Practice

Recreate a simple dashboard: sidebar, header, main content, and footer using \`grid-template-areas\`. Resize the window and add a media query that stacks to one column below 768px.`,
  },
  {
    slug: "responsive",
    title: "Responsive Design",
    description: "Fluid layouts, media queries, and mobile-first CSS for every screen size.",
    level: "intermediate",
    minutes: 18,
    content: `## Mobile-first approach

Start with styles for small screens, then add **media queries** for larger breakpoints:

\`\`\`css
.container {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
}

@media (min-width: 48rem) {
  .hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}
\`\`\`

Prefer \`min-width\` queries (mobile-first) over \`max-width\` (desktop-first) unless you are retrofitting legacy CSS.

## Fluid typography and spacing

Use \`clamp()\` for type that scales smoothly:

\`\`\`css
h1 {
  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
}
\`\`\`

Relative units — \`rem\`, \`em\`, \`%\`, \`vw\` — respect user font settings better than fixed pixels for text and spacing.

## Images and media

\`\`\`css
img {
  max-width: 100%;
  height: auto;
}
\`\`\`

Use \`<picture>\` or \`srcset\` for art-directed or resolution-specific images.

## Viewport meta tag

Without \`<meta name="viewport" content="width=device-width, initial-scale=1">\`, mobile browsers scale desktop layouts down, breaking touch targets.

## Practice

Take a single-column landing page and add a breakpoint at 768px for a two-column hero. Test in DevTools device mode and on a real phone.`,
  },
  {
    slug: "accessibility",
    title: "Web Accessibility",
    description: "Keyboard navigation, ARIA, color contrast, and inclusive design patterns.",
    level: "intermediate",
    minutes: 20,
    content: `## Accessibility is not optional

Roughly one in six people has a disability that affects how they use the web. Accessible sites also rank better, work on slow connections, and survive legal requirements (WCAG). Good HTML semantics solve most problems before you reach for ARIA.

## Keyboard and focus

Every interactive element must be reachable with **Tab** and activatable with **Enter** or **Space**. Never remove \`outline\` without replacing it:

\`\`\`css
:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
\`\`\`

## Color and contrast

Text needs at least **4.5:1** contrast against its background (3:1 for large text). Do not rely on color alone to convey state — add icons or labels.

## ARIA when HTML is not enough

- \`aria-label\` — accessible name when visible text is missing
- \`aria-expanded\` — toggles like menus
- \`role="alert"\` — live regions for errors

**First rule of ARIA:** do not use ARIA if a native element exists (\`<button>\` not \`<div onclick>\`).

## Testing checklist

1. Tab through the entire page
2. Run [axe DevTools](https://www.deque.com/axe/devtools/) or Lighthouse accessibility audit
3. Zoom to 200% — content should not break
4. Test with a screen reader (VoiceOver on macOS, NVDA on Windows)

## Practice

Fix a modal that traps focus incorrectly and add \`aria-modal="true"\` plus a visible close button with an accessible name.`,
  },
  capstoneChapter("html-css-basics", "Landing Page", [
    "Sketch a single-page product landing: hero, features grid, testimonials, and CTA footer.",
    "Use semantic HTML5 sections and one stylesheet with mobile-first responsive rules.",
    "Implement the features section with CSS Grid (\`repeat(auto-fit, minmax(...))\`) and the nav with Flexbox.",
    "Meet WCAG AA contrast on buttons and ensure all images have alt text.",
    "Deploy as static files on GitHub Pages or Netlify and share the URL.",
  ]),
]);

const tailwindCss = buildPathChapters("tailwind-css", [
  introChapter(
    "tailwind-css",
    "Tailwind CSS",
    "Tailwind is a utility-first CSS framework. Instead of writing custom class names and separate CSS files, you compose small utility classes directly in HTML. The build step scans your markup and emits only the CSS you use, keeping bundles small.",
    [
      "Apply spacing, color, and typography utilities",
      "Build responsive layouts with breakpoint prefixes",
      "Extract repeated patterns into components",
      "Configure dark mode and custom themes",
    ],
    "Run `npm create vite@latest my-tailwind -- --template vanilla-ts`, then follow the [Tailwind Vite guide](https://tailwindcss.com/docs/guides/vite) to add PostCSS and `tailwind.config.js`.",
  ),
  {
    slug: "utilities",
    title: "Core Utilities",
    description: "Spacing, typography, colors, and borders with Tailwind's atomic classes.",
    level: "beginner",
    minutes: 15,
    content: `## Utility-first workflow

Each class maps to one CSS property. Combine them in markup:

\`\`\`html
<p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
  Hello, Tailwind
</p>
\`\`\`

## Spacing scale

Tailwind uses a consistent scale: \`p-4\` (padding), \`m-2\` (margin), \`gap-6\` (flex/grid gap). Numbers map to \`rem\` multiples — \`4\` is typically 1rem.

## Typography

- \`text-sm\`, \`text-base\`, \`text-xl\` — font size
- \`font-medium\`, \`font-bold\` — weight
- \`leading-relaxed\`, \`tracking-wide\` — line height and letter spacing

## Colors

Palette names like \`bg-blue-600\`, \`text-gray-500\`, \`border-red-400\`. Opacity modifiers: \`bg-black/50\`.

## Layout shortcuts

\`\`\`html
<div class="flex items-center justify-between p-4 rounded-lg border border-slate-200 shadow-sm">
  ...
</div>
\`\`\`

## Hover and focus states

Prefix with variants: \`hover:bg-blue-700\`, \`focus:ring-2 focus:ring-blue-500\`.

## Practice

Rebuild a card component using only utilities — no custom CSS. Use the Tailwind docs search to discover classes as you go.`,
  },
  {
    slug: "layout",
    title: "Layout with Tailwind",
    description: "Flexbox, Grid, and container utilities for responsive page structure.",
    level: "beginner",
    minutes: 18,
    content: `## Flex and Grid utilities

Tailwind mirrors CSS with prefixed classes:

\`\`\`html
<nav class="flex items-center justify-between gap-4 px-6 py-3">
  <span class="font-bold">Logo</span>
  <ul class="flex gap-6 text-sm">...</ul>
</nav>
\`\`\`

Grid example:

\`\`\`html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <article class="rounded-xl border p-6">...</article>
</div>
\`\`\`

## Container and max-width

\`container mx-auto px-4\` centers content with horizontal padding. Combine with \`max-w-5xl\` for readable line lengths.

## Responsive prefixes

Breakpoints: \`sm:\`, \`md:\`, \`lg:\`, \`xl:\`, \`2xl:\`. They apply at that width **and above**:

\`\`\`html
<h1 class="text-2xl md:text-4xl lg:text-5xl">Responsive heading</h1>
\`\`\`

## Aspect ratio and sizing

\`aspect-video\`, \`w-full\`, \`h-64\`, \`min-h-screen\` — common layout building blocks.

## Sticky and fixed positioning

\`sticky top-0 z-50 bg-white/80 backdrop-blur\` creates a modern sticky header.

## Practice

Build a three-column feature grid that collapses to one column on mobile using only \`md:grid-cols-3\`. Add a sticky header with a blurred background.`,
  },
  {
    slug: "components",
    title: "Component Patterns",
    description: "Extract reusable UI with @apply, component classes, or framework components.",
    level: "intermediate",
    minutes: 20,
    content: `## When utilities become repetitive

Copy-pasting twenty classes per button invites inconsistency. Tailwind offers several extraction strategies.

## @apply in CSS

\`\`\`css
@layer components {
  .btn-primary {
    @apply inline-flex items-center rounded-md bg-blue-600 px-4 py-2
           text-sm font-medium text-white hover:bg-blue-700
           focus-visible:outline focus-visible:outline-2;
  }
}
\`\`\`

Use \`@apply\` sparingly — prefer utilities in markup for one-off elements.

## Framework components

In React or Vue, wrap markup in a component:

\`\`\`tsx
export function Button({ children, variant = "primary" }: Props) {
  const base = "inline-flex rounded-md px-4 py-2 text-sm font-medium";
  const styles = variant === "primary" ? "bg-blue-600 text-white" : "border";
  return <button className={\`\${base} \${styles}\`}>{children}</button>;
}
\`\`\`

Libraries like **shadcn/ui** copy components into your repo — full control, Tailwind-native.

## Slots and composition

Pass \`className\` through so consumers can extend styles with \`clsx\` or \`tailwind-merge\` to resolve conflicts.

## Design tokens

Extend \`theme\` in \`tailwind.config.js\` for brand colors and fonts instead of hardcoding hex values in JSX.

## Practice

Create a \`Card\` component with header, body, and footer slots. Document which props accept extra \`className\` overrides.`,
  },
  {
    slug: "dark-mode",
    title: "Dark Mode",
    description: "Configure class or media-based dark mode and design dual-theme interfaces.",
    level: "intermediate",
    minutes: 15,
    content: `## Enabling dark mode

In \`tailwind.config.js\`:

\`\`\`js
export default {
  darkMode: "class", // or "media"
  // ...
};
\`\`\`

**class** — you toggle \`dark\` on \`<html>\` (preferred for user choice). **media** — follows \`prefers-color-scheme\`.

## dark: variant

\`\`\`html
<div class="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
  ...
</div>
\`\`\`

Define pairs for surfaces, borders, and muted text. Avoid pure \`#000\` — use slate or zinc scales for softer contrast.

## Toggle implementation

\`\`\`js
function toggleDark() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
}
\`\`\`

On load, read \`localStorage\` or \`matchMedia("(prefers-color-scheme: dark)")\` before paint to prevent flash (add a tiny inline script in \`<head>\`).

## Images and shadows

Reduce shadow opacity in dark mode. Consider separate hero images or CSS filters for illustrations that look flat on dark backgrounds.

## Practice

Add a theme toggle to your layout. Audit every page section for missing \`dark:\` variants on backgrounds and borders.`,
  },
  {
    slug: "plugins",
    title: "Plugins and Configuration",
    description: "Extend Tailwind with official plugins, custom themes, and content paths.",
    level: "intermediate",
    minutes: 18,
    content: `## tailwind.config.js essentials

\`\`\`js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: { brand: { 500: "#6366f1", 600: "#4f46e5" } },
    },
  },
  plugins: [],
};
\`\`\`

The **content** array tells Tailwind which files to scan — missing paths mean missing styles in production.

## Official plugins

- \`@tailwindcss/forms\` — sensible default form styles
- \`@tailwindcss/typography\` — \`prose\` class for markdown content
- \`@tailwindcss/container-queries\` — \`@container\` responsive components

Install and add to \`plugins: [require("@tailwindcss/typography")]\`.

## Custom utilities

\`\`\`js
import plugin from "tailwindcss/plugin";

export default {
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".text-balance": { textWrap: "balance" },
      });
    }),
  ],
};
\`\`\`

## Tailwind v4 note

Newer setups use CSS-first configuration with \`@theme\` directives. Check your project's Tailwind major version in package.json.

## Practice

Add \`@tailwindcss/typography\` and style a blog post preview with \`prose prose-slate dark:prose-invert\`. Extend the theme with one brand color used across buttons and links.`,
  },
  capstoneChapter("tailwind-css", "Dashboard UI", [
    "Design a sidebar + main content dashboard shell with responsive collapse on mobile.",
    "Build stat cards, a data table, and a simple chart placeholder using utility classes only.",
    "Implement dark mode with a persistent toggle and audit contrast on both themes.",
    "Extract Button, Card, and Badge into reusable components with `tailwind-merge`.",
    "Deploy the static build and document your color tokens in a short README.",
  ]),
]);

const vueFundamentals = buildPathChapters("vue-fundamentals", [
  introChapter(
    "vue-fundamentals",
    "Vue.js",
    "Vue 3 is a progressive JavaScript framework for building UIs. Its reactivity system tracks dependencies automatically, and the Composition API lets you organize logic by feature instead of option type. Vue scales from a script tag on a static page to a full SPA with Vue Router and Pinia.",
    [
      "Write templates with directives and interpolations",
      "Use ref, reactive, and computed in the Composition API",
      "Split apps into single-file components",
      "Add routing and global state",
    ],
    "Run `npm create vue@latest` (select TypeScript, Router, and Pinia). `cd` into the project, `npm install`, and `npm run dev`.",
  ),
  {
    slug: "template-syntax",
    title: "Template Syntax",
    description: "Interpolations, directives, event handling, and conditional rendering in Vue templates.",
    level: "beginner",
    minutes: 15,
    content: `## Mustache syntax

Double curly braces render reactive data:

\`\`\`vue
<template>
  <h1>{{ title }}</h1>
  <p>{{ count * 2 }}</p>
</template>
\`\`\`

Vue automatically updates the DOM when \`title\` or \`count\` changes.

## Directives

Directives are special attributes prefixed with \`v-\`:

| Directive | Purpose |
|-----------|---------|
| \`v-if\` / \`v-else\` | Conditional rendering |
| \`v-for\` | List rendering |
| \`v-bind\` or \`:\` | Bind HTML attributes |
| \`v-on\` or \`@\` | Listen to DOM events |
| \`v-model\` | Two-way binding on inputs |

\`\`\`vue
<button @click="count++">Clicked {{ count }} times</button>
<input v-model="search" placeholder="Search..." />
\`\`\`

## v-for keys

Always key list items:

\`\`\`vue
<li v-for="post in posts" :key="post.id">{{ post.title }}</li>
\`\`\`

Keys help Vue reuse DOM nodes efficiently and avoid subtle bugs when lists reorder.

## Class and style binding

\`\`\`vue
<div :class="{ active: isActive, 'text-error': hasError }" />
<p :style="{ color: accentColor }">...</p>
\`\`\`

## Practice

Build a simple todo list template with \`v-for\`, \`v-model\`, and a delete button using \`@click\`. No script logic yet — hardcode an array in \`setup\`.`,
  },
  {
    slug: "composition-api",
    title: "Composition API",
    description: "Organize logic with ref, reactive, computed, watch, and onMounted.",
    level: "beginner",
    minutes: 20,
    content: `## setup() and script setup

\`<script setup>\` is the modern default:

\`\`\`vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const count = ref(0);
const doubled = computed(() => count.value * 2);

onMounted(() => {
  console.log("Component mounted");
});
</script>
\`\`\`

**ref** wraps primitives — access with \`.value\` in script, auto-unwrapped in template. **reactive** works for objects but loses reactivity if destructured.

## computed vs methods

\`computed\` caches until dependencies change; methods run every render. Use computed for derived state:

\`\`\`ts
const filtered = computed(() =>
  items.value.filter((i) => i.name.includes(query.value))
);
\`\`\`

## watch

React to changes with side effects:

\`\`\`ts
watch(query, async (newQuery) => {
  results.value = await fetchResults(newQuery);
});
\`\`\`

Use \`watchEffect\` when you want to track dependencies automatically.

## Composables

Extract reusable logic into functions:

\`\`\`ts
// useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial);
  const inc = () => count.value++;
  return { count, inc };
}
\`\`\`

Composables are Vue's answer to React hooks — share stateful logic across components.

## Practice

Create a \`useFetch(url)\` composable that sets \`data\`, \`error\`, and \`loading\` refs. Use it in a component to load a public API.`,
  },
  {
    slug: "components",
    title: "Components & Props",
    description: "Single-file components, props, emits, and slots for composition.",
    level: "intermediate",
    minutes: 18,
    content: `## Single-file components (SFCs)

\`.vue\` files combine template, script, and scoped styles:

\`\`\`vue
<script setup lang="ts">
defineProps<{ title: string; count?: number }>();
const emit = defineEmits<{ submit: [id: string] }>();
</script>

<template>
  <h2>{{ title }}</h2>
  <button @click="emit('submit', 'abc')">Go</button>
</template>

<style scoped>
h2 { color: var(--accent); }
</style>
\`\`\`

## Props validation

TypeScript props with \`defineProps\` give editor autocomplete. Use \`withDefaults\` for default values.

## v-model on components

\`v-model\` on a child maps to \`modelValue\` prop and \`update:modelValue\` emit — or named models in Vue 3.4+.

## Slots

Default slot for children; named slots for layout regions:

\`\`\`vue
<!-- Card.vue -->
<template>
  <div class="card">
    <header v-if="$slots.header"><slot name="header" /></header>
    <slot />
  </div>
</template>
\`\`\`

## Provide / inject

Pass data deep without prop drilling — useful for theme or auth context in medium-sized trees.

## Practice

Split your todo app into \`TodoList\`, \`TodoItem\`, and \`TodoForm\` components. Pass todos as props and emit \`add\` / \`remove\` events upward.`,
  },
  {
    slug: "router",
    title: "Vue Router",
    description: "Client-side routing with dynamic routes, navigation guards, and lazy loading.",
    level: "intermediate",
    minutes: 20,
    content: `## Basic routing

Vue Router maps URLs to components:

\`\`\`ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/posts/:id", component: PostDetail, props: true },
  ],
});
\`\`\`

In App.vue: \`<router-view />\` renders the matched component. \`<router-link to="/about">\` creates accessible links.

## Dynamic routes

\`route.params.id\` in the component, or pass \`props: true\` to receive params as props.

## Navigation guards

\`\`\`ts
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isLoggedIn()) return "/login";
});
\`\`\`

Use \`meta\` on routes for auth, titles, and layout flags.

## Lazy loading

\`\`\`ts
{ path: "/admin", component: () => import("./pages/Admin.vue") }
\`\`\`

Code-splitting reduces initial bundle size.

## Nested routes

Parent layouts wrap children with a nested \`<router-view />\` — common for settings sections with a sidebar.

## Practice

Add routes for home, post list, and post detail. Implement a 404 catch-all route and set \`document.title\` in a global \`afterEach\` guard.`,
  },
  {
    slug: "pinia",
    title: "Pinia State Management",
    description: "Global stores with actions, getters, and TypeScript-friendly state.",
    level: "intermediate",
    minutes: 18,
    content: `## Why Pinia?

Pinia is Vue's official store. It replaces Vuex with simpler APIs, devtools support, and full TypeScript inference. Use it when many components share server-fetched data, auth session, or cart state.

## Defining a store

\`\`\`ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useUserStore = defineStore("user", () => {
  const name = ref<string | null>(null);
  const isLoggedIn = computed(() => name.value !== null);

  function login(username: string) {
    name.value = username;
  }

  return { name, isLoggedIn, login };
});
\`\`\`

This is the **setup store** style — mirrors Composition API.

## Using stores in components

\`\`\`vue
<script setup lang="ts">
import { useUserStore } from "@/stores/user";
const user = useUserStore();
</script>

<template>
  <p v-if="user.isLoggedIn">Hi, {{ user.name }}</p>
</template>
\`\`\`

Destructure with \`storeToRefs\` to keep reactivity when pulling out state.

## Actions and async

Fetch in store actions, not components, when multiple views need the same data:

\`\`\`ts
async function fetchPosts() {
  loading.value = true;
  posts.value = await api.getPosts();
  loading.value = false;
}
\`\`\`

## Persistence

Combine Pinia with \`pinia-plugin-persistedstate\` for localStorage hydration — common for theme and draft forms.

## Practice

Move todo state from component locals into a Pinia store. Add an action that simulates async save with a loading flag.`,
  },
  capstoneChapter("vue-fundamentals", "Todo App", [
    "Scaffold a Vue 3 app with Router and Pinia. Create routes for All, Active, and Completed todos.",
    "Implement add, toggle, edit, and delete with a Pinia store and persist todos to localStorage.",
    "Build presentational components with slots for empty states and filter tabs.",
    "Add basic form validation and keyboard shortcuts (Enter to add, Escape to cancel edit).",
    "Write a short architecture note explaining props vs store boundaries.",
  ]),
]);

const nextjsFullstack = buildPathChapters("nextjs-fullstack", [
  introChapter(
    "nextjs-fullstack",
    "Next.js",
    "Next.js is a React framework for production apps. It adds file-based routing, server rendering, API routes, and optimized builds on top of React. Version 13+ centers on the App Router with React Server Components as the default rendering model.",
    [
      "Navigate the App Router directory structure",
      "Choose server vs client components deliberately",
      "Build API endpoints alongside your UI",
      "Fetch data and deploy to Vercel",
    ],
    "Run `npx create-next-app@latest my-app` with TypeScript, ESLint, Tailwind, and App Router enabled. `npm run dev` starts at localhost:3000.",
  ),
  {
    slug: "app-router",
    title: "App Router",
    description: "File-system routing, layouts, loading states, and error boundaries in the app directory.",
    level: "beginner",
    minutes: 18,
    content: `## app/ directory conventions

In the App Router, folders define routes and special files define UI:

| File | Role |
|------|------|
| \`page.tsx\` | Route UI (required for public URL) |
| \`layout.tsx\` | Shared wrapper; persists across navigation |
| \`loading.tsx\` | Instant loading UI with Suspense |
| \`error.tsx\` | Error boundary for the segment |
| \`not-found.tsx\` | 404 for the segment |

\`app/blog/[slug]/page.tsx\` maps to \`/blog/:slug\`.

## Layouts nest

Root \`layout.tsx\` wraps the entire app (html, body). Nested layouts add sidebars without remounting parent chrome:

\`\`\`tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
\`\`\`

## Navigation

Use \`<Link href="/about">\` from \`next/link\` for client-side transitions. \`useRouter\` from \`next/navigation\` (not \`next/router\`) for imperative navigation in App Router.

## Server by default

Components in \`app/\` are **Server Components** unless marked \`"use client"\`. That default reduces JavaScript sent to the browser.

## Practice

Create \`app/(marketing)/page.tsx\` and \`app/(marketing)/pricing/page.tsx\` using a route group. Add a shared marketing layout with nav links.`,
  },
  {
    slug: "server-components",
    title: "Server & Client Components",
    description: "When to render on the server, bundle boundaries, and the use client directive.",
    level: "intermediate",
    minutes: 20,
    content: `## Server Components (RSC)

Server Components run only on the server. They can:

- Read files and databases directly
- Keep secrets (API keys) off the client bundle
- Render large dependencies without shipping them to the browser

They cannot use hooks, browser APIs, or event handlers.

## Client Components

Add \`"use client"\` at the top of files that need interactivity:

\`\`\`tsx
"use client";

import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
\`\`\`

Import client components into server components — not the reverse (client cannot import server-only modules).

## Composition pattern

Keep pages as server components; push \`useState\`, \`useEffect\`, and listeners into small client leaf components. Pass serializable props (JSON-safe data) across the boundary.

## Streaming and Suspense

Wrap slow server components in \`<Suspense fallback={<Skeleton />}>\` to stream HTML progressively.

## Practice

Build a product page: server component fetches product JSON; client \`AddToCart\` button manages local state. Verify with bundle analyzer that heavy chart libs stay server-side if only used in RSC.`,
  },
  {
    slug: "api-routes",
    title: "API Routes & Route Handlers",
    description: "Create REST endpoints with Route Handlers in the app directory.",
    level: "intermediate",
    minutes: 18,
    content: `## Route Handlers

\`app/api/posts/route.ts\` exports HTTP method functions:

\`\`\`ts
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await db.query.posts.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const created = await db.insert(posts).values(body).returning();
  return NextResponse.json(created[0], { status: 201 });
}
\`\`\`

Dynamic segments: \`app/api/posts/[id]/route.ts\` receives \`{ params }\`.

## Request helpers

\`request.json()\`, \`request.formData()\`, headers via \`request.headers\`. Return \`NextResponse.json()\`, redirects, or cookies with \`response.cookies.set\`.

## Validation

Validate bodies with Zod before touching the database. Return \`400\` with structured errors.

## Edge vs Node runtime

\`export const runtime = "edge"\` for low-latency globally distributed handlers — with restrictions on Node APIs. Default Node runtime suits ORMs and file system access.

## CORS and auth

Protect admin routes by checking session cookies or JWT in middleware. Public APIs may need explicit CORS headers.

## Practice

Implement CRUD for a \`comments\` resource. Add rate limiting middleware and return proper \`405\` for unsupported methods.`,
  },
  {
    slug: "data-fetching",
    title: "Data Fetching",
    description: "fetch caching, revalidation, server actions, and client-side queries.",
    level: "intermediate",
    minutes: 20,
    content: `## fetch in Server Components

Next.js extends \`fetch\` with caching semantics:

\`\`\`tsx
async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // ISR: refresh every 60s
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}
\`\`\`

\`cache: "no-store"\` opts out for fully dynamic data. \`revalidate: 0\` is similar.

## Parallel data loading

Avoid waterfall requests — start promises together:

\`\`\`tsx
const [user, posts] = await Promise.all([getUser(), getPosts()]);
\`\`\`

## Server Actions

\`"use server"\` functions mutate data from forms without manual API routes:

\`\`\`tsx
async function createPost(formData: FormData) {
  "use server";
  const title = formData.get("title") as string;
  await db.insert(posts).values({ title });
  revalidatePath("/blog");
}
\`\`\`

Wire with \`<form action={createPost}>\`.

## Client fetching

Use TanStack Query or SWR in client components for interactive dashboards, infinite scroll, and optimistic updates — patterns awkward in pure RSC.

## Practice

Build a blog index that ISR-caches posts and a client-side search box that filters already-loaded titles. Add a Server Action to create drafts from an admin form.`,
  },
  {
    slug: "deployment",
    title: "Deployment",
    description: "Environment variables, build output, and shipping Next.js to Vercel or self-hosted.",
    level: "intermediate",
    minutes: 15,
    content: `## Production build

\`npm run build\` compiles routes, analyzes bundles, and generates static pages where possible. \`npm start\` serves the production server (Node).

Fix build errors locally before CI — dynamic routes missing \`generateStaticParams\` may fail if they assume static export incorrectly.

## Environment variables

- \`NEXT_PUBLIC_*\` — exposed to the browser
- Unprefixed vars — server-only (database URLs, secrets)

Set them in Vercel project settings or \`.env.local\` (never commit secrets).

## Vercel deployment

Connect your Git repo; each push previews on a unique URL. Production domain maps to the main branch. Edge middleware and Image Optimization work out of the box.

## Self-hosting

Run \`next start\` behind Nginx or Caddy. Configure \`output: "standalone"\` in \`next.config.js\` for Docker images with minimal footprint.

## Observability

Enable Web Vitals in Vercel Analytics or integrate Sentry for server and client errors. Log slow database queries in Route Handlers.

## Practice

Deploy a demo app to Vercel with a \`DATABASE_URL\` secret. Confirm preview deployments run on pull requests and production updates only on merge to main.`,
  },
  capstoneChapter("nextjs-fullstack", "Full-Stack Blog", [
    "Model posts with slug, title, markdown body, and publishedAt. Use a database or JSON file for prototyping.",
    "Build public pages: home (post list), post detail with MDX or markdown rendering, and RSS feed route.",
    "Add admin Server Actions or API routes to create and publish posts behind simple auth.",
    "Configure ISR or on-demand revalidation when posts change.",
    "Deploy to Vercel with environment variables and share the live URL.",
  ]),
]);

const djangoWeb = buildPathChapters("django-web", [
  introChapter(
    "django-web",
    "Django",
    "Django is a batteries-included Python web framework. It provides an ORM, admin panel, authentication, templating, and URL routing — everything needed to ship a content site or API quickly. Django follows MTV (Model-Template-View) and emphasizes explicit, secure defaults.",
    [
      "Create projects and apps with django-admin",
      "Define models and run migrations",
      "Wire URLs to views and templates",
      "Customize the admin and introduce DRF",
    ],
    "Install with `pip install django`, then `django-admin startproject mysite` and `python manage.py runserver`. Use a virtual environment (`python -m venv .venv`).",
  ),
  {
    slug: "models",
    title: "Models & the ORM",
    description: "Define database tables as Python classes and query with Django's ORM.",
    level: "beginner",
    minutes: 20,
    content: `## Defining models

Models live in \`models.py\`:

\`\`\`python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    body = models.TextField()
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.title
\`\`\`

Each model maps to a database table; fields map to columns with types enforced in Python and SQL.

## Migrations

\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

Migrations version your schema. Commit them to git like application code. Never edit applied migrations in shared branches — create new ones instead.

## Querying

\`\`\`python
Post.objects.filter(published=True).order_by("-created_at")[:10]
Post.objects.get(slug="hello-world")
Post.objects.create(title="Draft", slug="draft", body="...")
\`\`\`

Use \`select_related\` and \`prefetch_related\` to avoid N+1 queries when templates access foreign keys.

## Relationships

\`ForeignKey\`, \`ManyToManyField\`, and \`OneToOneField\` model real-world relations. Add \`related_name\` for reverse accessors.

## Practice

Add a \`Category\` model with a foreign key from \`Post\`. Seed data via a management command or Django shell. List posts by category in the shell.`,
  },
  {
    slug: "views",
    title: "Views & URL Routing",
    description: "Function and class-based views, URLconf, and request/response cycle.",
    level: "beginner",
    minutes: 18,
    content: `## URL configuration

\`mysite/urls.py\` includes app routes:

\`\`\`python
from django.urls import path
from . import views

urlpatterns = [
    path("", views.post_list, name="post_list"),
    path("posts/<slug:slug>/", views.post_detail, name="post_detail"),
]
\`\`\`

Names enable reverse lookups: \`reverse("post_detail", kwargs={"slug": "hello"})\`.

## Function-based views

\`\`\`python
from django.shortcuts import render, get_object_or_404
from .models import Post

def post_detail(request, slug):
    post = get_object_or_404(Post, slug=slug, published=True)
    return render(request, "blog/detail.html", {"post": post})
\`\`\`

\`request\` carries method, GET/POST data, user, and session.

## Class-based views

\`ListView\` and \`DetailView\` reduce boilerplate:

\`\`\`python
class PostListView(ListView):
    model = Post
    queryset = Post.objects.filter(published=True)
    template_name = "blog/list.html"
    context_object_name = "posts"
\`\`\`

Override \`get_queryset\` for dynamic filters.

## HTTP responses

Return \`HttpResponse\`, \`JsonResponse\`, redirects with \`redirect()\`, or \`HttpResponseNotFound\`. Use \`@require_POST\` for unsafe methods.

## Practice

Add a search view accepting \`?q=\` and filtering titles. Write a test that asserts 404 for unpublished slugs.`,
  },
  {
    slug: "templates",
    title: "Templates",
    description: "Django template language, inheritance, and static files.",
    level: "beginner",
    minutes: 18,
    content: `## Template inheritance

\`base.html\` defines blocks; child templates fill them:

\`\`\`html
<!-- templates/base.html -->
<!DOCTYPE html>
<html>
  <head><title>{% block title %}Blog{% endblock %}</title></head>
  <body>
    {% include "partials/nav.html" %}
    <main>{% block content %}{% endblock %}</main>
  </body>
</html>
\`\`\`

\`\`\`html
{% extends "base.html" %}
{% block title %}{{ post.title }} — Blog{% endblock %}
{% block content %}
  <article><h1>{{ post.title }}</h1>{{ post.body|linebreaks }}</article>
{% endblock %}
\`\`\`

## Template tags and filters

\`{% for %}\`, \`{% if %}\`, \`{{ value|date:"M d, Y" }}\`. Custom tags live in \`templatetags/\`.

## Static files

Put CSS/JS in \`app/static/\`. Use \`{% load static %}\` and \`<link href="{% static 'blog/style.css' %}">\`. Run \`collectstatic\` in production.

## Context processors

Inject global variables (site name, request.user) via settings \`TEMPLATES\` \`context_processors\`.

## Security

Templates auto-escape HTML by default. Mark safe content carefully with \`|safe\` only when sanitized.

## Practice

Build a paginated post list using \`{% for %}\` and Django's \`Paginator\` in the view. Add breadcrumbs partial with \`url\` template tag.`,
  },
  {
    slug: "admin",
    title: "Django Admin",
    description: "Register models, customize list displays, and build internal tooling fast.",
    level: "intermediate",
    minutes: 15,
    content: `## Registering models

\`admin.py\`:

\`\`\`python
from django.contrib import admin
from .models import Post, Category

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "published", "created_at")
    list_filter = ("published", "category")
    search_fields = ("title", "body")
    prepopulated_fields = {"slug": ("title",)}
\`\`\`

Create a superuser with \`python manage.py createsuperuser\` and visit \`/admin/\`.

## Inline editing

Edit related objects on the same page:

\`\`\`python
class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1

class PostAdmin(admin.ModelAdmin):
    inlines = [CommentInline]
\`\`\`

## Permissions

Use built-in groups and permissions, or override \`has_change_permission\` for row-level rules. Do not expose admin publicly without strong auth and IP restrictions.

## Custom actions

Bulk publish posts:

\`\`\`python
@admin.action(description="Publish selected posts")
def publish(modeladmin, request, queryset):
    queryset.update(published=True)
\`\`\`

## Admin as productivity tool

The admin is not your public UI — it is for editors and support. Invest in filters and search for content teams.

## Practice

Customize Post admin with \`date_hierarchy = "created_at"\` and readonly \`created_at\`. Add an action to unpublish posts.`,
  },
  {
    slug: "drf-intro",
    title: "Django REST Framework Intro",
    description: "Serializers, API views, and browsable JSON APIs alongside Django models.",
    level: "intermediate",
    minutes: 20,
    content: `## Install DRF

\`\`\`bash
pip install djangorestframework
\`\`\`

Add \`rest_framework\` to \`INSTALLED_APPS\`.

## Serializers

Convert models to JSON and validate input:

\`\`\`python
from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ["id", "title", "slug", "body", "published", "created_at"]
        read_only_fields = ["created_at"]
\`\`\`

## API views

\`\`\`python
from rest_framework import generics
from .models import Post
from .serializers import PostSerializer

class PostListCreate(generics.ListCreateAPIView):
    queryset = Post.objects.filter(published=True)
    serializer_class = PostSerializer
\`\`\`

Wire URLs with \`path("api/posts/", PostListCreate.as_view())\`.

## Authentication & permissions

Default to authenticated writes:

\`\`\`python
permission_classes = [permissions.IsAuthenticatedOrReadOnly]
\`\`\`

Use token, session, or JWT (via \`djangorestframework-simplejwt\`) depending on clients.

## Pagination and filtering

\`PageNumberPagination\` keeps responses small. \`django-filter\` adds query param filters for list endpoints.

## Practice

Expose read-only post detail at \`/api/posts/<slug>/\`. Test with \`curl\` and the browsable API in the browser. Return 404 JSON for missing slugs.`,
  },
  capstoneChapter("django-web", "Blog with Admin & API", [
    "Build a blog with categories, posts, and published/draft workflow editable in admin.",
    "Create public list and detail templates with pagination and SEO-friendly slugs.",
    "Add DRF endpoints for posts (list, detail, create for staff users).",
    "Write pytest-django tests for views and API permissions.",
    "Deploy to Railway or Fly.io with PostgreSQL and document environment setup.",
  ]),
]);

const flaskApis = buildPathChapters("flask-apis", [
  introChapter(
    "flask-apis",
    "Flask",
    "Flask is a lightweight WSGI web framework for Python. It gives you routing, request/response objects, and extensions without imposing project layout. Flask excels at small-to-medium APIs and microservices where you want explicit control over each layer.",
    [
      "Map URLs to Python functions",
      "Structure apps with blueprints",
      "Persist data with SQLAlchemy",
      "Add auth and automated tests",
    ],
    "`pip install flask` then create `app.py` with a minimal app and `flask --app app run --debug`. Use a virtual environment.",
  ),
  {
    slug: "routes",
    title: "Routes & Request Handling",
    description: "HTTP methods, request args, JSON bodies, and response helpers.",
    level: "beginner",
    minutes: 15,
    content: `## Minimal Flask app

\`\`\`python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/echo")
def echo():
    data = request.get_json(force=True)
    return jsonify(data), 201
\`\`\`

Decorators \`@app.get\`, \`@app.post\`, etc. register routes. Return tuples \`(body, status)\` for custom codes.

## Request data

- \`request.args\` — query string (\`?page=2\`)
- \`request.form\` — HTML form fields
- \`request.get_json()\` — JSON body
- \`request.headers\` — auth tokens, content type

Validate early and return \`400\` with error messages.

## URL variables

\`\`\`python
@app.get("/users/<int:user_id>")
def get_user(user_id: int):
    ...
\`\`\`

Converters: \`string\` (default), \`int\`, \`float\`, \`path\`, \`uuid\`.

## Error handling

\`\`\`python
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404
\`\`\`

Consistent JSON error shapes help API clients.

## Practice

Build endpoints for a notes resource using an in-memory dict. Support GET list, GET by id, POST create, and DELETE with proper status codes.`,
  },
  {
    slug: "blueprints",
    title: "Blueprints & App Structure",
    description: "Modularize large Flask apps with blueprints and application factories.",
    level: "intermediate",
    minutes: 18,
    content: `## Why blueprints?

As apps grow, a single \`app.py\` becomes unmaintainable. **Blueprints** group related routes, templates, and static files — like Django apps or Express routers.

\`\`\`python
# api/posts.py
from flask import Blueprint, jsonify

bp = Blueprint("posts", __name__, url_prefix="/api/posts")

@bp.get("/")
def list_posts():
    return jsonify([])
\`\`\`

Register in the factory:

\`\`\`python
def create_app():
    app = Flask(__name__)
    from .api.posts import bp as posts_bp
    app.register_blueprint(posts_bp)
    return app
\`\`\`

## Application factory pattern

\`create_app()\` enables multiple configs (testing vs production) and avoids global state:

\`\`\`python
app = create_app()
\`\`\`

CLI: \`flask --app mypackage:create_app run\`.

## Configuration

Load from \`config.py\` or environment:

\`\`\`python
app.config.from_prefixed_env()  # FLASK_SECRET_KEY → SECRET_KEY
\`\`\`

Never hardcode secrets.

## Extensions initialization

Initialize SQLAlchemy, Migrate, and JWT on the app inside \`create_app\` so tests get isolated instances.

## Practice

Split your notes API into \`auth\` and \`notes\` blueprints. Add a \`/api\` version prefix and register both in a factory with a test config.`,
  },
  {
    slug: "sqlalchemy",
    title: "SQLAlchemy & Migrations",
    description: "ORM models, sessions, queries, and Flask-Migrate for schema changes.",
    level: "intermediate",
    minutes: 20,
    content: `## Flask-SQLAlchemy setup

\`\`\`python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    body = db.Column(db.Text, default="")
\`\`\`

In \`create_app\`: \`db.init_app(app)\` and set \`SQLALCHEMY_DATABASE_URI\` (SQLite for dev, Postgres in prod).

## CRUD patterns

\`\`\`python
note = Note(title="Buy milk", body="...")
db.session.add(note)
db.session.commit()

Note.query.filter_by(title="Buy milk").first()
db.session.delete(note)
db.session.commit()
\`\`\`

Use transactions — rollback on exceptions.

## Flask-Migrate

\`\`\`bash
flask db init
flask db migrate -m "create notes"
flask db upgrade
\`\`\`

Alembic tracks revisions under \`migrations/\`.

## Relationships

\`\`\`python
class User(db.Model):
    notes = db.relationship("Note", backref="author", lazy=True)
\`\`\`

Add \`user_id = db.Column(db.Integer, db.ForeignKey("user.id"))\` on \`Note\`.

## Practice

Replace the in-memory store with SQLAlchemy models. Add a \`created_at\` column via migration and order list endpoints by newest first.`,
  },
  {
    slug: "auth",
    title: "Authentication",
    description: "Sessions, JWT, password hashing, and protecting routes.",
    level: "intermediate",
    minutes: 20,
    content: `## Password hashing

Never store plaintext passwords. Use Werkzeug helpers:

\`\`\`python
from werkzeug.security import generate_password_hash, check_password_hash

user.password_hash = generate_password_hash(password)
check_password_hash(user.password_hash, password)  # True if match
\`\`\`

## Session-based auth

Flask sessions are signed cookies:

\`\`\`python
from flask import session

session["user_id"] = user.id
\`\`\`

Set \`SECRET_KEY\` to a long random string. Good for server-rendered forms; less ideal for mobile SPAs.

## JWT for APIs

\`flask-jwt-extended\` issues tokens:

\`\`\`python
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@bp.post("/login")
def login():
    ...
    return jsonify(access_token=create_access_token(identity=user.id))

@bp.get("/me")
@jwt_required()
def me():
    return jsonify(user_id=get_jwt_identity())
\`\`\`

Send \`Authorization: Bearer <token>\` from clients.

## Decorator guards

Write \`@login_required\` that returns \`401\` JSON for API blueprints.

## Practice

Add register/login routes. Protect note mutations so users only edit their own rows. Return \`403\` when ownership fails.`,
  },
  {
    slug: "testing",
    title: "Testing Flask APIs",
    description: "pytest fixtures, test client, and testing authenticated endpoints.",
    level: "intermediate",
    minutes: 18,
    content: `## Test client

\`\`\`python
import pytest
from myapp import create_app, db

@pytest.fixture
def app():
    app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:"})
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()
\`\`\`

## Example tests

\`\`\`python
def test_create_note(client):
    res = client.post("/api/notes/", json={"title": "Test"})
    assert res.status_code == 201
    assert res.get_json()["title"] == "Test"

def test_not_found(client):
    assert client.get("/api/notes/999").status_code == 404
\`\`\`

## Auth in tests

Login once in a fixture and reuse headers:

\`\`\`python
@pytest.fixture
def auth_headers(client):
    client.post("/api/register", json={...})
    token = client.post("/api/login", json={...}).get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
\`\`\`

## Factory pattern for data

Use \`factory_boy\` or helper functions to seed users and notes — keeps tests readable.

## Coverage

Run \`pytest --cov=myapp\` in CI. Focus on auth boundaries and validation errors, not 100% line coverage.

## Practice

Write tests for unauthorized create, successful CRUD, and validation failure when title is missing.`,
  },
  capstoneChapter("flask-apis", "REST API", [
    "Design a versioned `/api/v1` notes API with user registration, JWT auth, and pagination.",
    "Use blueprints, SQLAlchemy models, and Alembic migrations with Postgres in Docker.",
    "Document endpoints in OpenAPI (flask-smorest or manual spec) and add request validation.",
    "Achieve pytest coverage on auth and CRUD paths; run tests in GitHub Actions.",
    "Containerize with Gunicorn and deploy to a PaaS with health check endpoint.",
  ]),
]);

const fastapiModern = buildPathChapters("fastapi-modern", [
  introChapter(
    "fastapi-modern",
    "FastAPI",
    "FastAPI is a modern Python framework for building APIs with standard type hints. It runs on Starlette and Pydantic, offering automatic validation, serialization, and interactive OpenAPI docs. Async support makes it a strong choice for IO-bound services.",
    [
      "Define typed path and query parameters",
      "Validate bodies with Pydantic models",
      "Write async route handlers",
      "Use dependency injection and auto-generated docs",
    ],
    "`pip install fastapi uvicorn[standard]` then create `main.py` with an app and run `uvicorn main:app --reload`.",
  ),
  {
    slug: "routes",
    title: "Routes & Parameters",
    description: "Path operations, query params, status codes, and response models.",
    level: "beginner",
    minutes: 15,
    content: `## First endpoints

\`\`\`python
from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}
\`\`\`

Type hints drive validation — invalid \`item_id\` returns \`422\` with details automatically.

## HTTP methods and status

\`\`\`python
from fastapi import status

@app.post("/items/", status_code=status.HTTP_201_CREATED)
def create_item(...):
    ...
\`\`\`

Use \`HTTPException(status_code=404, detail="Not found")\` for errors.

## Response models

\`\`\`python
class ItemOut(BaseModel):
    id: int
    name: str

@app.get("/items/{id}", response_model=ItemOut)
def get_item(id: int): ...
\`\`\`

Response models filter and document output fields.

## Routers

Split apps with \`APIRouter\` and \`app.include_router(router, prefix="/api")\` — same idea as Flask blueprints.

## Practice

Implement CRUD for items using a dict store. Enforce unique names on create and return proper status codes.`,
  },
  {
    slug: "pydantic",
    title: "Pydantic Models",
    description: "Request/response schemas, validation, and model configuration.",
    level: "beginner",
    minutes: 18,
    content: `## Defining schemas

\`\`\`python
from pydantic import BaseModel, Field, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    age: int | None = None

class UserOut(BaseModel):
    id: int
    email: EmailStr

    model_config = {"from_attributes": True}  # ORM mode
\`\`\`

FastAPI parses JSON into these models before your function runs.

## Validation errors

Invalid payloads return structured \`422\` responses listing field paths — clients can show inline form errors.

## Partial updates

Use optional fields or \`UserUpdate\` with all fields optional for PATCH semantics.

## Nested models

\`\`\`python
class Address(BaseModel):
    city: str
    country: str

class Profile(BaseModel):
    name: str
    address: Address
\`\`\`

## Computed fields

Pydantic v2 \`@computed_field\` derives values for responses without storing them.

## Practice

Add a \`ProductCreate\` model with price > 0 and tags list max length 10. Return \`ProductOut\` without exposing internal cost field.`,
  },
  {
    slug: "async",
    title: "Async Routes",
    description: "async def handlers, awaitable database drivers, and concurrency basics.",
    level: "intermediate",
    minutes: 18,
    content: `## When to use async

FastAPI supports sync and async routes. Use **async** when handlers await IO — HTTP calls, async DB drivers (asyncpg, motor), message queues. CPU-heavy work blocks the event loop; offload to thread pools or workers.

\`\`\`python
import httpx

@app.get("/external")
async def proxy():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://api.example.com/data")
    return r.json()
\`\`\`

## Sync routes in async apps

FastAPI runs sync \`def\` routes in a threadpool so they do not block async routes — fine for quick SQLAlchemy sync code at small scale.

## Lifespan events

\`\`\`python
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()

app = FastAPI(lifespan=lifespan)
\`\`\`

Replace deprecated \`@app.on_event\` startup/shutdown.

## Deployment note

Run with \`uvicorn main:app --workers 4\` for process-level parallelism. Async helps per-worker concurrency, not CPU scaling.

## Practice

Convert an external fetch route to async httpx. Add a lifespan handler that logs startup and shutdown timestamps.`,
  },
  {
    slug: "dependencies",
    title: "Dependency Injection",
    description: "Depends(), shared database sessions, and auth dependencies.",
    level: "intermediate",
    minutes: 20,
    content: `## Depends basics

\`\`\`python
from fastapi import Depends

def pagination(page: int = 1, size: int = 20):
    return {"offset": (page - 1) * size, "limit": size}

@app.get("/items/")
def list_items(p: dict = Depends(pagination)):
    ...
\`\`\`

Dependencies can depend on other dependencies — FastAPI resolves the graph per request.

## Database session

\`\`\`python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{id}")
def get_user(id: int, db: Session = Depends(get_db)):
    return db.get(User, id)
\`\`\`

Yield pattern ensures cleanup after the response.

## Auth dependency

\`\`\`python
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = verify_token(token, db)
    if not user:
        raise HTTPException(status_code=401)
    return user

@app.get("/me")
def me(user: User = Depends(get_current_user)):
    return user
\`\`\`

## Class dependencies

Classes with \`__call__\` work as dependencies for reusable permission checks.

## Testing overrides

\`app.dependency_overrides[get_db] = lambda: test_db\` in pytest fixtures.

## Practice

Extract pagination and auth into dependencies. Override \`get_db\` in tests to use SQLite in memory.`,
  },
  {
    slug: "openapi",
    title: "OpenAPI & Documentation",
    description: "Automatic docs, tags, metadata, and exporting the schema.",
    level: "intermediate",
    minutes: 15,
    content: `## Interactive docs

FastAPI serves **Swagger UI** at \`/docs\` and **ReDoc** at \`/redoc\` automatically from type hints and Pydantic models.

Customize metadata:

\`\`\`python
app = FastAPI(
    title="DevBlog API",
    version="1.0.0",
    description="Internal content API",
)
\`\`\`

## Tags and grouping

\`\`\`python
@app.get("/posts/", tags=["posts"])
def list_posts(): ...
\`\`\`

Pass \`openapi_tags\` with descriptions for cleaner docs.

## Response documentation

Document error models:

\`\`\`python
@app.get("/items/{id}", responses={404: {"description": "Item not found"}})
def get_item(id: int): ...
\`\`\`

## Export OpenAPI JSON

Visit \`/openapi.json\` for the raw schema — feed it to code generators, Postman, or contract tests.

## Hiding routes

Set \`include_in_schema=False\` for health checks or admin hooks you do not want public in docs.

## Practice

Add tag descriptions, document 401/403 on protected routes, and download \`openapi.json\` to generate a TypeScript client with openapi-typescript.`,
  },
  capstoneChapter("fastapi-modern", "Production API", [
    "Build a `/api/v1` service with users, JWT auth, and CRUD for a resource (e.g. bookmarks).",
    "Use Pydantic v2 models, SQLAlchemy 2.0 async or sync sessions via dependencies, and Alembic migrations.",
    "Add integration tests with TestClient and dependency overrides.",
    "Configure CORS, structured logging, and `/health` for orchestrators.",
    "Deploy behind Uvicorn + Docker; verify `/docs` and run a smoke test script against production.",
  ]),
]);

export const frontendPythonPathChapters = [
  ...htmlCssBasics,
  ...tailwindCss,
  ...vueFundamentals,
  ...nextjsFullstack,
  ...djangoWeb,
  ...flaskApis,
  ...fastapiModern,
];
