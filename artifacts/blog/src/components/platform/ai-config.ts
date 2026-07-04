import {
  Bot,
  Bug,
  Lightbulb,
  Sparkles,
  ArrowLeftRight,
  Zap,
  Database,
  Network,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type AiModeId = "chat" | "debug" | "explain" | "generate" | "convert" | "optimize" | "sql" | "api" | "errors";

/** Hidden from nav until site-generation APIs are ready — re-enable by removing from this set. */
export const AI_HIDDEN_MODE_IDS = new Set<AiModeId>(["generate", "sql", "api"]);

export function isAiModeVisible(id: AiModeId): boolean {
  return !AI_HIDDEN_MODE_IDS.has(id);
}

export type AiModeConfig = {
  id: AiModeId;
  href: string;
  label: string;
  description: string;
  placeholder: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  prompts: string[];
};

function visibleModes(modes: AiModeConfig[]): AiModeConfig[] {
  return modes.filter((m) => isAiModeVisible(m.id));
}

export const AI_MODES: AiModeConfig[] = [
  {
    id: "chat",
    href: "/ai/chat",
    label: "Chat",
    description: "General developer Q&A, architecture, and best practices.",
    placeholder: "Ask anything about code…",
    icon: Bot,
    accent: "text-primary",
    iconBg: "bg-primary/10 border-2 border-foreground",
    prompts: [
      "How do I structure a REST API in Node.js?",
      "Explain this TypeScript generic with an example",
      "What's the best way to handle auth in a SPA?",
    ],
  },
  {
    id: "debug",
    href: "/ai/debug",
    label: "Debug",
    description: "Find root causes and get minimal, targeted fixes.",
    placeholder: "Paste code and describe the bug…",
    icon: Bug,
    accent: "text-destructive",
    iconBg: "bg-destructive/10 border-2 border-foreground",
    prompts: ["Why is this returning undefined?", "Fix this infinite loop", "Trace this TypeError"],
  },
  {
    id: "explain",
    href: "/ai/explain",
    label: "Explain",
    description: "Understand unfamiliar code with clear breakdowns.",
    placeholder: "Paste code to explain…",
    icon: Lightbulb,
    accent: "text-[hsl(var(--warning))]",
    iconBg: "bg-[hsl(var(--warning)/0.15)] border-2 border-foreground",
    prompts: ["Explain this regex", "What does this SQL query do?", "Walk through this algorithm"],
  },
  {
    id: "generate",
    href: "/ai/generate",
    label: "Generate",
    description: "Create production-ready code from a description.",
    placeholder: "Describe the site, component, or feature…",
    icon: Sparkles,
    accent: "text-primary",
    iconBg: "bg-muted border-2 border-foreground",
    prompts: [
      "Build a finest static SaaS landing page (index.html + styles.css + script.js) — hero, features, pricing, testimonials, FAQ, footer",
      "Create a premium static developer portfolio (HTML/CSS/JS) with project showcase and contact form",
      "Design a modern fintech static marketing site — all CSS in styles.css, no React",
    ],
  },
  {
    id: "convert",
    href: "/ai/convert",
    label: "Convert",
    description: "Translate code between languages, keeping logic intact.",
    placeholder: "Paste code and target language (e.g. Python → TypeScript)…",
    icon: ArrowLeftRight,
    accent: "text-[hsl(var(--success))]",
    iconBg: "bg-[hsl(var(--success)/0.12)] border-2 border-foreground",
    prompts: ["Convert this Python to TypeScript", "Port this class to Go", "Rewrite this in Rust"],
  },
];

export const AI_SPECIAL_MODES: AiModeConfig[] = [
  {
    id: "optimize",
    href: "/ai/optimize",
    label: "Optimize",
    description: "Improve performance and readability.",
    placeholder: "Paste code to optimize…",
    icon: Zap,
    accent: "text-primary",
    iconBg: "bg-primary/10 border-2 border-foreground",
    prompts: ["Optimize this loop", "Reduce bundle size for this component"],
  },
  {
    id: "sql",
    href: "/ai/sql",
    label: "SQL",
    description: "Write and explain PostgreSQL queries.",
    placeholder: "Describe the query you need…",
    icon: Database,
    accent: "text-foreground",
    iconBg: "bg-muted border-2 border-foreground",
    prompts: ["Write a query with joins", "Add indexes for this query"],
  },
  {
    id: "api",
    href: "/ai/api",
    label: "API Design",
    description: "Design REST endpoints with examples.",
    placeholder: "Describe the resource or feature…",
    icon: Network,
    accent: "text-primary",
    iconBg: "bg-secondary border-2 border-foreground",
    prompts: ["Design CRUD for users", "Version a breaking API change"],
  },
  {
    id: "errors",
    href: "/ai/errors",
    label: "Explain Errors",
    description: "Decode stack traces and error messages.",
    placeholder: "Paste the error or stack trace…",
    icon: AlertTriangle,
    accent: "text-destructive",
    iconBg: "bg-destructive/10 border-2 border-foreground",
    prompts: ["Explain this stack trace", "Fix CORS error on fetch"],
  },
];

export const ALL_AI_MODES = [...AI_MODES, ...AI_SPECIAL_MODES];

/** Modes shown in nav, home, and mode switchers. */
export const VISIBLE_AI_MODES = visibleModes(ALL_AI_MODES);
export const VISIBLE_AI_MODES_MAIN = visibleModes(AI_MODES);
export const VISIBLE_AI_SPECIAL_MODES = visibleModes(AI_SPECIAL_MODES);

export function getAiMode(mode: string): AiModeConfig {
  return ALL_AI_MODES.find((m) => m.id === mode) ?? VISIBLE_AI_MODES_MAIN[0];
}
