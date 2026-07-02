import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDevHeadlines, type DevHeadline } from "@/lib/api-extra";

function HeadlineItem({ item }: { item: DevHeadline }) {
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3 py-3 hover:bg-muted/50 px-4 transition-colors"
      >
        <span className="text-[10px] font-black uppercase tracking-wider text-primary shrink-0 mt-1 w-14">
          {item.source === "hackernews" ? "HN" : "Dev.to"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
            {item.score != null ? `${item.score} pts` : ""}
            {item.comments != null ? ` · ${item.comments} comments` : ""}
            {item.author ? ` · ${item.author}` : ""}
          </p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </li>
  );
}

export function HomeDevHeadlines() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["feeds", "dev-headlines"],
    queryFn: () => getDevHeadlines(8),
    staleTime: 10 * 60_000,
    retry: 2,
  });

  const items = data?.items ?? [];

  return (
    <section className="border-y-2 border-foreground bg-card">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">From the web</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Dev headlines</h2>
        </div>

        {isLoading ? (
          <div className="border-2 border-foreground divide-y-2 divide-foreground">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="border-2 border-foreground bg-muted/40 p-6 brutal-shadow-sm text-sm text-muted-foreground">
            <p>Could not load headlines.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-foreground"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="border-2 border-foreground bg-muted/40 p-6 brutal-shadow-sm text-sm text-muted-foreground">
            <p>No headlines right now.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-foreground"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        ) : (
          <ul className="border-2 border-foreground divide-y-2 divide-foreground brutal-shadow-sm">
            {items.map((item) => (
              <HeadlineItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
