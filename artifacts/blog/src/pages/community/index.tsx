import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import {
  listCommunityQuestions,
  getCommunityQuestion,
  createCommunityQuestion,
  postCommunityAnswer,
  voteCommunity,
} from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";
import { useState } from "react";
import { toast } from "sonner";
import { platformEvents } from "@/lib/analytics";

export default function CommunityIndexPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["community", search],
    queryFn: () => listCommunityQuestions({ search: search || undefined }),
  });

  return (
    <PlatformHubLayout title="Developer Community" description="Ask questions, share answers, and build reputation." section="Platform">
      <div className="flex flex-wrap gap-2 mb-6">
        <Input placeholder="Search questions…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button asChild size="sm"><Link href="/community/ask">Ask question</Link></Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {data?.questions.map((q) => (
            <Link key={q.id} href={`/community/question/${q.id}`} className="block rounded-xl border bg-card p-4 hover:border-primary/40">
              <h2 className="font-semibold">{q.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{q.authorName} · {q.score} votes · {q.views} views</p>
            </Link>
          ))}
        </div>
      )}
    </PlatformHubLayout>
  );
}

export function CommunityAskPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");

  const create = useMutation({
    mutationFn: () => createCommunityQuestion({ title, body, authorName: name || undefined }),
    onSuccess: (q) => {
      platformEvents.communityAsk();
      window.location.href = `/community/question/${q.id}`;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PlatformHubLayout title="Ask a question" description="" section="Community" backHref="/community" backLabel="Community">
      <div className="max-w-xl space-y-4">
        <Input placeholder="Question title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Details (markdown supported in body as plain text)" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[160px]" />
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => create.mutate()} disabled={!title || !body}>Post question</Button>
      </div>
    </PlatformHubLayout>
  );
}

export function CommunityQuestionPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const qc = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [name, setName] = useState("");

  const { data: q, isLoading } = useQuery({
    queryKey: ["community-q", id],
    queryFn: () => getCommunityQuestion(id),
    enabled: id > 0,
  });

  const postAnswer = useMutation({
    mutationFn: () => postCommunityAnswer(id, answer, name || undefined),
    onSuccess: () => {
      platformEvents.communityAnswer(id);
      setAnswer("");
      qc.invalidateQueries({ queryKey: ["community-q", id] });
      toast.success("Answer posted");
    },
  });

  const vote = useMutation({
    mutationFn: ({ type, targetId, value }: { type: "question" | "answer"; targetId: number; value: 1 | -1 }) =>
      voteCommunity(type, targetId, value),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-q", id] }),
  });

  if (isLoading || !q) return <PlatformHubLayout title="Loading…" description="" section="Community" backHref="/community" backLabel="Community"><div className="h-40 bg-muted rounded-xl animate-pulse" /></PlatformHubLayout>;

  return (
    <PlatformHubLayout title={q.title} description="" section="Community" backHref="/community" backLabel="Community">
      <div className="mb-6">
        <MarkdownContent content={q.body} size="sm" />
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={() => vote.mutate({ type: "question", targetId: q.id, value: 1 })}>▲ {q.score}</Button>
          <Button size="sm" variant="ghost" onClick={() => vote.mutate({ type: "question", targetId: q.id, value: -1 })}>▼</Button>
        </div>
      </div>

      <h2 className="font-bold mb-4">{q.answers?.length ?? 0} Answers</h2>
      <div className="space-y-4 mb-8">
        {q.answers?.map((a) => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.isAccepted ? "border-green-500/50 bg-green-500/5" : "bg-card"}`}>
            <MarkdownContent content={a.body} size="sm" />
            <p className="text-xs text-muted-foreground mt-2">{a.authorName} · score {a.score}</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => vote.mutate({ type: "answer", targetId: a.id, value: 1 })}>▲</Button>
              <Button size="sm" variant="ghost" onClick={() => vote.mutate({ type: "answer", targetId: a.id, value: -1 })}>▼</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 max-w-xl">
        <Textarea placeholder="Your answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <Input placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => postAnswer.mutate()} disabled={!answer.trim()}>Post answer</Button>
      </div>
    </PlatformHubLayout>
  );
}

export function CommunityTagPage() {
  const params = useParams<{ slug: string }>();
  const tag = params.slug ?? "";
  const { data } = useQuery({ queryKey: ["community-tag", tag], queryFn: () => listCommunityQuestions({ tag }) });

  return (
    <PlatformHubLayout title={`#${tag}`} description="Questions tagged with this topic." section="Community" backHref="/community" backLabel="Community">
      <div className="space-y-3">
        {data?.questions.map((q) => (
          <Link key={q.id} href={`/community/question/${q.id}`} className="block rounded-xl border p-4 hover:border-primary/40">
            <h2 className="font-semibold">{q.title}</h2>
          </Link>
        ))}
      </div>
    </PlatformHubLayout>
  );
}

export function CommunityProfilePage() {
  const params = useParams<{ username: string }>();
  return (
    <PlatformHubLayout title={`@${params.username}`} description="Community profile" section="Community" backHref="/community" backLabel="Community">
      <p className="text-sm text-muted-foreground">Profile stats load from /api/community/profile/:username</p>
    </PlatformHubLayout>
  );
}
