import { PublicLayout } from "@/components/layout/public-layout";
import { PageHeader } from "@/components/layout/page-header";
import { HubShell } from "@/components/hub/hub-shell";
import { PostCard } from "@/components/post-card";
import { useListPosts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Pagination } from "@/components/pagination";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";

const PAGE_SIZE = 10;

export default function Search() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
      if (query) {
        window.history.replaceState(null, "", `?q=${encodeURIComponent(query)}`);
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: postsData, isLoading } = useListPosts(
    { search: debouncedQuery, status: "published", limit: PAGE_SIZE, page },
    { query: { enabled: true } },
  );

  const totalPages = Math.ceil((postsData?.total ?? 0) / PAGE_SIZE);

  return (
    <PublicLayout>
      <SeoHead title={seoTitle("Search")} description="Search articles on TechVentry." />
      <HubShell>
        <PageHeader
          title="Search articles"
          description="Find tutorials, guides, and developer notes across TechVentry."
          section="Articles"
          align="center"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
        />

        <div className="mb-8">
          <Input
            type="search"
            placeholder="Search articles..."
            className="h-12 text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : debouncedQuery && postsData?.posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border bg-muted/20">
            <p className="text-muted-foreground">No results for &quot;{debouncedQuery}&quot;</p>
          </div>
        ) : !debouncedQuery && postsData?.posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border bg-muted/20">
            <p className="text-muted-foreground">Start typing to search articles</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {postsData?.posts.map((post) => (
                <PostCard key={post.id} post={post} variant="card" />
              ))}
            </div>
            {debouncedQuery && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </>
        )}

        <HubSeoIntro className="mt-12" />
      </HubShell>
    </PublicLayout>
  );
}
