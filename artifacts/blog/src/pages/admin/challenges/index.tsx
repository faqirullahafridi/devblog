import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useListAdminChallenges,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useGetAuthMe } from "@workspace/api-client-react";

export default function AdminChallengesPage() {
  useGetAuthMe();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListAdminChallenges({ search: search || undefined });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
            <p className="text-muted-foreground text-sm">Manage coding challenges and test cases</p>
          </div>
          <Button asChild><Link href="/admin/challenges/new">Add challenge</Link></Button>
        </div>

        <Input
          placeholder="Search challenges…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10">Loading…</TableCell></TableRow>
              ) : !data?.challenges?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No challenges</TableCell></TableRow>
              ) : (
                data.challenges.map((ch) => (
                  <TableRow key={ch.id}>
                    <TableCell className="font-medium">{ch.title}</TableCell>
                    <TableCell><Badge variant="outline">{ch.difficulty}</Badge></TableCell>
                    <TableCell>{ch.category}</TableCell>
                    <TableCell>{ch.points}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/challenges/${ch.id}/edit`}>Edit</Link>
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
