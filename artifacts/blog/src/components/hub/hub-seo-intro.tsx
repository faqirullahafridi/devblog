import { useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import {
  buildHubSeoSections,
  getHubSeoPage,
  getHubSeoSharedSection,
} from "@/lib/hub-seo-content";
import { cn } from "@/lib/utils";

type HubSeoIntroProps = {
  path?: string;
  className?: string;
};

/**
 * Visible SEO copy for hub pages — grouped into cards + collapsible site-wide notes.
 * All text stays in the DOM for crawlers; layout keeps main UI above this block.
 */
export function HubSeoIntro({ path, className }: HubSeoIntroProps) {
  const [location] = useLocation();
  const normalized = path ?? (location.split("?")[0].replace(/\/$/, "") || "/");
  const page = getHubSeoPage(normalized);
  if (!page) return null;

  const sections = buildHubSeoSections(page);
  const shared = getHubSeoSharedSection();

  return (
    <section
      className={cn("border-t border-border/60 pt-10 mt-10", className)}
      aria-label="Page overview"
    >
      <div className="mb-6 max-w-2xl">
        <p className="section-label mb-2">Guide</p>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{page.h2}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-xl border border-border/60 bg-muted/25 p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3 leading-snug">{section.title}</h3>
            <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
              {section.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {shared.paragraphs.length > 0 && (
        <details className="mt-6 group rounded-xl border border-border/50 bg-card/40 open:border-primary/20 open:bg-muted/15 transition-colors">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            <span>{shared.title}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-2.5 border-t border-border/40 px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
            {shared.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
