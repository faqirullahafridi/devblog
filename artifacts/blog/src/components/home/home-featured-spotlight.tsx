import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { format } from "date-fns";
import { SafeImage } from "@/components/safe-image";
import { IMAGE_WIDTHS } from "@/lib/image-url";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

export function HomeFeaturedSpotlight({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
        <p className="text-sm text-muted-foreground">Featured articles will appear here.</p>
      </div>
    );
  }

  const [lead, ...rest] = posts;
  const more = rest.slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Lead story — always vertical card */}
      <article className="group relative overflow-hidden rounded-xl border border-border bg-card">
        {lead.featuredImage && (
          <div className="relative aspect-[2/1] sm:aspect-[21/9] w-full overflow-hidden bg-muted">
            <SafeImage
              src={lead.featuredImage}
              alt=""
              width={IMAGE_WIDTHS.hero}
              sizes="(max-width: 768px) 100vw, 900px"
              priority
              className="h-full w-full object-cover"
              wrapperClassName="h-full w-full"
            />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge>Featured</Badge>
            {lead.categoryName && (
              <span className="text-xs font-medium text-muted-foreground">{lead.categoryName}</span>
            )}
            <time className="text-xs text-muted-foreground ml-auto" dateTime={lead.createdAt}>
              {format(new Date(lead.createdAt), "MMM d, yyyy")}
            </time>
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold leading-snug tracking-tight group-hover:text-primary text-balance">
            <Link href={`/post/${lead.slug}`}>
              <span className="absolute inset-0" aria-hidden />
              {lead.title}
            </Link>
          </h3>
          {lead.excerpt && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
              {lead.excerpt}
            </p>
          )}
          <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read article
            <ArrowUpRight className="h-4 w-4" />
          </p>
        </div>
      </article>

      {/* Secondary featured */}
      {more.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {more.map((post) => (
            <PostCard key={post.id} post={post} variant="card" />
          ))}
        </div>
      )}
    </div>
  );
}
