import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { CodeEditor } from "@/components/platform/code-editor";
import { getChallenge, submitChallenge } from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MarkdownContent } from "@/components/markdown-content";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { platformEvents } from "@/lib/analytics";

export default function ChallengeDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["challenge", slug],
    queryFn: () => getChallenge(slug),
    enabled: !!slug,
  });

  const submit = useMutation({
    mutationFn: () => submitChallenge(slug, code, name || undefined),
    onSuccess: (res) => {
      platformEvents.challengeSubmit(slug, res.result.passed);
      if (res.result.passed) toast.success("All tests passed!");
      else toast.error(res.result.error || "Some tests failed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (challenge?.starterCode) setCode(challenge.starterCode);
  }, [challenge?.id]);

  if (isLoading || !challenge) {
    return (
      <PlatformHubLayout title="Loading…" description="" section="Challenges" backHref="/challenges" backLabel="Challenges">
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      </PlatformHubLayout>
    );
  }

  return (
    <PlatformHubLayout title={challenge.title} description={`${challenge.difficulty} · ${challenge.category}`} section="Challenges" backHref="/challenges" backLabel="Challenges">
      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <MarkdownContent content={challenge.description} size="sm" />
      </div>

      <CodeEditor value={code} onChange={setCode} language="javascript" minHeight="min-h-[280px]" className="mb-4" />
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Display name (leaderboard)" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
        <Button onClick={() => submit.mutate()} disabled={submit.isPending || !code.trim()}>
          {submit.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Submit
        </Button>
      </div>

      {submit.data?.result && (
        <pre className="mt-4 text-xs font-mono bg-muted p-4 rounded-lg overflow-auto">
          {JSON.stringify(submit.data.result, null, 2)}
        </pre>
      )}
    </PlatformHubLayout>
  );
}
