import { PublicLayout } from "@/components/layout/public-layout";
import { useGetPostBySlug, useIncrementPostView, useListComments, useCreateComment } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getListCommentsQueryKey } from "@workspace/api-client-react";
import { MarkdownContent } from "@/components/markdown-content";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { SITE_NAME, seoTitle as formatPageTitle } from "@/lib/site-config";
import { PostTags } from "@/components/post-tags";
import { ShareButtons } from "@/components/share-buttons";
import { TableOfContents } from "@/components/table-of-contents";
import { ReadingProgress } from "@/components/reading-progress";
import { AdSlot } from "@/components/site-scripts";
import { PostCard } from "@/components/post-card";
import { getRelatedPosts } from "@/lib/api-extra";
import { SafeImage } from "@/components/safe-image";
import { IMAGE_WIDTHS } from "@/lib/image-url";

type RelatedPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  createdAt: string;
};

export default function PostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useGetPostBySlug(slug, {
    query: { enabled: !!slug }
  });

  const { data: comments, isLoading: isLoadingComments } = useListComments(
    { postId: post?.id ?? 0 },
    { query: { enabled: !!post?.id } }
  );

  const incrementView = useIncrementPostView();
  const createComment = useCreateComment();
  const [related, setRelated] = useState<RelatedPost[]>([]);

  useEffect(() => {
    if (post?.id) {
      incrementView.mutate({ id: post.id });
    }
  }, [post?.id]);

  useEffect(() => {
    if (slug) getRelatedPosts(slug).then(setRelated);
  }, [slug]);

  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post?.id || !authorName || !content) return;

    try {
      await createComment.mutateAsync({
        data: {
          postId: post.id,
          authorName,
          authorEmail: authorEmail || undefined,
          content
        }
      });
      toast.success("Comment added!");
      setAuthorName("");
      setAuthorEmail("");
      setContent("");
      if (post?.id) {
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey({ postId: post.id }) });
      }
    } catch {
      toast.error("Failed to add comment");
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl animate-pulse space-y-8">
          <div className="h-10 bg-muted w-3/4 rounded"></div>
          <div className="h-6 bg-muted w-1/4 rounded"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold">Post not found</h1>
        </div>
      </PublicLayout>
    );
  }

  const postUrl = siteUrl(`/post/${post.slug}`);
  const seoTitle = post.seoTitle || post.title;
  const seoDesc = post.metaDescription || post.excerpt || "";

  return (
    <PublicLayout>
      <SeoHead
        title={formatPageTitle(seoTitle)}
        description={seoDesc}
        image={post.featuredImage || undefined}
        url={postUrl}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: seoDesc,
            image: post.featuredImage,
            datePublished: post.createdAt,
            author: { "@type": "Person", name: SITE_NAME },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
              ...(post.categorySlug
                ? [{
                    "@type": "ListItem",
                    position: 2,
                    name: post.categoryName,
                    item: siteUrl(`/category/${post.categorySlug}`),
                  }]
                : []),
              {
                "@type": "ListItem",
                position: post.categorySlug ? 3 : 2,
                name: post.title,
                item: postUrl,
              },
            ],
          },
        ]}
      />
      <ReadingProgress />
      <article className="container mx-auto px-4 py-10 md:py-14 max-w-4xl">
        <header className="space-y-5 mb-10 border-b pb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            {post.categorySlug && (
              <Link href={`/category/${post.categorySlug}`} className="font-semibold text-primary hover:underline">
                {post.categoryName}
              </Link>
            )}
            <span aria-hidden>•</span>
            <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
            {post.readingTime && (
              <>
                <span aria-hidden>•</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
            <span aria-hidden>•</span>
            <span>{post.views} views</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-foreground">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <ShareButtons title={post.title} url={postUrl} />
            <PostTags tags={(post as typeof post & { tags?: string[] }).tags} />
          </div>
        </header>

        {post.featuredImage && (
          <figure className="mb-10 aspect-[2/1] overflow-hidden rounded-2xl bg-muted border shadow-sm">
            <SafeImage
              src={post.featuredImage}
              alt={post.title}
              width={IMAGE_WIDTHS.hero}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover w-full h-full"
              wrapperClassName="w-full h-full"
            />
          </figure>
        )}

        <AdSlot className="mb-8" />
        <TableOfContents content={post.content} />
        <div className="article-body">
          <MarkdownContent content={post.content} />
        </div>

        {related.length > 0 && (
          <section className="mt-16 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Related articles</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <PostCard key={p.id} post={p as import("@workspace/api-client-react").Post} variant="card" />
              ))}
            </div>
          </section>
        )}

        <hr className="my-16" />

        <section id="comments" className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight">Comments</h2>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4 bg-muted/30 p-6 rounded-xl border">
            <h3 className="font-semibold">Add a comment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <Input
                placeholder="Email (optional)"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
            </div>
            <Textarea
              placeholder="Your comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
            />
            <Button type="submit" disabled={createComment.isPending}>
              {createComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>

          <div className="space-y-6">
            {isLoadingComments ? (
              <p className="text-muted-foreground">Loading comments...</p>
            ) : comments?.length === 0 ? (
              <p className="text-muted-foreground">No comments yet. Be the first!</p>
            ) : (
              comments?.map((comment) => (
                <div key={comment.id} className="p-4 bg-card rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{comment.authorName}</span>
                    <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
                      {format(new Date(comment.createdAt), "MMM d, yyyy")}
                    </time>
                  </div>
                  <p className="text-sm text-card-foreground whitespace-pre-wrap">{comment.content}</p>
                  {comment.adminReply && (
                    <div className="mt-3 pl-4 border-l-2 border-primary/30 space-y-1">
                      <span className="text-xs font-semibold text-primary">Admin reply</span>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.adminReply}</p>
                      {comment.adminRepliedAt && (
                        <time className="text-xs text-muted-foreground" dateTime={comment.adminRepliedAt}>
                          {format(new Date(comment.adminRepliedAt), "MMM d, yyyy")}
                        </time>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
