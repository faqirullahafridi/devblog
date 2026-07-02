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
    prompts: ["How do I structure a REST API?", "Review this React hook pattern", "Explain dependency injection"],
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
    placeholder: "Describe the function or component…",
    icon: Sparkles,
    accent: "text-primary",
    iconBg: "bg-muted border-2 border-foreground",
    prompts: ["Create a debounce hook", "Write a Zod schema for a user", "Build a pagination component"],
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

export function getAiMode(mode: string): AiModeConfig {
  return ALL_AI_MODES.find((m) => m.id === mode) ?? AI_MODES[0];
}
