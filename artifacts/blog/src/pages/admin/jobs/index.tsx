import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useListAdminJobs,
  useDeleteJob,
  getListAdminJobsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useGetAuthMe } from "@workspace/api-client-react";

export default function AdminJobsPage() {
  useGetAuthMe();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading } = useListAdminJobs({ search: search || undefined });
  const deleteJob = useDeleteJob();

  const handleDelete = async (id: number) => {
    if (!confirm("Deactivate this job listing?")) return;
    try {
      await deleteJob.mutateAsync({ id });
      toast.success("Job deactivated");
      queryClient.invalidateQueries({ queryKey: getListAdminJobsQueryKey() });
    } catch {
      toast.error("Failed to deactivate job");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
            <p className="text-muted-foreground text-sm">Manage developer job listings</p>
          </div>
          <Button asChild><Link href="/admin/jobs/new">Add job</Link></Button>
        </div>

        <Input
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading…</TableCell></TableRow>
              ) : !data?.jobs?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No jobs</TableCell></TableRow>
              ) : (
                data.jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.company}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell>
                      <Badge variant={job.isActive ? "default" : "secondary"}>
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/jobs/${job.id}/edit`}>Edit</Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(job.id)} disabled={deleteJob.isPending}>
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
