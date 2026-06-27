import { AdminLayout } from "@/components/layout/admin-layout";
import {
  useListComments,
  useReplyToComment,
  useDeleteComment,
  getListCommentsQueryKey,
} from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminComments() {
  const { data: comments, isLoading } = useListComments();
  const replyToComment = useReplyToComment();
  const deleteComment = useDeleteComment();
  const queryClient = useQueryClient();

  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey() });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyId || !replyText.trim()) return;
    try {
      await replyToComment.mutateAsync({
        id: replyId,
        data: { reply: replyText.trim() },
      });
      toast.success("Reply posted");
      setReplyId(null);
      setReplyText("");
      invalidate();
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteComment.mutateAsync({ id: deleteId });
      toast.success("Comment deleted");
      invalidate();
    } catch {
      toast.error("Failed to delete comment");
    } finally {
      setDeleteId(null);
    }
  };

  const openReply = (id: number, existingReply?: string | null) => {
    setReplyId(id);
    setReplyText(existingReply ?? "");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comments</h1>
          <p className="text-muted-foreground mt-1">
            Review, reply to, or remove comments from your blog posts.
          </p>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : comments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No comments yet
                  </TableCell>
                </TableRow>
              ) : (
                comments?.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="font-medium">{comment.authorName}</div>
                      {comment.authorEmail && (
                        <div className="text-xs text-muted-foreground">{comment.authorEmail}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {comment.postSlug ? (
                        <Link href={`/post/${comment.postSlug}`} className="hover:underline text-sm">
                          {comment.postTitle ?? "View post"}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Post #{comment.postId}</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                      {comment.adminReply && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          Reply: {comment.adminReply}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {format(new Date(comment.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReply(comment.id, comment.adminReply)}
                      >
                        {comment.adminReply ? "Edit reply" : "Reply"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(comment.id)}
                      >
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

      <Dialog open={!!replyId} onOpenChange={(open) => !open && setReplyId(null)}>
        <DialogContent>
          <form onSubmit={handleReply}>
            <DialogHeader>
              <DialogTitle>Reply to comment</DialogTitle>
              <DialogDescription>
                Your reply will appear on the public post page.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <Label htmlFor="reply">Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReplyId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={replyToComment.isPending}>
                {replyToComment.isPending ? "Saving..." : "Post reply"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete comment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The comment will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteComment.isPending}>
              {deleteComment.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
