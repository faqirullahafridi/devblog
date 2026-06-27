import type { LucideIcon } from "lucide-react";
import {
  Braces,
  KeyRound,
  Regex,
  ArrowLeftRight,
  Clock,
  Fingerprint,
  Hash,
  FileText,
  Database,
  Palette,
  Timer,
  GitCompare,
  Code2,
} from "lucide-react";

export type ToolDef = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  searchTerms: string[];
};

export const TOOLS: ToolDef[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON.",
    icon: Braces,
    searchTerms: ["json", "api"],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode JSON Web Token header and payload.",
    icon: KeyRound,
    searchTerms: ["jwt", "auth", "token"],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions with live matches.",
    icon: Regex,
    searchTerms: ["regex", "javascript"],
  },
  {
    slug: "encode-decode",
    name: "Base64 & URL",
    description: "Encode and decode Base64 and URL strings.",
    icon: ArrowLeftRight,
    searchTerms: ["base64", "encode", "url"],
  },
  {
    slug: "timestamp",
    name: "Timestamp Converter",
    description: "Convert Unix timestamps to readable dates.",
    icon: Clock,
    searchTerms: ["timestamp", "date", "unix"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random UUID v4 identifiers.",
    icon: Fingerprint,
    searchTerms: ["uuid", "id"],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    description: "Generate SHA-256 hashes from text.",
    icon: Hash,
    searchTerms: ["hash", "sha", "security"],
  },
  {
    slug: "markdown-preview",
    name: "Markdown Preview",
    description: "Write markdown and preview styled output.",
    icon: FileText,
    searchTerms: ["markdown", "writing"],
  },
  {
    slug: "sql-formatter",
    name: "SQL Formatter",
    description: "Format and beautify SQL queries.",
    icon: Database,
    searchTerms: ["sql", "database", "postgres"],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    description: "Convert between HEX, RGB, and HSL.",
    icon: Palette,
    searchTerms: ["css", "color", "hex"],
  },
  {
    slug: "cron-parser",
    name: "Cron Parser",
    description: "Explain cron expressions in plain English.",
    icon: Timer,
    searchTerms: ["cron", "schedule", "devops"],
  },
  {
    slug: "text-diff",
    name: "Text Diff",
    description: "Compare two texts line by line.",
    icon: GitCompare,
    searchTerms: ["diff", "git", "compare"],
  },
  {
    slug: "json-to-typescript",
    name: "JSON to TypeScript",
    description: "Generate TypeScript types from JSON.",
    icon: Code2,
    searchTerms: ["typescript", "json", "types"],
  },
];

export function getToolHref(slug: string) {
  return `/tools/${slug}`;
}

export function getToolBySlug(slug: string) {
  return TOOLS.find((t) => t.slug === slug);
}
