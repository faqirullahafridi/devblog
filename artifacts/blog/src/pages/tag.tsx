import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { PostCard } from "@/components/post-card";
import { Pagination } from "@/components/pagination";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { getPostsByTag } from "@/lib/api-extra";
import type { Post } from "@workspace/api-client-react";

const PAGE_SIZE = 10;

export default function TagPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ posts: Post[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState(slug);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPostsByTag(slug, page, PAGE_SIZE)
      .then((res) => {
        setData({ posts: res.posts as Post[], total: res.total });
        const first = (res.posts as Post[])[0] as Post & { tags?: string[] };
        const match = first?.tags?.find(
          (t) => t.toLowerCase().replace(/[^\w]+/g, "-") === slug.toLowerCase(),
        );
        if (match) setTagName(match);
        else setTagName(slug.replace(/-/g, " "));
      })
      .catch(() => setData({ posts: [], total: 0 }))
      .finally(() => setLoading(false));
  }, [slug, page]);

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <PublicLayout>
      <SeoHead
        title={seoTitle(tagName)}
        description={`Articles tagged with ${tagName} on TechVentry.`}
      />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tag</p>
          <h1 className="text-4xl font-extrabold tracking-tight capitalize">{tagName}</h1>
          <p className="text-muted-foreground mt-2">
            {data?.total ?? 0} article{(data?.total ?? 0) === 1 ? "" : "s"}
          </p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">No posts with this tag yet.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {data?.posts.map((post) => (
                <PostCard key={post.id} post={post} variant="card" />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </PublicLayout>
  );
}
