import type { TemplateDef } from "../templates-config";
import { getUiStyleId, getUiStyleLabel, getUiStyleLayoutHints, type UiStyleId } from "./ui-styles";

export type CategoryFlags = {
  projects: boolean;
  pricing: boolean;
  resume: boolean;
  waitlist: boolean;
};

export function categoryFlags(categoryId: string): CategoryFlags {
  return {
    projects: ["portfolio", "agency-websites", "landing-pages", "business-websites"].includes(categoryId),
    pricing: ["saas-landing-pages", "ai-landing-pages", "startup-pages", "product-launch", "business-websites"].includes(categoryId),
    resume: categoryId === "resume-websites",
    waitlist: ["startup-pages", "product-launch"].includes(categoryId),
  };
}

export type SectionId =
  | "hero-full"
  | "hero-split"
  | "hero-minimal"
  | "intro"
  | "services"
  | "portfolio"
  | "stats"
  | "about"
  | "pricing"
  | "testimonial"
  | "team"
  | "process"
  | "faq"
  | "blog"
  | "clients"
  | "cta"
  | "waitlist"
  | "resume";

export type PagePalette = {
  name: string;
  primary: string;
  primaryDark: string;
  text: string;
  muted: string;
  bg: string;
  bgAlt: string;
  border: string;
  dark?: boolean;
};

export type ServicesLayout = "cards" | "rows" | "bento";
export type PortfolioLayout = "grid" | "featured" | "rows";
export type StatsLayout = "band" | "cards" | "split";
export type TestimonialLayout = "center" | "card" | "split";

export type TemplatePageConfig = {
  label: string;
  uiStyle: UiStyleId;
  uiStyleLabel: string;
  palette: PagePalette;
  fontHeading: string;
  fontBody: string;
  hero: "full" | "split" | "minimal" | "split-reverse";
  sections: SectionId[];
  gridCols: 2 | 3 | 4;
  radius: "none" | "sm" | "lg";
  navStyle: "classic" | "centered" | "minimal";
  servicesLayout: ServicesLayout;
  portfolioLayout: PortfolioLayout;
  statsLayout: StatsLayout;
  testimonialLayout: TestimonialLayout;
};

