export const SITE_NAME = process.env.SITE_NAME?.trim() || "TechVentry";
export const SITE_DOMAIN = process.env.SITE_DOMAIN?.trim() || "techventry.com";
/** Canonical production origin (www). */
export const SITE_ORIGIN = process.env.SITE_URL?.replace(/\/$/, "") || "https://www.techventry.com";
export const SITE_EMAIL =
  process.env.SITE_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || "info@techventry.com";

export function defaultFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || `${SITE_NAME} <${SITE_EMAIL}>`;
}
