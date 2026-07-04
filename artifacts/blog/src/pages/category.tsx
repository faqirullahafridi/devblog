import { PublicLayout } from "@/components/layout/public-layout";
import { ListingShell } from "@/components/layout/content-shell";
import { ContentSidebar } from "@/components/layout/content-sidebar";
import { PageHeader } from "@/components/layout/page-header";
import { PostCard } from "@/components/post-card";
import { useGetCategoryBySlug, useListPosts } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useState } from "react";
import { Pagination } from "@/components/pagination";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { AdSlot } from "@/components/site-scripts";

const PAGE_SIZE = 10;

export default function Category() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState(1);

  const { data: category, isLoading: isLoadingCategory } = useGetCategoryBySlug(slug, {
    query: { enabled: !!slug },
  });

  const { data: postsData, isLoading: isLoadingPosts } = useListPosts(
    { category: slug, status: "published", limit: PAGE_SIZE, page },
    { query: { enabled: !!slug } },
  );

  const totalPages = Math.ceil((postsData?.total ?? 0) / PAGE_SIZE);

  return (
    <PublicLayout>
      <SeoHead
        title={category ? seoTitle(category.name) : seoTitle("Category")}
        description={category?.description || undefined}
      />
      <ListingShell sidebar={<ContentSidebar />}>
        {isLoadingCategory ? (
          <div className="space-y-4 animate-pulse mb-8">
            <div className="h-10 bg-muted w-1/3 rounded-lg" />
            <div className="h-6 bg-muted w-2/3 rounded" />
          </div>
        ) : (
          <PageHeader
            title={category?.name ?? "Category"}
            description={category?.description ?? undefined}
            section="Articles"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/search" },
              { label: category?.name ?? "Category" },
            ]}
          />
        )}

        <AdSlot variant="banner" className="mb-8 md:hidden" />

        {isLoadingPosts ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : postsData?.posts.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-border bg-muted/20">
            <p className="text-muted-foreground">No posts in this category yet.</p>
            <Link href="/search" className="text-sm text-primary hover:underline mt-2 inline-block">
              Browse all articles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {postsData?.posts.map((post) => (
                <PostCard key={post.id} post={post} variant="card" />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </ListingShell>
    </PublicLayout>
  );
}
