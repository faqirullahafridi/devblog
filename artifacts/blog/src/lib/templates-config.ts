import { CATEGORY_TEMPLATE_SPECS } from "./templates/catalog-data";
import { previewImageForSlug } from "./templates/preview-images";
import { getDemoHref } from "./templates/demo-theme";

export type TemplateCategory = {
  id: string;
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type TemplateDef = {
  slug: string;
  title: string;
  shortDescription: string;
  categoryId: string;
  categorySlug: string;
  categoryTitle: string;
  stack: string[];
  tags: string[];
  previewImage: string;
  demoUrl: string;
  downloadUrl: string;
  features: string[];
  faq: Array<{ question: string; answer: string }>;
  seoTitle: string;
  seoDescription: string;
  trending: boolean;
  popular: boolean;
  isNew: boolean;
  featured: boolean;
  publishedAt: string;
  downloads: number;
  relatedBlogSlugs: string[];
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "portfolio",
    slug: "portfolio-templates",
    title: "Portfolio Templates",
    description: "Developer, designer, and creative portfolio layouts with project showcases.",
    seoTitle: "Free Portfolio Website Templates — Download Source Code",
    seoDescription: "Premium free portfolio templates for developers and designers. HTML, React, and Tailwind downloads.",
  },
  {
    id: "landing-pages",
    slug: "landing-pages",
    title: "Landing Pages",
    description: "High-converting single-page layouts for products, apps, and campaigns.",
    seoTitle: "Free HTML Landing Page Templates — Modern Designs",
    seoDescription: "Download free HTML landing page templates with hero sections, CTAs, and responsive layouts.",
  },
  {
    id: "saas-landing-pages",
    slug: "saas-landing-pages",
    title: "SaaS Landing Pages",
    description: "Pricing tables, trial CTAs, and product marketing for subscription software.",
    seoTitle: "Free SaaS Landing Page Templates — React & HTML",
    seoDescription: "Free SaaS landing page templates with pricing, features, and signup flows.",
  },
  {
    id: "ai-landing-pages",
    slug: "ai-landing-pages",
    title: "AI Landing Pages",
    description: "Modern layouts for AI tools, chatbots, and machine-learning products.",
    seoTitle: "Free AI Landing Page Templates — Download Source Code",
    seoDescription: "AI landing page templates for SaaS, chatbots, and ML startups.",
  },
  {
    id: "agency-websites",
    slug: "agency-websites",
    title: "Agency Websites",
    description: "Digital, creative, and marketing agency sites with case studies.",
    seoTitle: "Free Agency Website Templates — Creative & Digital",
    seoDescription: "Download free agency website templates for creative and marketing firms.",
  },
  {
    id: "business-websites",
    slug: "business-websites",
    title: "Business Websites",
    description: "Corporate, consulting, and professional service websites.",
    seoTitle: "Free Business Website Templates — Corporate HTML",
    seoDescription: "Professional business website templates with services and contact pages.",
  },
  {
    id: "startup-pages",
    slug: "startup-pages",
    title: "Startup Pages",
    description: "MVPs, pitch sites, and waitlist pages for early-stage founders.",
    seoTitle: "Free Startup Website Templates — MVP Landing Pages",
    seoDescription: "Startup landing page templates for founders. Free HTML and React downloads.",
  },
  {
    id: "resume-websites",
    slug: "resume-websites",
    title: "Resume Websites",
    description: "CV sites, one-page resumes, and personal brand pages.",
    seoTitle: "Free Resume Website Templates — CV & Portfolio",
    seoDescription: "Download free resume website templates and one-page CV HTML source code.",
  },
  {
    id: "product-launch",
    slug: "product-launch-pages",
    title: "Product Launch Pages",
    description: "Launch countdowns, waitlists, and product reveal landing pages.",
    seoTitle: "Free Product Launch Page Templates — Coming Soon & Launch",
    seoDescription: "Product launch landing page templates with waitlists and email capture.",
  },
];

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  portfolio: "portfolio",
  saas: "saas-landing-pages",
  ai: "ai-landing-pages",
  agency: "agency-websites",
  business: "business-websites",
  startup: "startup-pages",
  resume: "resume-websites",
  dashboard: "landing-pages",
  travel: "landing-pages",
  healthcare: "business-websites",
  restaurant: "landing-pages",
  "real-estate": "business-websites",
};

