import { Link } from "wouter";
import { PreloadLink } from "@/components/preload-link";
import { PostTagsInline } from "@/components/post-tags";
import type { Post } from "@workspace/api-client-react";
import { format } from "date-fns";
import { SafeImage } from "@/components/safe-image";
import { cn } from "@/lib/utils";
import { IMAGE_WIDTHS } from "@/lib/image-url";

type PostCardProps = {
  post: Post;
  variant?: "card" | "list";
  showTags?: boolean;
  className?: string;
  priority?: boolean;
};

export function PostCard({
  post,
  variant = "card",
  showTags = false,
  className,
  priority = false,
}: PostCardProps) {
  const meta = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
      {post.categorySlug && (
        <Link
          href={`/category/${post.categorySlug}`}
          className="font-medium text-primary hover:underline relative z-10"
        >
          {post.categoryName}
        </Link>
      )}
      {post.categorySlug && <span aria-hidden>·</span>}
      <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMM d, yyyy")}</time>
      {post.readingTime && (
        <>
          <span aria-hidden>·</span>
          <span>{post.readingTime} min</span>
        </>
      )}
    </div>
  );

  if (variant === "list") {
    return (
      <article
        className={cn(
          "group relative flex gap-4 rounded-lg border border-border bg-card p-3",
          className,
        )}
      >
        {post.featuredImage && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-32">
            <SafeImage
              src={post.featuredImage}
              alt=""
              width={IMAGE_WIDTHS.thumb}
              sizes="128px"
              className="h-full w-full object-cover"
              wrapperClassName="h-full w-full"
            />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-0.5">
          {meta}
          <h3 className="text-sm font-semibold leading-snug tracking-tight sm:text-base">
            <PreloadLink href={`/post/${post.slug}`} className="hover:text-primary">
              <span className="absolute inset-0" aria-hidden />
              <span className="line-clamp-2">{post.title}</span>
            </PreloadLink>
          </h3>
          {post.excerpt && (
            <p className="hidden text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:block">
              {post.excerpt}
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      {post.featuredImage && (
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <SafeImage
            src={post.featuredImage}
            alt=""
            width={IMAGE_WIDTHS.card}
            sizes="(max-width: 640px) 100vw, 50vw"
            priority={priority}
            className="h-full w-full object-cover"
            wrapperClassName="h-full w-full"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {meta}
        <h3 className="text-sm font-semibold leading-snug tracking-tight sm:text-[0.95rem]">
          <PreloadLink href={`/post/${post.slug}`} className="hover:text-primary">
            <span className="absolute inset-0" aria-hidden />
            <span className="line-clamp-2">{post.title}</span>
          </PreloadLink>
        </h3>
        {post.excerpt && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
        )}
        {showTags && <PostTagsInline post={post as Post & { tags?: string[] }} />}
      </div>
    </article>
  );
}
