import { useLocation } from "wouter";
import hubSeoContent from "@/lib/hub-seo-content.json";
import { getHubSeoPage } from "@/lib/hub-seo-content";

type HubSeoIntroProps = {
  path?: string;
  className?: string;
};

/** Visible intro copy for hub pages (200+ words for crawlers and readers). */
export function HubSeoIntro({ path, className }: HubSeoIntroProps) {
  const [location] = useLocation();
  const normalized = path ?? (location.split("?")[0].replace(/\/$/, "") || "/");
  const page = getHubSeoPage(normalized);
  if (!page) return null;

  const paragraphs = [...page.paragraphs, ...hubSeoContent.sharedParagraphs];

  return (
    <section
      className={className ?? "mb-10 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base"}
      aria-label="Page overview"
    >
      <h2 className="text-lg font-semibold text-foreground">{page.h2}</h2>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  );
}
