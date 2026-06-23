import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetStatsOverview, useGetPostStats } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  const { data: stats } = useGetStatsOverview();
  const { data: postStats, isLoading } = useGetPostStats({ limit: 100 });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed view of your content performance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Published Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.publishedPosts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Views / Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {stats?.publishedPosts ? Math.round(stats.totalViews / stats.publishedPosts).toLocaleString() : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight mb-4">Content Performance</h2>
          <div className="border rounded-md bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">Loading...</TableCell>
                  </TableRow>
                ) : postStats?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No data available</TableCell>
                  </TableRow>
                ) : (
                  postStats?.map((stat, index) => (
                    <TableRow key={stat.id}>
                      <TableCell className="text-center text-muted-foreground font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{stat.title}</TableCell>
                      <TableCell>{stat.categoryName || "—"}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{stat.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(new Date(stat.createdAt), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
