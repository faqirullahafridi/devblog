import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { ContentSidebar } from "@/components/layout/content-sidebar";
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
import { MarkdownContent } from "@/components/markdown-content";
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
    query: { enabled: !!slug },
  });

  const { data: comments, isLoading: isLoadingComments } = useListComments(
    { postId: post?.id ?? 0 },
    { query: { enabled: !!post?.id } },
  );

  const incrementView = useIncrementPostView();
  const createComment = useCreateComment();
  const [related, setRelated] = useState<RelatedPost[]>([]);

  useEffect(() => {
    if (post?.id) incrementView.mutate({ id: post.id });
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
          content,
        },
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
        <ContentShell width="article" showAdSidebar>
          <div className="animate-pulse space-y-8 max-w-3xl">
            <div className="h-10 bg-muted w-3/4 rounded-lg" />
            <div className="h-6 bg-muted w-1/4 rounded" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </ContentShell>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <ContentShell width="default">
          <div className="py-16 text-center">
            <h1 className="text-2xl font-semibold">Post not found</h1>
            <Button asChild variant="link" className="mt-4">
              <Link href="/search">Browse articles</Link>
            </Button>
          </div>
        </ContentShell>
      </PublicLayout>
    );
  }

  const postUrl = siteUrl(`/post/${post.slug}`);
  const seoTitle = post.seoTitle || post.title;
  const seoDesc = post.metaDescription || post.excerpt || "";

  const articleSidebar = (
    <ContentSidebar>
      <TableOfContents content={post.content} variant="sidebar" />
    </ContentSidebar>
  );

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

      <ContentShell width="article" sidebar={articleSidebar} mainClassName="max-w-3xl lg:max-w-none">
        <article>
          <header className="space-y-4 mb-8 md:mb-10 pb-8 border-b border-border">
            <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                <li aria-hidden>/</li>
                <li><Link href="/search" className="hover:text-foreground">Articles</Link></li>
                {post.categorySlug && (
                  <>
                    <li aria-hidden>/</li>
                    <li>
                      <Link href={`/category/${post.categorySlug}`} className="hover:text-foreground">
                        {post.categoryName}
                      </Link>
                    </li>
                  </>
                )}
              </ol>
            </nav>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {post.categorySlug && (
                <Link href={`/category/${post.categorySlug}`} className="font-medium text-primary hover:underline">
                  {post.categoryName}
                </Link>
              )}
              <span aria-hidden>·</span>
              <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
              {post.readingTime && (
                <>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.15] text-balance">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed text-pretty">{post.excerpt}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <ShareButtons title={post.title} url={postUrl} />
              <PostTags tags={(post as typeof post & { tags?: string[] }).tags} />
            </div>
          </header>

          {post.featuredImage && (
            <figure className="mb-8 aspect-[2/1] overflow-hidden rounded-xl bg-muted border border-border shadow-sm">
              <SafeImage
                src={post.featuredImage}
                alt={post.title}
                width={IMAGE_WIDTHS.hero}
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
                className="object-cover w-full h-full"
                wrapperClassName="w-full h-full"
              />
            </figure>
          )}

          <AdSlot variant="in-article" className="mb-8 lg:hidden" />
          <AdSlot variant="banner" className="mb-8 hidden lg:block" />

          <div className="lg:hidden">
            <TableOfContents content={post.content} variant="inline" />
          </div>

          <div className="article-body">
            <MarkdownContent content={post.content} />
          </div>

          <AdSlot variant="in-article" className="mt-10" />

          {related.length > 0 && (
            <section className="mt-14 pt-10 border-t border-border space-y-6">
              <h2 className="text-xl font-semibold tracking-tight">Related articles</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((p) => (
                  <PostCard key={p.id} post={p as import("@workspace/api-client-react").Post} variant="card" />
                ))}
              </div>
            </section>
          )}

          <section id="comments" className="mt-14 pt-10 border-t border-border space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Comments</h2>

            <form onSubmit={handleCommentSubmit} className="space-y-4 rounded-xl border border-border bg-muted/30 p-5 md:p-6">
              <h3 className="font-medium text-sm">Add a comment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
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
                {createComment.isPending ? "Posting..." : "Post comment"}
              </Button>
            </form>

            <div className="space-y-4">
              {isLoadingComments ? (
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              ) : comments?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <time className="text-xs text-muted-foreground" dateTime={comment.createdAt}>
                        {format(new Date(comment.createdAt), "MMM d, yyyy")}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                    {comment.adminReply && (
                      <div className="mt-3 pl-3 border-l-2 border-primary/40 space-y-1">
                        <span className="text-xs font-medium text-primary">Admin reply</span>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comment.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </article>
      </ContentShell>
    </PublicLayout>
  );
}
