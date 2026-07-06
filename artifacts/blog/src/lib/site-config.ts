export const SITE_NAME = "TechVentry";
export const SITE_DOMAIN = "techventry.com";
/** Canonical production origin (www). Apex redirects here in Vercel. */
export const SITE_ORIGIN = "https://www.techventry.com";
export const SITE_EMAIL = "info@techventry.com";
export const SITE_TAGLINE = "Developer knowledge hub for builders who ship.";
export const SITE_DESCRIPTION =
  "Articles, tutorials, and free developer tools on TechVentry — for builders who care about code quality and craft.";

/** Default Open Graph / Twitter card image (1200×630). Absolute URL for social crawlers. */
export const SITE_OG_IMAGE = `${SITE_ORIGIN}/og-image.jpg`;
export const SITE_OG_IMAGE_ALT = "TechVentry — AI Developer Hub, Tools & Tutorials";

export function seoTitle(page?: string): string {
  if (!page) return `${SITE_NAME} — Developer Hub, Tools & Tutorials`;
  return `${page} — ${SITE_NAME}`;
}

/** Absolute canonical URL for SEO meta, JSON-LD, and share cards. */
export function siteUrl(path = ""): string {
  if (!path || path === "/") return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
