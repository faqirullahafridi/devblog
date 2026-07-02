import hubSeoContent from "../src/lib/hub-seo-content.json" with { type: "json" };

export const SITE_ORIGIN = "https://www.techventry.com";

/** @typedef {{ path: string, title: string, description: string, h1: string, h2: string, paragraphs: string[] }} SeoPage */

/** @type {SeoPage[]} */
export const HUB_SEO_PAGES = hubSeoContent.pages.map((page) => ({
  ...page,
  paragraphs: [...page.paragraphs, ...hubSeoContent.sharedParagraphs],
}));
