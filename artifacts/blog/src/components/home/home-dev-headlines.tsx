import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDevHeadlines, type DevHeadline } from "@/lib/api-extra";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { cn } from "@/lib/utils";

function HeadlineItem({ item }: { item: DevHeadline }) {
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors"
      >
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-primary shrink-0 w-10 pt-0.5">
          {item.source === "hackernews" ? "HN" : "Dev"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </p>
          {(item.score != null || item.comments != null) && (
            <p className="text-xs text-muted-foreground mt-1">
              {item.score != null ? `${item.score} pts` : ""}
              {item.comments != null ? ` · ${item.comments} comments` : ""}
            </p>
          )}
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 opacity-60" />
      </a>
    </li>
  );
}

export function HomeDevHeadlines({ embedded = false }: { embedded?: boolean }) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["feeds", "dev-headlines"],
    queryFn: () => getDevHeadlines(6),
    staleTime: 10 * 60_000,
    retry: 2,
  });

  const items = data?.items ?? [];

  return (
    <section className={cn(!embedded && "border-t border-border bg-muted/20")}>
      <div className={cn(!embedded && "container mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-16")}>
        <HomeSectionHeader label="From the web" title="Dev headlines" />

        {isLoading ? (
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            <p>Could not load headlines.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No headlines right now.</p>
        ) : (
          <ul className="rounded-xl border border-border bg-card divide-y divide-border shadow-sm overflow-hidden">
            {items.map((item) => (
              <HeadlineItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
