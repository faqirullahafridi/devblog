/** Design movement / UI style assigned to each template demo. */
export const UI_STYLES = [
  { id: "minimalism", label: "Minimalism" },
  { id: "modern-brutalism", label: "Modern Brutalism" },
  { id: "brutalism", label: "Brutalism" },
  { id: "glassmorphism", label: "Glassmorphism" },
  { id: "neumorphism", label: "Neumorphism (Soft UI)" },
  { id: "material-design", label: "Material Design" },
  { id: "flat-design", label: "Flat Design" },
  { id: "skeuomorphism", label: "Skeuomorphism" },
  { id: "bento-ui", label: "Bento UI" },
  { id: "swiss-style", label: "Swiss Style" },
  { id: "editorial-ui", label: "Editorial UI" },
  { id: "dark-mode-ui", label: "Dark Mode UI" },
  { id: "light-mode-ui", label: "Light Mode UI" },
  { id: "monochrome-ui", label: "Monochrome UI" },
  { id: "claymorphism", label: "Claymorphism" },
  { id: "3d-ui", label: "3D UI" },
  { id: "cyberpunk-ui", label: "Cyberpunk UI" },
  { id: "futuristic-ui", label: "Futuristic UI" },
  { id: "ai-saas-ui", label: "AI/SaaS UI" },
  { id: "retro-ui", label: "Retro UI" },
  { id: "y2k-ui", label: "Y2K UI" },
  { id: "memphis-design", label: "Memphis Design" },
  { id: "bauhaus-style", label: "Bauhaus Style" },
  { id: "corporate-ui", label: "Corporate UI" },
  { id: "enterprise-dashboard-ui", label: "Enterprise Dashboard UI" },
  { id: "apple-inspired-ui", label: "Apple-Inspired UI" },
  { id: "fluent-design", label: "Fluent Design" },
  { id: "aurora-ui", label: "Aurora UI" },
  { id: "gradient-ui", label: "Gradient UI" },
  { id: "bold-typography-ui", label: "Bold Typography UI" },
  { id: "card-based-ui", label: "Card-Based UI" },
  { id: "split-screen-ui", label: "Split-Screen UI" },
  { id: "asymmetrical-ui", label: "Asymmetrical UI" },
  { id: "grid-based-ui", label: "Grid-Based UI" },
  { id: "magazine-ui", label: "Magazine UI" },
  { id: "dashboard-ui", label: "Dashboard UI" },
  { id: "mobile-first-ui", label: "Mobile-First UI" },
  { id: "terminal-cli-ui", label: "Terminal/CLI UI" },
  { id: "hacker-ui", label: "Hacker UI" },
  { id: "gaming-ui", label: "Gaming UI" },
  { id: "ecommerce-ui", label: "E-commerce UI" },
  { id: "social-media-ui", label: "Social Media UI" },
  { id: "portfolio-ui", label: "Portfolio UI" },
  { id: "landing-page-ui", label: "Landing Page UI" },
  { id: "one-page-ui", label: "One-Page UI" },
  { id: "scroll-based-ui", label: "Scroll-Based UI" },
  { id: "interactive-storytelling-ui", label: "Interactive Storytelling UI" },
  { id: "isometric-ui", label: "Isometric UI" },
  { id: "illustration-based-ui", label: "Illustration-Based UI" },
  { id: "organic-ui", label: "Organic UI (Blob Shapes)" },
] as const;

export type UiStyleId = (typeof UI_STYLES)[number]["id"];

export function getUiStyleLabel(id: UiStyleId): string {
  return UI_STYLES.find((s) => s.id === id)?.label ?? id;
}

export function getUiStyleId(slug: string): UiStyleId {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (Math.imul(31, h) + slug.charCodeAt(i)) | 0;
  return UI_STYLES[Math.abs(h) % UI_STYLES.length].id;
}

