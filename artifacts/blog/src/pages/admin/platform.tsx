import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  useGetAuthMe,
  useGetAiStats,
  useGetPlaygroundStats,
  useGetRoadmapStats,
  useGetChallengeStats,
  useListCommunityReports,
} from "@workspace/api-client-react";

export default function AdminPlatformPage() {
  useGetAuthMe();
  const { data: ai } = useGetAiStats();
  const { data: pg } = useGetPlaygroundStats();
  const { data: rm } = useGetRoadmapStats();
  const { data: ch } = useGetChallengeStats();
  const { data: reports } = useListCommunityReports({ status: "pending" });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform</h1>
          <p className="text-muted-foreground">AI, playground, roadmaps, challenges, jobs, and community metrics.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">AI requests</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{(ai?.totals as { requests?: number })?.requests ?? "—"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Playground snippets</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{(pg?.totals as { total?: number })?.total ?? "—"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Roadmaps generated</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{rm?.totalRoadmaps ?? "—"}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Challenges</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{ch?.challenges ?? "—"} <span className="text-sm font-normal text-muted-foreground">/ {ch?.submissions ?? 0} submissions</span></p></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Pending community reports</CardTitle></CardHeader>
          <CardContent>
            {Array.isArray(reports) && reports.length > 0 ? (
              <ul className="text-sm space-y-2">
                {reports.slice(0, 10).map((r) => (
                  <li key={r.id} className="border-b pb-2">{r.targetType}: {r.reason}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No pending reports.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link href="/admin/jobs">Manage jobs</Link></Button>
          <Button asChild variant="outline"><Link href="/admin/challenges">Manage challenges</Link></Button>
        </div>
      </div>
    </AdminLayout>
  );
}
