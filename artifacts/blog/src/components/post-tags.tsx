import { Link } from "wouter";
import { tagHref } from "@/lib/tag-utils";
import type { Post } from "@workspace/api-client-react";

export function PostTags({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
      {tags.map((tag) => (
        <Link
          key={tag}
          href={tagHref(tag)}
          className="text-xs px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted hover:text-primary transition-colors"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

export function PostTagsInline({ post }: { post: Post & { tags?: string[] } }) {
  return <PostTags tags={post.tags} />;
}
