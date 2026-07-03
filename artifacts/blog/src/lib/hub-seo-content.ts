import hubSeoContent from "@/lib/hub-seo-content.json";

export type HubSeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  h2: string;
  paragraphs: string[];
};

export type HubSeoSection = {
  title: string;
  paragraphs: string[];
};

/** Per-page section headings (pairs of paragraphs each — 8 paragraphs → 4 sections). */
const SECTION_TITLES: Record<string, string[]> = {
  "/": ["What TechVentry offers", "Tools and templates", "Built for daily use", "Where to begin"],
  "/about": ["Our mission", "What you'll find here", "How we teach", "If you're new"],
  "/search": ["Search the archive", "What you'll see", "Tips for better results", "Keep this page handy"],
  "/tools": ["Everyday utilities", "Private in your browser", "Guides on each tool", "When to use them"],
  "/templates": ["Template library", "How to use layouts", "Discover & compare", "Stay updated"],
  "/learn": ["Structured paths", "How to study", "Categories & pacing", "Pick your path"],
  "/refs": ["Quick lookups", "When to open a sheet", "Daily workflow", "Grow your library"],
  "/snippets": ["Copy-paste examples", "When snippets help", "Workflow tips", "Combine with tools"],
  "/interview": ["Practice topics", "Study approach", "Behavioral prep", "Interview rhythm"],
  "/ai": ["Focused AI modes", "Use output safely", "Mode deep dives", "Quick access"],
  "/playground": ["Live sandboxes", "Pair with learning", "Sharing & forking", "Open an editor"],
  "/roadmaps": ["Career planning", "Roadmap generator", "Track progress", "Keep plans current"],
  "/challenges": ["Practice tasks", "Leaderboard & prep", "Build good habits", "Start here"],
  "/jobs": ["Open roles", "Applying well", "Filters & bookmarks", "Career moves"],
  "/api-sources": ["API directory", "Evaluate providers", "Categories & env vars", "Team bookmarks"],
  "/community": ["Q&A forum", "Ask good questions", "Reputation & profiles", "Tags & follow-up"],
  "/resources": ["External links", "Onboarding lists", "How we curate", "Suggest additions"],
  "/contact": ["Reach the team", "Bug reports", "Partnerships & privacy", "What happens next"],
};

const DEFAULT_SECTION_TITLES = ["Overview", "In practice", "Workflow tips", "Next steps"];
const SHARED_SECTION_TITLE = "Explore TechVentry";

const pagesByPath = new Map<string, HubSeoPage>(
  hubSeoContent.pages.map((page) => [page.path, page as HubSeoPage]),
);

function chunkParagraphs(paragraphs: string[], titles: string[]): HubSeoSection[] {
  const chunkSize = 2;
  const sections: HubSeoSection[] = [];
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const slice = paragraphs.slice(i, i + chunkSize);
    if (slice.length === 0) continue;
    sections.push({
      title: titles[sections.length] ?? DEFAULT_SECTION_TITLES[sections.length] ?? `Section ${sections.length + 1}`,
      paragraphs: slice,
    });
  }
  return sections;
}

export function getHubSeoPage(path: string): HubSeoPage | undefined {
  const normalized = path.replace(/\/$/, "") || "/";
  return pagesByPath.get(normalized);
}

export function buildHubSeoSections(page: HubSeoPage): HubSeoSection[] {
  const titles = SECTION_TITLES[page.path] ?? DEFAULT_SECTION_TITLES;
  return chunkParagraphs(page.paragraphs, titles);
}

export function getHubSeoSharedSection(): HubSeoSection {
  return {
    title: SHARED_SECTION_TITLE,
    paragraphs: [...hubSeoContent.sharedParagraphs],
  };
}

export function getHubSeoParagraphs(path: string): string[] {
  const page = getHubSeoPage(path);
  if (!page) return [];
  return [...page.paragraphs, ...hubSeoContent.sharedParagraphs];
}

export { hubSeoContent };
