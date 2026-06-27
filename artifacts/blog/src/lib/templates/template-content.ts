import type { TemplateDef } from "../templates-config";

export type TemplateSeoContent = {
  introduction: string;
  features: string[];
  useCases: string[];
  benefits: string[];
  customizationGuide: string;
  faq: Array<{ question: string; answer: string }>;
};

export function getTemplateSeoContent(template: TemplateDef): TemplateSeoContent {
  const stackLine = template.stack.join(", ");
  const categoryLabel = template.categoryTitle.toLowerCase();

  return {
    introduction: `${template.title} is a free, production-ready ${categoryLabel} you can download and deploy today. Built with ${stackLine}, it targets developers, founders, and freelancers who need a polished layout without hiring an agency. The package includes responsive pages, semantic HTML structure, and commented source code so you can rebrand colors, swap copy, and ship a live site in hours—not weeks. Whether you found this through a search for "${template.tags[0] ?? "website template"}" or you're browsing our marketplace, this template is optimized for performance, accessibility basics, and search-friendly markup.`,
    features: [
      ...template.features,
      `Built with ${stackLine} — modern stack developers already know`,
      "Mobile-first responsive layout tested on common breakpoints",
      "Clean folder structure with assets, components, and documentation",
      "SEO-ready headings, meta tags, and Open Graph placeholders",
      "Free for personal and commercial projects (MIT-style license)",
    ].slice(0, 8),
    useCases: [
      `Launch a ${categoryLabel} MVP before writing custom UI from scratch`,
      "Replace an outdated site while keeping the same content structure",
      "Prototype client pitches with a realistic, clickable demo layout",
      "Learn modern front-end patterns by studying production-quality markup",
      "Bootstrap a side project landing page with proven conversion sections",
    ],
    benefits: [
      "Save 20–40 hours of layout and responsive debugging work",
      "Start from accessible color contrast and readable typography defaults",
      "Reuse section patterns (hero, pricing, FAQ, footer) across pages",
      "Download once, host anywhere — Netlify, Vercel, GitHub Pages, or your VPS",
      "Internal links to related templates help you compare stacks quickly",
    ],
    customizationGuide: `After download, open the project in VS Code or Cursor. Update \`index.html\` (or the main React entry) with your brand name, logo, and hero copy. Colors live in CSS variables or Tailwind config — change primary and accent tokens first for an instant rebrand. Replace placeholder images in \`/assets\` or \`/public\`. For React templates, edit component props and route titles. Run locally with your stack's dev command (\`npm run dev\` or Live Server for static HTML), then deploy. Keep heading hierarchy (one h1 per page) when rewriting text to preserve SEO value.`,
    faq: template.faq,
  };
}