/** Map UI style → layout preferences for richer variety per template. */
export function getUiStyleLayoutHints(id: UiStyleId): {
  hero?: "full" | "split" | "minimal" | "split-reverse";
  navStyle?: "classic" | "centered" | "minimal";
  servicesLayout?: "cards" | "rows" | "bento";
  portfolioLayout?: "grid" | "featured" | "rows";
  statsLayout?: "band" | "cards" | "split";
  testimonialLayout?: "center" | "card" | "split";
  radius?: "none" | "sm" | "lg";
  gridCols?: 2 | 3 | 4;
} {
  const map: Partial<Record<UiStyleId, ReturnType<typeof getUiStyleLayoutHints>>> = {
    "bento-ui": { servicesLayout: "bento", gridCols: 3 },
    "dashboard-ui": { servicesLayout: "bento", statsLayout: "cards", navStyle: "classic" },
    "enterprise-dashboard-ui": { servicesLayout: "bento", statsLayout: "split", navStyle: "classic" },
    "split-screen-ui": { hero: "split" },
    "one-page-ui": { hero: "full", navStyle: "minimal" },
    "landing-page-ui": { hero: "split", servicesLayout: "cards" },
    "portfolio-ui": { hero: "minimal", portfolioLayout: "featured" },
    "magazine-ui": { hero: "split-reverse", portfolioLayout: "rows", testimonialLayout: "split" },
    "editorial-ui": { hero: "minimal", navStyle: "centered", testimonialLayout: "center" },
    "swiss-style": { hero: "minimal", navStyle: "minimal", radius: "none" },
    "minimalism": { hero: "minimal", navStyle: "minimal", radius: "sm" },
    "flat-design": { radius: "sm", servicesLayout: "rows" },
    "card-based-ui": { servicesLayout: "cards", gridCols: 3 },
    "grid-based-ui": { servicesLayout: "cards", gridCols: 4 },
    "asymmetrical-ui": { hero: "split-reverse", portfolioLayout: "rows" },
    "mobile-first-ui": { hero: "minimal", navStyle: "minimal" },
    "terminal-cli-ui": { hero: "minimal", navStyle: "minimal", radius: "none" },
    "hacker-ui": { hero: "minimal", navStyle: "minimal", radius: "none" },
    "cyberpunk-ui": { hero: "full", statsLayout: "band" },
    "gaming-ui": { hero: "full", statsLayout: "band" },
    "ai-saas-ui": { hero: "split", servicesLayout: "bento", statsLayout: "cards" },
    "gradient-ui": { hero: "full", servicesLayout: "cards" },
    "aurora-ui": { hero: "full", servicesLayout: "bento" },
    "apple-inspired-ui": { hero: "split", radius: "lg", navStyle: "classic" },
    "material-design": { radius: "lg", servicesLayout: "cards" },
    "fluent-design": { radius: "lg", navStyle: "classic" },
    "neumorphism": { radius: "lg", servicesLayout: "cards" },
    "claymorphism": { radius: "lg", servicesLayout: "cards" },
    "glassmorphism": { hero: "split", radius: "lg" },
    "brutalism": { radius: "none", navStyle: "classic" },
    "modern-brutalism": { radius: "none", navStyle: "minimal" },
    "bauhaus-style": { radius: "none", hero: "split" },
    "memphis-design": { hero: "split-reverse", portfolioLayout: "grid" },
    "y2k-ui": { hero: "full", statsLayout: "band" },
    "retro-ui": { hero: "split", testimonialLayout: "card" },
    "3d-ui": { hero: "split", servicesLayout: "cards" },
    "isometric-ui": { hero: "split-reverse", portfolioLayout: "featured" },
    "organic-ui": { radius: "lg", hero: "minimal" },
    "skeuomorphism": { hero: "full", radius: "sm" },
    "corporate-ui": { navStyle: "classic", servicesLayout: "rows" },
    "ecommerce-ui": { hero: "split", servicesLayout: "cards", gridCols: 4 },
    "social-media-ui": { hero: "minimal", navStyle: "centered" },
    "illustration-based-ui": { hero: "split-reverse", portfolioLayout: "featured" },
    "interactive-storytelling-ui": { hero: "full", portfolioLayout: "rows" },
    "scroll-based-ui": { hero: "full", navStyle: "minimal" },
    "bold-typography-ui": { hero: "minimal", testimonialLayout: "center" },
    "dark-mode-ui": { hero: "split" },
    "light-mode-ui": { hero: "split", radius: "lg" },
    "monochrome-ui": { hero: "minimal", radius: "none" },
    "futuristic-ui": { hero: "full", statsLayout: "split" },
  };
  return map[id] ?? {};
}
