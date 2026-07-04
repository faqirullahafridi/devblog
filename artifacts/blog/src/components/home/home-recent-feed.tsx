import type { Post } from "@workspace/api-client-react";
import { PostCard } from "@/components/post-card";

export function HomeRecentFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center rounded-xl border border-dashed border-border bg-muted/20">
        No articles published yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.slice(0, 6).map((post) => (
        <PostCard key={post.id} post={post} variant="card" />
      ))}
    </div>
  );
}
