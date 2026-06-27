import type { TemplateDef } from "../templates-config";

export type DemoTheme = {
  accent: string;
  accentLight: string;
  gradientFrom: string;
  gradientTo: string;
  surface: string;
  muted: string;
  brand: string;
};

const PALETTES = [
  { accent: "#6366f1", accentLight: "#818cf8", gradientFrom: "#6366f1", gradientTo: "#8b5cf6", surface: "#0f172a", muted: "#94a3b8" },
  { accent: "#06b6d4", accentLight: "#22d3ee", gradientFrom: "#0891b2", gradientTo: "#6366f1", surface: "#020617", muted: "#94a3b8" },
  { accent: "#f97316", accentLight: "#fb923c", gradientFrom: "#ea580c", gradientTo: "#f43f5e", surface: "#18181b", muted: "#a1a1aa" },
  { accent: "#10b981", accentLight: "#34d399", gradientFrom: "#059669", gradientTo: "#06b6d4", surface: "#0c1222", muted: "#94a3b8" },
  { accent: "#ec4899", accentLight: "#f472b6", gradientFrom: "#db2777", gradientTo: "#8b5cf6", surface: "#0f0a14", muted: "#a8a29e" },
  { accent: "#3b82f6", accentLight: "#60a5fa", gradientFrom: "#2563eb", gradientTo: "#7c3aed", surface: "#0a0f1e", muted: "#94a3b8" },
];

function hashSlug(slug: string): number {
  return slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function getDemoTheme(template: TemplateDef): DemoTheme {
  const palette = PALETTES[hashSlug(template.slug) % PALETTES.length];
  const brand = template.title.split(/[\s—–-]/)[0] || "Studio";
  return { ...palette, brand };
}

export function getDemoHref(slug: string) {
  return `/templates/demo/${slug}`;
}
