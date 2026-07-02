import hubSeoContent from "@/lib/hub-seo-content.json";

export type HubSeoPage = {
  path: string;
  title: string;
  description: string;
  h1: string;
  h2: string;
  paragraphs: string[];
};

const pagesByPath = new Map<string, HubSeoPage>(
  hubSeoContent.pages.map((page) => [page.path, page as HubSeoPage]),
);

export function getHubSeoPage(path: string): HubSeoPage | undefined {
  const normalized = path.replace(/\/$/, "") || "/";
  return pagesByPath.get(normalized);
}

export function getHubSeoParagraphs(path: string): string[] {
  const page = getHubSeoPage(path);
  if (!page) return [];
  return [...page.paragraphs, ...hubSeoContent.sharedParagraphs];
}

export { hubSeoContent };
