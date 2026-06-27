import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";
import type { Post } from "@workspace/api-client-react";
import { searchPosts } from "@/lib/api-extra";

export function ToolRelatedArticles({ searchTerms }: { searchTerms: string[] }) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seen = new Set<number>();
      const found: Post[] = [];
      for (const term of searchTerms) {
        const results = (await searchPosts(term, 4)) as Post[];
        for (const p of results) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            found.push(p);
          }
        }
        if (found.length >= 3) break;
      }
      if (!cancelled) setPosts(found.slice(0, 3));
    })();
    return () => {
      cancelled = true;
    };
  }, [searchTerms]);

  if (posts.length === 0) return null;

  return (
    <aside className="mt-12 pt-8 border-t">
      <p className="text-sm font-medium mb-4">Related articles</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </aside>
  );
}
