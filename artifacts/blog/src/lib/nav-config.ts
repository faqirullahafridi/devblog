export const PLATFORM_LINKS = [
  { href: "/ai", label: "AI Assistant" },
  { href: "/playground", label: "Playground" },
  { href: "/roadmaps", label: "Roadmaps" },
  { href: "/challenges", label: "Challenges" },
  { href: "/jobs", label: "Jobs" },
  { href: "/api-sources", label: "API Sources" },
  { href: "/community", label: "Community" },
] as const;

/** Top header links — shared by desktop, tablet strip, mobile drawer, and bottom bar. */
export const PRIMARY_NAV = [
  { href: "/search", label: "Articles" },
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
  { href: "/ai", label: "AI" },
  { href: "/jobs", label: "Jobs" },
  { href: "/api-sources", label: "APIs" },
] as const;

export const PRIMARY_NAV_HREFS = new Set(PRIMARY_NAV.map((item) => item.href));

/** Platform links not shown in the primary row (desktop “More” menu). */
export const MORE_PLATFORM_LINKS = PLATFORM_LINKS.filter(
  (item) => !PRIMARY_NAV_HREFS.has(item.href),
);

export const PAGE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/developer", label: "Developer Profile" },
  { href: "/resources", label: "Resources" },
  { href: "/ides", label: "IDEs & Editors" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/contact", label: "Contact" },
  { href: "/search", label: "Search" },
] as const;

export const CONTENT_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/refs", label: "References" },
  { href: "/snippets", label: "Snippets" },
  { href: "/learn", label: "Learning Paths" },
  { href: "/interview", label: "Interview Prep" },
] as const;

export const RESOURCE_LINKS = [
  { href: "/resources", label: "Resources" },
  { href: "/ides", label: "IDEs & Editors" },
] as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/contact", label: "Contact" },
] as const;

export const HUB_LINKS = [
  { href: "/templates", label: "Templates" },
  ...PLATFORM_LINKS,
  { href: "/refs", label: "References" },
  { href: "/snippets", label: "Snippets" },
  { href: "/learn", label: "Learning Paths" },
  { href: "/interview", label: "Interview Prep" },
  ...RESOURCE_LINKS,
] as const;

export const MORE_PAGE_LINKS = [
  { href: "/developer", label: "Developer Profile" },
  { href: "/contact", label: "Contact" },
  { href: "/search", label: "Search" },
] as const;

export const PRIMARY_PAGE_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/developer", label: "Developer Profile" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
] as const;