const PALETTES: PagePalette[] = [
  { name: "Classic Navy", primary: "#1e3a5f", primaryDark: "#152a45", text: "#1a1a1a", muted: "#64748b", bg: "#ffffff", bgAlt: "#f8fafc", border: "#e2e8f0" },
  { name: "Forest & Cream", primary: "#2d5016", primaryDark: "#1a3009", text: "#1c1917", muted: "#78716c", bg: "#faf8f5", bgAlt: "#f0ebe3", border: "#e7e0d5" },
  { name: "Burgundy Editorial", primary: "#7f1d1d", primaryDark: "#5c1515", text: "#1c1917", muted: "#737373", bg: "#fff", bgAlt: "#fafafa", border: "#e5e5e5" },
  { name: "Teal Professional", primary: "#0f766e", primaryDark: "#0d5c56", text: "#134e4a", muted: "#64748b", bg: "#ffffff", bgAlt: "#f0fdfa", border: "#ccfbf1" },
  { name: "Charcoal Luxe", primary: "#c9a962", primaryDark: "#a8884a", text: "#e5e5e5", muted: "#a3a3a3", bg: "#111111", bgAlt: "#1a1a1a", border: "#333", dark: true },
  { name: "Sky SaaS", primary: "#0284c7", primaryDark: "#0369a1", text: "#0f172a", muted: "#64748b", bg: "#ffffff", bgAlt: "#f0f9ff", border: "#e0f2fe" },
  { name: "Warm Startup", primary: "#ea580c", primaryDark: "#c2410c", text: "#1c1917", muted: "#78716c", bg: "#fff", bgAlt: "#fff7ed", border: "#fed7aa" },
  { name: "Slate Minimal", primary: "#334155", primaryDark: "#1e293b", text: "#0f172a", muted: "#94a3b8", bg: "#fafafa", bgAlt: "#f1f5f9", border: "#e2e8f0" },
  { name: "Plum Creative", primary: "#7e22ce", primaryDark: "#6b21a8", text: "#1e1b4b", muted: "#64748b", bg: "#fdfcff", bgAlt: "#f5f3ff", border: "#ede9fe" },
  { name: "Rose Boutique", primary: "#be185d", primaryDark: "#9d174d", text: "#1f2937", muted: "#6b7280", bg: "#fff", bgAlt: "#fdf2f8", border: "#fce7f3" },
  { name: "Olive Studio", primary: "#4d7c0f", primaryDark: "#3f6212", text: "#1c1917", muted: "#78716c", bg: "#fafaf9", bgAlt: "#f5f5f4", border: "#e7e5e4" },
  { name: "Indigo Tech", primary: "#4338ca", primaryDark: "#3730a3", text: "#1e1b4b", muted: "#64748b", bg: "#fff", bgAlt: "#eef2ff", border: "#c7d2fe" },
  { name: "Sand Agency", primary: "#92400e", primaryDark: "#78350f", text: "#292524", muted: "#78716c", bg: "#faf8f5", bgAlt: "#f5f0e8", border: "#e7e0d5" },
  { name: "Midnight Product", primary: "#6366f1", primaryDark: "#4f46e5", text: "#f8fafc", muted: "#94a3b8", bg: "#0f172a", bgAlt: "#1e293b", border: "#334155", dark: true },
  { name: "Coral Launch", primary: "#f43f5e", primaryDark: "#e11d48", text: "#1c1917", muted: "#737373", bg: "#fff", bgAlt: "#fff1f2", border: "#fecdd3" },
  { name: "Graphite Bold", primary: "#18181b", primaryDark: "#09090b", text: "#fafafa", muted: "#a1a1aa", bg: "#27272a", bgAlt: "#3f3f46", border: "#52525b", dark: true },
  { name: "Azure Corporate", primary: "#1d4ed8", primaryDark: "#1e40af", text: "#1e293b", muted: "#64748b", bg: "#ffffff", bgAlt: "#eff6ff", border: "#dbeafe" },
  { name: "Copper Craft", primary: "#b45309", primaryDark: "#92400e", text: "#292524", muted: "#78716c", bg: "#fefce8", bgAlt: "#fef9c3", border: "#fde68a" },
  { name: "Lilac Soft", primary: "#9333ea", primaryDark: "#7e22ce", text: "#3b0764", muted: "#64748b", bg: "#faf5ff", bgAlt: "#f3e8ff", border: "#e9d5ff" },
  { name: "Stone Resume", primary: "#57534e", primaryDark: "#44403c", text: "#1c1917", muted: "#78716c", bg: "#fafaf9", bgAlt: "#f5f5f4", border: "#e7e5e4" },
  { name: "Emerald Growth", primary: "#059669", primaryDark: "#047857", text: "#064e3b", muted: "#64748b", bg: "#ffffff", bgAlt: "#ecfdf5", border: "#a7f3d0" },
  { name: "Amber Energy", primary: "#d97706", primaryDark: "#b45309", text: "#1c1917", muted: "#78716c", bg: "#fffbeb", bgAlt: "#fef3c7", border: "#fde68a" },
  { name: "Ink Portfolio", primary: "#0a0a0a", primaryDark: "#000", text: "#fafafa", muted: "#737373", bg: "#171717", bgAlt: "#262626", border: "#404040", dark: true },
  { name: "Powder Blue", primary: "#38bdf8", primaryDark: "#0ea5e9", text: "#0c4a6e", muted: "#64748b", bg: "#f0f9ff", bgAlt: "#e0f2fe", border: "#bae6fd" },
  { name: "Wine & Gold", primary: "#881337", primaryDark: "#6f1129", text: "#1c1917", muted: "#78716c", bg: "#fff", bgAlt: "#fff1f2", border: "#fecdd3" },
  { name: "Moss & Linen", primary: "#365314", primaryDark: "#1a2e05", text: "#1c1917", muted: "#78716c", bg: "#f7fee7", bgAlt: "#ecfccb", border: "#d9f99d" },
  { name: "Steel SaaS", primary: "#475569", primaryDark: "#334155", text: "#0f172a", muted: "#64748b", bg: "#ffffff", bgAlt: "#f8fafc", border: "#e2e8f0" },
  { name: "Sunset Launch", primary: "#fb923c", primaryDark: "#f97316", text: "#1c1917", muted: "#78716c", bg: "#fff7ed", bgAlt: "#ffedd5", border: "#fed7aa" },
  { name: "Deep Violet", primary: "#5b21b6", primaryDark: "#4c1d95", text: "#f5f3ff", muted: "#a78bfa", bg: "#2e1065", bgAlt: "#3b0764", border: "#6d28d9", dark: true },
  { name: "Paper & Ink", primary: "#1c1917", primaryDark: "#0c0a09", text: "#1c1917", muted: "#78716c", bg: "#fafaf9", bgAlt: "#f5f5f4", border: "#d6d3d1" },
  { name: "Ocean Trust", primary: "#0369a1", primaryDark: "#075985", text: "#0c4a6e", muted: "#64748b", bg: "#ffffff", bgAlt: "#f0f9ff", border: "#bae6fd" },
  { name: "Blush Modern", primary: "#db2777", primaryDark: "#be185d", text: "#1f2937", muted: "#6b7280", bg: "#fff", bgAlt: "#fdf2f8", border: "#fbcfe8" },
  { name: "Carbon AI", primary: "#22d3ee", primaryDark: "#06b6d4", text: "#ecfeff", muted: "#94a3b8", bg: "#0c1222", bgAlt: "#151d2e", border: "#1e293b", dark: true },
  { name: "Harvest", primary: "#ca8a04", primaryDark: "#a16207", text: "#422006", muted: "#78716c", bg: "#fefce8", bgAlt: "#fef9c3", border: "#fde047" },
  { name: "Arctic", primary: "#0891b2", primaryDark: "#0e7490", text: "#164e63", muted: "#64748b", bg: "#ffffff", bgAlt: "#ecfeff", border: "#a5f3fc" },
  { name: "Noir Gold", primary: "#d4af37", primaryDark: "#b8960c", text: "#e5e5e5", muted: "#a3a3a3", bg: "#0a0a0a", bgAlt: "#171717", border: "#262626", dark: true },
  { name: "Clay Studio", primary: "#c2410c", primaryDark: "#9a3412", text: "#431407", muted: "#78716c", bg: "#fff7ed", bgAlt: "#ffedd5", border: "#fdba74" },
  { name: "Denim", primary: "#1e40af", primaryDark: "#1e3a8a", text: "#1e3a8a", muted: "#64748b", bg: "#ffffff", bgAlt: "#eff6ff", border: "#bfdbfe" },
  { name: "Sage Wellness", primary: "#15803d", primaryDark: "#166534", text: "#14532d", muted: "#64748b", bg: "#f0fdf4", bgAlt: "#dcfce7", border: "#bbf7d0" },
];

