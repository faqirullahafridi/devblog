import { PublicLayout } from "@/components/layout/public-layout";
import { PostCard } from "@/components/post-card";
import { useGetCategoryBySlug, useListPosts } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useState } from "react";
import { Pagination } from "@/components/pagination";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";

const PAGE_SIZE = 10;

export default function Category() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState(1);

  const { data: category, isLoading: isLoadingCategory } = useGetCategoryBySlug(slug, {
    query: { enabled: !!slug }
  });

  const { data: postsData, isLoading: isLoadingPosts } = useListPosts(
    { category: slug, status: "published", limit: PAGE_SIZE, page },
    { query: { enabled: !!slug } }
  );

  const totalPages = Math.ceil((postsData?.total ?? 0) / PAGE_SIZE);

  return (
    <PublicLayout>
      <SeoHead
        title={category ? seoTitle(category.name) : seoTitle("Category")}
        description={category?.description || undefined}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          {isLoadingCategory ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted w-1/3 rounded"></div>
              <div className="h-6 bg-muted w-2/3 rounded"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight">{category?.name}</h1>
              {category?.description && (
                <p className="text-xl text-muted-foreground">{category.description}</p>
              )}
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          {isLoadingPosts ? (
            <div className="grid gap-10">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>)}
            </div>
          ) : postsData?.posts.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-xl border">
              <p className="text-muted-foreground">No posts found in this category yet.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {postsData?.posts.map(post => (
                  <PostCard key={post.id} post={post} variant="card" />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
