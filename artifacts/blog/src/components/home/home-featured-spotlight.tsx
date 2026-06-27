import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { format } from "date-fns";
import { SafeImage } from "@/components/safe-image";
import { IMAGE_WIDTHS } from "@/lib/image-url";
import { ArrowUpRight } from "lucide-react";

function SidePost({ post, index }: { post: Post; index: number }) {
  return (
    <article className="group relative flex gap-3 border-2 border-foreground bg-card p-4 brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow transition-all">
      {post.featuredImage ? (
        <div className="relative h-16 w-24 shrink-0 overflow-hidden border-2 border-foreground bg-muted sm:h-[4.5rem] sm:w-28">
          <SafeImage
            src={post.featuredImage}
            alt=""
            width={IMAGE_WIDTHS.thumb}
            sizes="112px"
            className="h-full w-full object-cover"
            wrapperClassName="h-full w-full"
          />
        </div>
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-foreground bg-muted text-xs font-black">
          {String(index).padStart(2, "0")}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-1">
          {post.categoryName ?? "Article"}
        </p>
        <h3 className="font-black text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/post/${post.slug}`}>
            <span className="absolute inset-0" aria-hidden />
            {post.title}
          </Link>
        </h3>
        <time className="text-[11px] text-muted-foreground mt-1 block" dateTime={post.createdAt}>
          {format(new Date(post.createdAt), "MMM d, yyyy")}
        </time>
      </div>
      <ArrowUpRight className="relative z-10 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </article>
  );
}

export function HomeFeaturedSpotlight({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="border-2 border-dashed border-foreground bg-muted/50 p-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">Featured articles will appear here.</p>
      </div>
    );
  }

  const [lead, ...rest] = posts;
  const sidePosts = rest.slice(0, 2);

  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-0 lg:border-2 lg:border-foreground lg:brutal-shadow">
      {/* Lead story */}
      <article className="group relative lg:col-span-7 flex flex-col md:flex-row overflow-hidden border-2 lg:border-0 lg:border-r-2 border-foreground bg-card brutal-shadow-sm lg:brutal-shadow-none">
        {lead.featuredImage && (
          <div className="relative w-full md:w-52 lg:w-60 shrink-0 aspect-[16/10] max-h-[160px] md:aspect-[4/3] md:max-h-[180px] overflow-hidden bg-muted border-b-2 md:border-b-0 md:border-r-2 border-foreground">
            <SafeImage
              src={lead.featuredImage}
              alt=""
              width={IMAGE_WIDTHS.thumb}
              sizes="(max-width: 768px) 100vw, 240px"
              priority
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              wrapperClassName="h-full w-full"
            />
          </div>
        )}
        <div className="p-5 md:p-6 flex flex-col gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="border-2 border-foreground bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-primary-foreground">
              Featured
            </span>
            {lead.categoryName && (
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {lead.categoryName}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black leading-tight tracking-tight group-hover:text-primary transition-colors">
            <Link href={`/post/${lead.slug}`}>
              <span className="absolute inset-0" aria-hidden />
              {lead.title}
            </Link>
          </h2>
          {lead.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl">
              {lead.excerpt}
            </p>
          )}
          <div className="flex items-center justify-between pt-2 mt-auto">
            <time className="text-xs font-bold text-muted-foreground" dateTime={lead.createdAt}>
              {format(new Date(lead.createdAt), "MMMM d, yyyy")}
              {lead.readingTime ? ` · ${lead.readingTime} min read` : ""}
            </time>
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary">
              Read now <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>

      {/* Side stack */}
      <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-0">
        {sidePosts.map((post, i) => (
          <div key={post.id} className={i < sidePosts.length - 1 ? "lg:border-b-2 lg:border-foreground" : ""}>
            <SidePost post={post} index={i + 2} />
          </div>
        ))}
        {sidePosts.length === 0 && (
          <div className="flex flex-1 items-center justify-center border-2 lg:border-0 lg:border-t-0 border-foreground bg-muted p-8">
            <p className="text-sm text-muted-foreground">More featured posts coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