const CATEGORY_BY_ID = Object.fromEntries(TEMPLATE_CATEGORIES.map((c) => [c.id, c]));

const RELATED_BLOG: Record<string, string[]> = {
  portfolio: ["hiring-managers-developer-resume-feedback", "flexbox-gap-card-grid-debugging"],
  "landing-pages": ["technical-seo-docs-site-wins", "static-site-contact-forms-serverless"],
  "saas-landing-pages": ["technical-seo-docs-site-wins", "internal-api-filter-design-tradeoffs"],
  "ai-landing-pages": ["react-useeffect-to-event-handler-refactor", "technical-seo-docs-site-wins"],
  "agency-websites": ["freelance-fixed-scope-pricing", "flexbox-gap-card-grid-debugging"],
  "business-websites": ["code-review-comments-team-shipping", "technical-seo-docs-site-wins"],
  "startup-pages": ["junior-to-mid-promotion-conversation", "freelance-fixed-scope-pricing"],
  "resume-websites": ["hiring-managers-developer-resume-feedback", "technical-interview-prep-without-cramming"],
  "product-launch": ["static-site-contact-forms-serverless", "technical-seo-docs-site-wins"],
};

function defaultFeatures(title: string, stack: string[]): string[] {
  return [
    `Fully responsive ${title.toLowerCase()} layout`,
    "Hero section with primary CTA and social proof block",
    "Feature or services grid with icons and short descriptions",
    "Contact or signup form section with validation-ready markup",
    "Footer with navigation links and legal placeholders",
    `Source built with ${stack.slice(0, 3).join(", ")}`,
  ];
}

function defaultFaq(title: string, stack: string[]): TemplateDef["faq"] {
  return [
    {
      question: `Is this ${title} free to download?`,
      answer:
        "Yes. You can download the full source code for free and use it for personal or commercial projects.",
    },
    {
      question: "Do I need a framework to use this template?",
      answer: `This template uses ${stack.join(", ")}. Static HTML runs in any browser; React templates require Node.js.`,
    },
    {
      question: "Can I customize colors and fonts?",
      answer: "Colors use CSS variables or Tailwind tokens. Swap fonts via Google Fonts or your design system.",
    },
    {
      question: "Where can I host the site after download?",
      answer: "Deploy to Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static host.",
    },
  ];
}

function mergeLegacySpecs(): Array<{
  categoryId: string;
  spec: (typeof CATEGORY_TEMPLATE_SPECS)[string][number];
  index: number;
}> {
  const merged: Array<{
    categoryId: string;
    spec: (typeof CATEGORY_TEMPLATE_SPECS)[string][number];
    index: number;
  }> = [];
  const counters: Record<string, number> = {};
  const seenSlugs = new Set<string>();

  for (const [legacyId, specs] of Object.entries(CATEGORY_TEMPLATE_SPECS)) {
    const categoryId = LEGACY_CATEGORY_MAP[legacyId] ?? "landing-pages";
    for (const spec of specs) {
      if (seenSlugs.has(spec.slug)) continue;
      seenSlugs.add(spec.slug);
      const index = counters[categoryId] ?? 0;
      merged.push({ categoryId, spec, index });
      counters[categoryId] = index + 1;
    }
  }

  const launchSources = [
    ...(CATEGORY_TEMPLATE_SPECS.startup ?? []).slice(0, 5),
    ...(CATEGORY_TEMPLATE_SPECS.saas ?? []).slice(0, 4),
  ];
  launchSources.forEach((spec, i) => {
    const slug = spec.slug.endsWith("-launch-page") ? spec.slug : `${spec.slug}-launch-page`;
    if (seenSlugs.has(slug)) return;
    seenSlugs.add(slug);
    merged.push({
      categoryId: "product-launch",
      spec: {
        ...spec,
        slug,
        title: spec.title.includes("Launch") ? spec.title : `${spec.title} — Launch Edition`,
        trending: i < 2 ? true : spec.trending,
      },
      index: i,
    });
  });

  return merged;
}

