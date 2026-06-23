import { Link } from "wouter";
import type { Post } from "@workspace/api-client-react";
import { format } from "date-fns";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col space-y-3">
      {post.featuredImage && (
        <div className="aspect-[2/1] overflow-hidden rounded-lg bg-muted border">
          <img 
            src={post.featuredImage} 
            alt={post.title} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.categorySlug && (
            <Link href={`/category/${post.categorySlug}`} className="font-medium text-primary hover:underline relative z-10">
              {post.categoryName}
            </Link>
          )}
          <span>•</span>
          <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMM d, yyyy")}</time>
          {post.readingTime && (
            <>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </>
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          <Link href={`/post/${post.slug}`} className="hover:text-primary transition-colors">
            <span className="absolute inset-0" />
            {post.title}
          </Link>
        </h3>
        {post.excerpt && (
          <p className="text-muted-foreground line-clamp-2 leading-snug">
            {post.excerpt}
          </p>
        )}
      </div>
    </article>
  );
}
