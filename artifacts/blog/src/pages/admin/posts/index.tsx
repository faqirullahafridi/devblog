import { AdminLayout } from "@/components/layout/admin-layout";
import { useListPosts, useDeletePost, useTogglePostPublish, getListPostsQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function PostsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const { data: postsData, isLoading } = useListPosts({
    search: search || undefined,
    status,
    limit: 100
  });

  const deletePost = useDeletePost();
  const togglePublish = useTogglePostPublish();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePost.mutateAsync({ id: deleteId });
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: "draft" | "published") => {
    try {
      await togglePublish.mutateAsync({
        id,
        data: { status: currentStatus === "draft" ? "published" : "draft" }
      });
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <Button asChild>
            <Link href="/admin/posts/new">Create Post</Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={status} onValueChange={(val: any) => setStatus(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Drafts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : postsData?.posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No posts found</TableCell>
                </TableRow>
              ) : (
                postsData?.posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/posts/${post.id}/edit`} className="hover:underline">
                        {post.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        className={`text-xs px-2 py-1 rounded-full transition-colors ${post.status === 'published' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                      >
                        {post.status}
                      </button>
                    </TableCell>
                    <TableCell>{post.categoryName || "None"}</TableCell>
                    <TableCell>{post.views.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(post.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(post.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePost.isPending}>
              {deletePost.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