function buildTemplate(
  categoryId: string,
  spec: (typeof CATEGORY_TEMPLATE_SPECS)[string][number],
  index: number,
): TemplateDef {
  const cat = CATEGORY_BY_ID[categoryId];
  const daysAgo = (categoryId.charCodeAt(0) + index * 7) % 90;
  const published = new Date();
  published.setDate(published.getDate() - daysAgo);

  return {
    slug: spec.slug,
    title: spec.title,
    shortDescription: spec.description,
    categoryId,
    categorySlug: cat.slug,
    categoryTitle: cat.title,
    stack: spec.stack,
    tags: spec.tags,
    previewImage: previewImageForSlug(spec.slug),
    demoUrl: getDemoHref(spec.slug),
    downloadUrl: getDemoHref(spec.slug),
    features: defaultFeatures(spec.title, spec.stack),
    faq: defaultFaq(spec.title, spec.stack),
    seoTitle: `${spec.title} — Free Download | Website Template`,
    seoDescription: spec.description.slice(0, 155),
    trending: spec.trending ?? false,
    popular: spec.popular ?? false,
    isNew: spec.isNew ?? false,
    featured: spec.trending ?? false,
    publishedAt: published.toISOString().split("T")[0],
    downloads: 800 + ((spec.slug.length * 137 + index * 53) % 4200),
    relatedBlogSlugs: RELATED_BLOG[categoryId] ?? [],
  };
}

export const TEMPLATES: TemplateDef[] = mergeLegacySpecs().map(({ categoryId, spec, index }) =>
  buildTemplate(categoryId, spec, index),
);

export const TEMPLATE_SLUGS = TEMPLATES.map((t) => t.slug);

export function getTemplateHref(slug: string) {
  return `/templates/${slug}`;
}

export function getTemplateCategoryHref(categorySlug: string) {
  return `/templates/category/${categorySlug}`;
}

export function getTemplateBySlug(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return TEMPLATE_CATEGORIES.find((c) => c.slug === slug);
}

export function getTemplatesByCategory(categorySlug: string) {
  return TEMPLATES.filter((t) => t.categorySlug === categorySlug);
}

export function getFeaturedTemplates(limit = 8) {
  return TEMPLATES.filter((t) => t.featured || t.trending).slice(0, limit);
}

export function getTrendingTemplates(limit = 12) {
  return TEMPLATES.filter((t) => t.trending).slice(0, limit);
}

export function getNewTemplates(limit = 12) {
  return [...TEMPLATES]
    .filter((t) => t.isNew)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function getPopularTemplates(limit = 12) {
  return [...TEMPLATES]
    .filter((t) => t.popular)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

export function searchTemplates(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return TEMPLATES;
  return TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q)) ||
      t.stack.some((s) => s.toLowerCase().includes(q)) ||
      t.categoryTitle.toLowerCase().includes(q),
  );
}

export function getRelatedTemplates(template: TemplateDef, limit = 4) {
  const scored = TEMPLATES.filter((t) => t.slug !== template.slug).map((t) => {
    let score = 0;
    if (t.categoryId === template.categoryId) score += 3;
    score += t.tags.filter((tag) => template.tags.includes(tag)).length;
    if (t.stack[0] === template.stack[0]) score += 1;
    return { t, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}

export const TEMPLATE_ROUTES = [
  "/templates",
  "/templates/trending",
  "/templates/new",
  "/templates/popular",
  "/templates/search",
  ...TEMPLATE_CATEGORIES.map((c) => `/templates/category/${c.slug}`),
  ...TEMPLATES.map((t) => `/templates/${t.slug}`),
  ...TEMPLATES.map((t) => `/templates/demo/${t.slug}`),
];
