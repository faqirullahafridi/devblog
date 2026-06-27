import type { LucideIcon } from "lucide-react";
import { Braces, Code2, Database, Layers, MessageCircle, Server } from "lucide-react";
import { INTERVIEW_EXTRA_QUESTIONS } from "@/lib/content/interview-extra";

export type InterviewQuestion = {
  q: string;
  a: string;
};

export type InterviewTopic = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  questions: InterviewQuestion[];
};

const BASE_TOPICS: InterviewTopic[] = [
  {
    slug: "javascript",
    title: "JavaScript",
    description: "Core JS concepts for frontend and full-stack roles — 16 questions.",
    icon: Braces,
    questions: [
      {
        q: "What is the difference between `let`, `const`, and `var`?",
        a: "`var` is function-scoped and hoisted. `let` and `const` are block-scoped. `const` cannot be reassigned (but object properties can change). Prefer `const` by default, `let` when reassignment is needed.",
      },
      {
        q: "Explain closures with an example.",
        a: "A closure is when a function remembers variables from its outer scope. Example: a counter factory `function makeCounter() { let n = 0; return () => ++n; }` — the inner function closes over `n`.",
      },
      {
        q: "What is the event loop?",
        a: "JS is single-threaded. The event loop processes the call stack, then microtasks (Promises), then macrotasks (setTimeout, I/O). Async callbacks run after the current stack clears.",
      },
      {
        q: "== vs === ?",
        a: "`==` coerces types before comparison. `===` checks value and type without coercion. Always prefer `===` unless you explicitly need coercion.",
      },
      {
        q: "What is hoisting?",
        a: "Declarations are moved to the top of their scope during compilation. `var` and `function` declarations are hoisted; `let`/`const` are in a temporal dead zone until initialized.",
      },
      {
        q: "How does `this` work?",
        a: "In regular functions, `this` depends on call site (object method, call/apply/bind, or global). Arrow functions inherit `this` from enclosing lexical scope.",
      },
    ],
  },
  {
    slug: "python",
    title: "Python",
    description: "Python fundamentals for backend and scripting interviews — 15 questions.",
    icon: Code2,
    questions: [
      {
        q: "List vs tuple?",
        a: "Lists are mutable, tuples are immutable. Tuples can be used as dict keys and are slightly more memory-efficient. Use tuples for fixed collections.",
      },
      {
        q: "What are decorators?",
        a: "Functions that wrap another function to extend behavior without modifying it. `@decorator` syntax applies `decorator(func)` at definition time.",
      },
      {
        q: "Explain `*args` and `**kwargs`.",
        a: "`*args` collects extra positional arguments as a tuple. `**kwargs` collects extra keyword arguments as a dict. Common in flexible APIs.",
      },
      {
        q: "GIL — what is it?",
        a: "The Global Interpreter Lock allows only one thread to execute Python bytecode at a time in CPython. Use multiprocessing or async I/O for parallelism.",
      },
      {
        q: "List comprehension vs map/filter?",
        a: "List comprehensions are often more readable in Python. `map`/`filter` return iterators and work well with functional style. Performance is similar for simple cases.",
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL",
    description: "Database queries, joins, and optimization — 15 questions.",
    icon: Database,
    questions: [
      {
        q: "INNER vs LEFT JOIN?",
        a: "INNER JOIN returns only rows with matches in both tables. LEFT JOIN returns all rows from the left table plus matching right rows (NULL if no match).",
      },
      {
        q: "What is an index?",
        a: "A data structure (often B-tree) that speeds up lookups on columns. Trade-off: faster reads, slower writes and extra storage. Index columns used in WHERE and JOIN.",
      },
      {
        q: "GROUP BY vs HAVING?",
        a: "GROUP BY aggregates rows. HAVING filters groups after aggregation (like WHERE but for groups). Example: `HAVING COUNT(*) > 10`.",
      },
      {
        q: "What is a transaction?",
        a: "A unit of work with ACID properties: Atomicity, Consistency, Isolation, Durability. COMMIT saves changes; ROLLBACK undoes them.",
      },
      {
        q: "Primary key vs unique constraint?",
        a: "Primary key uniquely identifies a row and cannot be NULL. UNIQUE allows one NULL (in most DBs) and a table can have multiple unique constraints.",
      },
    ],
  },
  {
    slug: "react",
    title: "React",
    description: "Components, hooks, and rendering — 15 questions.",
    icon: Layers,
    questions: [
      {
        q: "What is virtual DOM?",
        a: "React keeps a lightweight JS representation of the UI. On state change, it diffs the new virtual DOM with the previous one and updates only changed real DOM nodes.",
      },
      {
        q: "useState vs useRef?",
        a: "`useState` triggers re-render when updated. `useRef` holds mutable values across renders without causing re-render (DOM refs, timers, previous values).",
      },
      {
        q: "When does useEffect run?",
        a: "After paint. With `[]` deps: once on mount. With deps: when deps change. Cleanup runs before next effect or on unmount.",
      },
      {
        q: "Controlled vs uncontrolled inputs?",
        a: "Controlled: value from React state, onChange updates state. Uncontrolled: DOM holds value, use ref to read. Controlled is preferred for validation.",
      },
      {
        q: "Keys in lists — why matter?",
        a: "Keys help React identify which items changed, were added, or removed. Use stable unique IDs, not array index when order can change.",
      },
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description: "Types, generics, and tooling — 10 questions.",
    icon: Code2,
    questions: [],
  },
  {
    slug: "nodejs",
    title: "Node.js",
    description: "Runtime, modules, APIs, and backend patterns — 10 questions.",
    icon: Server,
    questions: [],
  },
  {
    slug: "system-design-basics",
    title: "System Design Basics",
    description: "Architecture for junior/mid interviews — 15 questions.",
    icon: Server,
    questions: [
      {
        q: "Horizontal vs vertical scaling?",
        a: "Vertical: bigger machine. Horizontal: more machines. Horizontal scales better long-term but needs load balancing and stateless services.",
      },
      {
        q: "What is caching?",
        a: "Store frequently accessed data closer to the client (browser, CDN, Redis) to reduce latency and database load. Consider TTL and cache invalidation.",
      },
      {
        q: "Load balancer purpose?",
        a: "Distributes traffic across servers, handles health checks, SSL termination, and failover. Algorithms: round-robin, least connections, consistent hashing.",
      },
      {
        q: "SQL vs NoSQL — when?",
        a: "SQL: structured data, relations, transactions. NoSQL: flexible schema, high write throughput, horizontal scale (documents, key-value, wide-column).",
      },
      {
        q: "What is rate limiting?",
        a: "Restrict requests per client/IP/time window to prevent abuse and protect resources. Implement with token bucket or sliding window in Redis or middleware.",
      },
    ],
  },
  {
    slug: "qa-behavioral",
    title: "QA & Behavioral",
    description: "Testing mindset and behavioral questions — 15 questions.",
    icon: MessageCircle,
    questions: [
      {
        q: "How do you test a new API endpoint?",
        a: "Happy path, validation errors, auth, edge cases (empty body, large payload), idempotency if relevant. Manual curl/Postman plus automated integration tests.",
      },
      {
        q: "Unit vs integration vs e2e?",
        a: "Unit: isolated function/module. Integration: multiple components together (API + DB). E2E: full user flow in browser. Pyramid: many unit, fewer e2e.",
      },
      {
        q: "Describe a bug you fixed.",
        a: "Use STAR: Situation, Task, Action, Result. Mention reproduction, root cause, fix, and prevention (test, monitoring, docs).",
      },
      {
        q: "How do you handle conflicting priorities?",
        a: "Clarify impact and deadlines with stakeholders, document trade-offs, deliver MVP first, communicate early if scope slips.",
      },
      {
        q: "How do you learn a new codebase?",
        a: "Read README and architecture docs, run locally, trace one user flow end-to-end, find tests, ask targeted questions, make a small PR early.",
      },
    ],
  },
];

function mergeQuestions(topic: InterviewTopic): InterviewTopic {
  const extra = INTERVIEW_EXTRA_QUESTIONS[topic.slug] ?? [];
  const questions = [...topic.questions, ...extra];
  return {
    ...topic,
    questions,
    description: topic.description.replace(/\d+ questions/, `${questions.length} questions`),
  };
}

export const INTERVIEW_TOPICS: InterviewTopic[] = BASE_TOPICS.map(mergeQuestions);

export function getInterviewHref(slug: string) {
  return `/interview/${slug}`;
}

export function getInterviewTopicBySlug(slug: string) {
  return INTERVIEW_TOPICS.find((t) => t.slug === slug);
}

export const INTERVIEW_SLUGS = INTERVIEW_TOPICS.map((t) => t.slug);
