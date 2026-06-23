import { PublicLayout } from "@/components/layout/public-layout";
import { useGetPostBySlug, useIncrementPostView, useListComments, useCreateComment } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getListCommentsQueryKey } from "@workspace/api-client-react";

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

  useEffect(() => {
    if (post?.id) {
      incrementView.mutate({ id: post.id });
    }
  }, [post?.id]);

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
    } catch (error) {
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

  return (
    <PublicLayout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="space-y-6 mb-12 text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            {post.categorySlug && (
              <Link href={`/category/${post.categorySlug}`} className="font-medium text-primary hover:underline">
                {post.categoryName}
              </Link>
            )}
            <span>•</span>
            <time dateTime={post.createdAt}>{format(new Date(post.createdAt), "MMMM d, yyyy")}</time>
            {post.readingTime && (
              <>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </>
            )}
            <span>•</span>
            <span>{post.views} views</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.featuredImage && (
          <div className="mb-12 aspect-[2/1] overflow-hidden rounded-xl bg-muted border shadow-sm">
            <img src={post.featuredImage} alt={post.title} className="object-cover w-full h-full" />
          </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none prose-pre:bg-[#1E1E1E] prose-pre:p-0 prose-pre:border">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                    customStyle={{ margin: 0, padding: '1.25rem' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

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
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </PublicLayout>
  );
}
