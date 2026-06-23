import { PublicLayout } from "@/components/layout/public-layout";
import { PostCard } from "@/components/post-card";
import { useListPosts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        window.history.replaceState(null, "", `?q=${encodeURIComponent(query)}`);
      } else {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: postsData, isLoading } = useListPosts(
    { search: debouncedQuery, status: "published", limit: 20 },
    { query: { enabled: true } }
  );

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-6">Search</h1>
          <Input
            type="search"
            placeholder="Search articles..."
            className="text-lg py-6 px-4 bg-muted/50 border-2 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-primary"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : debouncedQuery && postsData?.posts.length === 0 ? (
            <div className="text-center py-20 border rounded-xl bg-muted/20">
              <p className="text-lg text-muted-foreground">No results found for "{debouncedQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search terms.</p>
            </div>
          ) : !debouncedQuery && postsData?.posts.length === 0 ? (
             <div className="text-center py-20 border rounded-xl bg-muted/20">
             <p className="text-lg text-muted-foreground">Start typing to search articles</p>
           </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2">
              {postsData?.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
