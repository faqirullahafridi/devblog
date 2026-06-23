import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetStatsOverview, useGetPostStats, useListPosts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading: isLoadingStats } = useGetStatsOverview();
  const { data: topPosts, isLoading: isLoadingTopPosts } = useGetPostStats({ limit: 5 });
  const { data: recentPosts, isLoading: isLoadingRecent } = useListPosts({ limit: 5, status: "all" });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your blog's performance.</p>
        </div>

        {isLoadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl"></div>)}
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.publishedPosts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  + {stats.draftPosts} drafts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalSubscribers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalComments}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Posts by Views</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTopPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {topPosts?.map((post) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline truncate max-w-[200px] sm:max-w-[300px]">
                        {post.title}
                      </Link>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {post.views.toLocaleString()} views
                      </div>
                    </div>
                  ))}
                  {topPosts?.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Posts</CardTitle>
              <Link href="/admin/posts" className="text-sm text-primary hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              {isLoadingRecent ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded"></div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentPosts?.posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between">
                      <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline truncate max-w-[200px] sm:max-w-[300px]">
                        {post.title}
                      </Link>
                      <div className={`text-xs px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {post.status}
                      </div>
                    </div>
                  ))}
                  {recentPosts?.posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
