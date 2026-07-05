import type { LucideIcon } from "lucide-react";
import {
  GitBranch,
  Globe,
  FileCode,
  Braces,
  Database,
  Palette,
  Regex,
  Terminal,
  Keyboard,
  Code2,
  FileText,
  Server,
  Shield,
} from "lucide-react";
import { REF_GUIDES } from "@/lib/content/ref-guides";

export type RefDef = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  relatedTool?: string;
  relatedLearn?: string;
  content: string;
};

const REF_META: Omit<RefDef, "content">[] = [
  { slug: "git", name: "Git Commands", description: "Complete Git reference from first commit to advanced workflows.", icon: GitBranch, relatedTool: "text-diff", relatedLearn: "/learn/devops-git/git-intro" },
  { slug: "http-status-codes", name: "HTTP Status Codes", description: "Every major status code with when to use it and API examples.", icon: Globe, relatedLearn: "/learn/web-apis/status-codes" },
  { slug: "python", name: "Python Cheatsheet", description: "Python syntax, stdlib, patterns, and backend essentials.", icon: FileCode, relatedLearn: "/learn/python-backend/intro" },
  { slug: "javascript", name: "JavaScript Cheatsheet", description: "Modern JS from variables through async, modules, and patterns.", icon: Braces, relatedTool: "json-formatter", relatedLearn: "/learn/javascript-fundamentals/intro" },
  { slug: "sql", name: "SQL Quick Reference", description: "Queries, joins, indexes, transactions, and PostgreSQL tips.", icon: Database, relatedTool: "sql-formatter", relatedLearn: "/learn/sql-databases/sql-intro" },
  { slug: "css", name: "CSS Cheatsheet", description: "Flexbox, Grid, responsive design, and modern CSS.", icon: Palette, relatedTool: "color-converter" },
  { slug: "regex-patterns", name: "Regex Patterns", description: "Regular expressions for validation, parsing, and search.", icon: Regex, relatedTool: "regex-tester" },
  { slug: "terminal", name: "Terminal Commands", description: "Shell commands for navigation, search, processes, and networking.", icon: Terminal, relatedLearn: "/learn/devops-git/terminal-basics" },
  { slug: "vscode-shortcuts", name: "VS Code Shortcuts", description: "Keyboard shortcuts and productivity tips for VS Code.", icon: Keyboard, relatedLearn: "/ides/vscode" },
  { slug: "json-syntax", name: "JSON Syntax", description: "JSON rules, types, common errors, and API usage.", icon: Code2, relatedTool: "json-formatter", relatedLearn: "/learn/web-apis/json-apis" },
  { slug: "html", name: "HTML Reference", description: "Semantic HTML, forms, accessibility, and SEO meta tags.", icon: FileText },
  { slug: "typescript", name: "TypeScript Reference", description: "Types, generics, utility types, and React patterns.", icon: Code2, relatedLearn: "/learn/frontend-react/typescript-react" },
  { slug: "nodejs", name: "Node.js Reference", description: "Modules, fs, path, env, Express basics, and npm.", icon: Server, relatedLearn: "/learn/web-apis/rest-design" },
  { slug: "jwt-auth", name: "JWT & Auth", description: "JWT structure, claims, verification, and security best practices.", icon: Shield, relatedTool: "jwt-decoder", relatedLearn: "/learn/web-apis/auth-jwt" },
];

export const REF_NAV_ITEMS = REF_META;

export const REFS: RefDef[] = REF_META.map((meta) => ({
  ...meta,
  content: REF_GUIDES[meta.slug] ?? "",
}));

export function getRefHref(slug: string) {
  return `/refs/${slug}`;
}

export function getRefBySlug(slug: string) {
  return REFS.find((r) => r.slug === slug);
}

export const REF_SLUGS = REFS.map((r) => r.slug);