const FONT_PAIRS = [
  { heading: 'Georgia, "Times New Roman", serif', body: "system-ui, sans-serif", label: "Editorial" },
  { heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif", label: "Modern Sans" },
  { heading: '"Playfair Display", Georgia, serif', body: "Lato, sans-serif", label: "Luxury Serif" },
  { heading: "Montserrat, sans-serif", body: "Open Sans, sans-serif", label: "Geometric" },
  { heading: "Merriweather, serif", body: "Source Sans 3, sans-serif", label: "Classic" },
  { heading: "DM Sans, sans-serif", body: "DM Sans, sans-serif", label: "Clean Product" },
  { heading: "Libre Baskerville, serif", body: "Karla, sans-serif", label: "Publisher" },
  { heading: "Poppins, sans-serif", body: "Nunito, sans-serif", label: "Friendly" },
];

function hash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const HERO_BY_TYPE: Record<TemplatePageConfig["hero"], SectionId> = {
  full: "hero-full",
  split: "hero-split",
  minimal: "hero-minimal",
  "split-reverse": "hero-split",
};

const RECIPES: Record<string, SectionId[][]> = {
  portfolio: [
    ["hero-full", "intro", "portfolio", "about", "testimonial", "clients", "cta"],
    ["hero-minimal", "portfolio", "stats", "process", "testimonial", "blog", "cta"],
    ["hero-split", "intro", "portfolio", "team", "faq", "cta"],
    ["hero-full", "clients", "portfolio", "about", "stats", "cta"],
    ["hero-split", "portfolio", "intro", "testimonial", "process", "blog", "cta"],
    ["hero-minimal", "about", "portfolio", "team", "faq", "clients", "cta"],
    ["hero-full", "stats", "portfolio", "testimonial", "about", "cta"],
    ["hero-split", "portfolio", "process", "team", "testimonial", "cta"],
  ],
  "landing-pages": [
    ["hero-split", "intro", "services", "stats", "testimonial", "faq", "cta"],
    ["hero-full", "clients", "services", "about", "testimonial", "cta"],
    ["hero-minimal", "intro", "services", "process", "faq", "cta"],
    ["hero-split", "stats", "services", "testimonial", "blog", "cta"],
    ["hero-full", "intro", "about", "services", "clients", "cta"],
    ["hero-split", "services", "stats", "testimonial", "faq", "blog", "cta"],
  ],
  "saas-landing-pages": [
    ["hero-split", "intro", "services", "stats", "pricing", "testimonial", "faq", "cta"],
    ["hero-full", "clients", "services", "pricing", "testimonial", "cta"],
    ["hero-minimal", "stats", "services", "pricing", "faq", "waitlist", "cta"],
    ["hero-split", "intro", "pricing", "services", "testimonial", "blog", "cta"],
    ["hero-split", "services", "stats", "pricing", "team", "faq", "cta"],
    ["hero-full", "intro", "pricing", "clients", "testimonial", "cta"],
    ["hero-minimal", "services", "pricing", "stats", "testimonial", "faq", "cta"],
    ["hero-split", "clients", "services", "pricing", "blog", "cta"],
  ],
  "ai-landing-pages": [
    ["hero-full", "intro", "services", "stats", "pricing", "testimonial", "cta"],
    ["hero-split", "clients", "services", "about", "pricing", "faq", "cta"],
    ["hero-minimal", "services", "stats", "testimonial", "pricing", "waitlist", "cta"],
    ["hero-split", "intro", "services", "team", "pricing", "blog", "cta"],
    ["hero-full", "stats", "services", "testimonial", "faq", "cta"],
    ["hero-split", "intro", "pricing", "services", "clients", "cta"],
    ["hero-minimal", "about", "services", "pricing", "testimonial", "faq", "cta"],
    ["hero-full", "clients", "services", "stats", "pricing", "blog", "cta"],
  ],
  "agency-websites": [
    ["hero-full", "intro", "portfolio", "services", "process", "team", "cta"],
    ["hero-split", "clients", "portfolio", "about", "testimonial", "cta"],
    ["hero-minimal", "intro", "services", "portfolio", "team", "faq", "cta"],
    ["hero-split", "portfolio", "stats", "process", "testimonial", "blog", "cta"],
    ["hero-full", "about", "portfolio", "clients", "team", "cta"],
    ["hero-split", "intro", "process", "portfolio", "testimonial", "faq", "cta"],
    ["hero-minimal", "portfolio", "services", "team", "clients", "cta"],
    ["hero-full", "clients", "services", "portfolio", "testimonial", "blog", "cta"],
  ],
  "business-websites": [
    ["hero-split", "intro", "services", "about", "stats", "testimonial", "cta"],
    ["hero-full", "clients", "services", "pricing", "faq", "cta"],
    ["hero-minimal", "intro", "about", "services", "team", "cta"],
    ["hero-split", "stats", "services", "testimonial", "process", "cta"],
    ["hero-full", "intro", "services", "clients", "faq", "blog", "cta"],
    ["hero-split", "about", "services", "stats", "testimonial", "pricing", "cta"],
  ],
  "startup-pages": [
    ["hero-minimal", "intro", "services", "stats", "waitlist", "testimonial", "cta"],
    ["hero-split", "clients", "intro", "services", "waitlist", "faq", "cta"],
    ["hero-full", "stats", "services", "team", "waitlist", "cta"],
    ["hero-split", "intro", "services", "testimonial", "waitlist", "blog", "cta"],
    ["hero-minimal", "services", "stats", "testimonial", "waitlist", "cta"],
    ["hero-full", "intro", "clients", "services", "faq", "waitlist", "cta"],
  ],
  "resume-websites": [
    ["hero-minimal", "resume", "stats", "testimonial", "cta"],
    ["hero-minimal", "resume", "clients", "testimonial", "faq", "cta"],
    ["hero-minimal", "resume", "about", "testimonial", "cta"],
    ["hero-minimal", "resume", "blog", "testimonial", "cta"],
    ["hero-minimal", "resume", "process", "testimonial", "cta"],
  ],
  "product-launch": [
    ["hero-full", "intro", "waitlist", "stats", "testimonial", "cta"],
    ["hero-split", "intro", "services", "waitlist", "faq", "cta"],
    ["hero-minimal", "stats", "waitlist", "testimonial", "clients", "cta"],
    ["hero-split", "intro", "waitlist", "blog", "testimonial", "cta"],
    ["hero-full", "clients", "waitlist", "faq", "testimonial", "cta"],
    ["hero-minimal", "intro", "waitlist", "stats", "blog", "cta"],
  ],
};

function buildSectionList(template: TemplateDef, h: number, hero: TemplatePageConfig["hero"]): SectionId[] {
  const flags = categoryFlags(template.categoryId);
  if (flags.resume) {
    const recipes = RECIPES["resume-websites"];
    const base = recipes[h % recipes.length];
    return base.map((id) => (id.startsWith("hero-") ? HERO_BY_TYPE[hero] : id));
  }

  const recipes = RECIPES[template.categoryId] ?? RECIPES["landing-pages"];
  const recipe = recipes[(h + template.slug.length * 13) % recipes.length];
  let sections = recipe.map((id) => (id.startsWith("hero-") ? HERO_BY_TYPE[hero] : id));

  if (!flags.projects) sections = sections.filter((id) => id !== "portfolio");
  if (!flags.pricing) sections = sections.filter((id) => id !== "pricing");
  if (!flags.waitlist) sections = sections.filter((id) => id !== "waitlist");

  return sections;
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

export function getTemplatePageConfig(template: TemplateDef): TemplatePageConfig {
  const h = hash(template.slug);
  const slugMix = hash(template.slug + template.categoryId);
  const uiStyle = getUiStyleId(template.slug);
  const hints = getUiStyleLayoutHints(uiStyle);
  const palette = PALETTES[(h + slugMix + uiStyle.length) % PALETTES.length];
  const fonts = FONT_PAIRS[(h >> 4) % FONT_PAIRS.length];
  const heroes: TemplatePageConfig["hero"][] = ["full", "split", "minimal", "split-reverse"];
  const hero = hints.hero ?? pick(heroes, h, 5);
  const sections = buildSectionList(template, h, hero);

  return {
    label: `${getUiStyleLabel(uiStyle)} · ${palette.name}`,
    uiStyle,
    uiStyleLabel: getUiStyleLabel(uiStyle),
    palette,
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    hero,
    sections,
    gridCols: hints.gridCols ?? pick([2, 3, 4] as const, slugMix, 6),
    radius: hints.radius ?? pick(["none", "sm", "lg"] as const, slugMix, 7),
    navStyle: hints.navStyle ?? pick(["classic", "centered", "minimal"] as const, slugMix, 8),
    servicesLayout: hints.servicesLayout ?? pick(["cards", "rows", "bento"] as const, h, 9),
    portfolioLayout: hints.portfolioLayout ?? pick(["grid", "featured", "rows"] as const, h, 10),
    statsLayout: hints.statsLayout ?? pick(["band", "cards", "split"] as const, slugMix, 11),
    testimonialLayout: hints.testimonialLayout ?? pick(["center", "card", "split"] as const, slugMix, 12),
  };
}

export function getLayoutVariantLabel(template: TemplateDef): string {
  return getTemplatePageConfig(template).label;
}

export function getLayoutVariant(template: TemplateDef): number {
  return hash(template.slug);
}

// Keep premium theme compat for source gen
export type PremiumThemeId = string;
export function getPremiumThemeId(template: TemplateDef): string {
  return `page-${hash(template.slug) % 1000}`;
}
export function getThemeLabel(id: string): string {
  return id;
}

export function getTemplateDesign(template: TemplateDef) {
  const c = getTemplatePageConfig(template);
  return { layoutId: hash(template.slug), layoutName: c.label, themeId: getPremiumThemeId(template) };
}

export function getDesignPalette(d: { layoutId: number }) {
  return PALETTES[d.layoutId % PALETTES.length];
}
export function getFontFamily(_f: string) { return "system-ui, sans-serif"; }
export function getRadiusClass(r: string) {
  return r === "none" ? "rounded-none" : r === "lg" ? "rounded-xl" : "rounded-md";
}
