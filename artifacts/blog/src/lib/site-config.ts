export const SITE_NAME = "TechVentry";
export const SITE_DOMAIN = "techventry.com";
export const SITE_EMAIL = "info@techventry.com";
export const SITE_TAGLINE = "Developer knowledge hub for builders who ship.";
export const SITE_DESCRIPTION =
  "Articles, tutorials, and free developer tools on TechVentry — for builders who care about code quality and craft.";

export function seoTitle(page?: string): string {
  if (!page) return `${SITE_NAME} — Developer knowledge hub`;
  return `${page} — ${SITE_NAME}`;
}
