import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";

export function HomeRecentFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground py-8">No articles published yet.</p>;
  }

  return (
    <ol className="divide-y-2 divide-foreground border-2 border-foreground bg-card brutal-shadow-sm">
      {posts.map((post, i) => (
        <li key={post.id}>
          <article className="group relative flex gap-4 md:gap-6 p-4 md:p-5 hover:bg-muted/60 transition-colors">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-foreground bg-background text-sm font-black">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                {post.categoryName && (
                  <Link
                    href={`/category/${post.categorySlug}`}
                    className="text-primary hover:underline relative z-10"
                  >
                    {post.categoryName}
                  </Link>
                )}
                {post.categoryName && <span aria-hidden>·</span>}
                <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMM d")}</time>
                {post.readingTime && (
                  <>
                    <span aria-hidden>·</span>
                    <span>{post.readingTime} min</span>
                  </>
                )}
              </div>
              <h3 className="font-black text-base md:text-lg leading-snug group-hover:text-primary transition-colors">
                <Link href={`/post/${post.slug}`}>
                  <span className="absolute inset-0" aria-hidden />
                  {post.title}
                </Link>
              </h3>
              {post.excerpt && (
                <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 hidden sm:block">{post.excerpt}</p>
              )}
            </div>
            <ArrowUpRight className="relative z-10 mt-1 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
          </article>
        </li>
      ))}
    </ol>
  );
}
