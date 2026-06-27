import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListSubscribers } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendNewsletter } from "@/lib/api-extra";
import { Badge } from "@/components/ui/badge";

type Subscriber = {
  id: number;
  email: string;
  name?: string | null;
  status?: string;
  createdAt: string;
};

export default function Subscribers() {
  const { data: subscribers, isLoading } = useListSubscribers();
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [sending, setSending] = useState(false);

  const subs = (subscribers ?? []) as Subscriber[];
  const confirmed = subs.filter((s) => s.status === "confirmed" || !s.status);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !html.trim()) return;
    setSending(true);
    try {
      const result = await sendNewsletter({
        subject,
        html,
        postSlug: postSlug.trim() || undefined,
      }) as { sent?: number; total?: number };
      toast.success(`Newsletter sent to ${result.sent ?? 0} of ${result.total ?? 0} subscribers`);
      setSubject("");
      setHtml("");
      setPostSlug("");
    } catch {
      toast.error("Failed to send newsletter — check Resend API key");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">
            {confirmed.length} confirmed subscriber{confirmed.length !== 1 ? "s" : ""}
          </p>
        </div>

        <form onSubmit={handleSend} className="border rounded-xl bg-card p-6 space-y-4 max-w-2xl">
          <h2 className="font-semibold text-lg">Send newsletter</h2>
          <p className="text-sm text-muted-foreground">
            Uses Resend ({import.meta.env.MODE === "production" ? "production" : "dev"}). Without a custom domain, emails send from onboarding@resend.dev to your verified address only in test mode.
          </p>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="html">HTML body</Label>
            <Textarea id="html" value={html} onChange={(e) => setHtml(e.target.value)} rows={6} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postSlug">Link to post slug (optional)</Label>
            <Input id="postSlug" value={postSlug} onChange={(e) => setPostSlug(e.target.value)} placeholder="my-article-slug" />
          </div>
          <Button type="submit" disabled={sending || confirmed.length === 0}>
            {sending ? "Sending…" : `Send to ${confirmed.length} subscribers`}
          </Button>
        </form>

        <div className="border rounded-md bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : subs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No subscribers yet</TableCell>
                </TableRow>
              ) : (
                subs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{sub.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={sub.status === "confirmed" ? "default" : "secondary"}>
                        {sub.status || "legacy"}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(sub.createdAt), "MMM d, yyyy")}</TableCell>
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
