import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { PlaygroundWorkspace } from "@/components/platform/playground-workspace";
import { getPlayground, forkPlayground } from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tools/copy-button";
import { Loader2, GitFork, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { platformEvents, trackEvent, GA_KEY_EVENTS } from "@/lib/analytics";
import { useEffect } from "react";

export default function PlaygroundDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: pg, isLoading, error } = useQuery({
    queryKey: ["playgrounds", slug],
    queryFn: () => getPlayground(slug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (pg) trackEvent(GA_KEY_EVENTS.PLAYGROUND_VIEW, { slug: pg.slug, language: pg.language });
  }, [pg?.slug, pg?.language]);

  const fork = useMutation({
    mutationFn: () => forkPlayground(slug),
    onSuccess: (forked) => {
      platformEvents.playgroundFork(forked.language);
      toast.success(`Forked — open /playground/${forked.slug}`);
      window.location.href = `/playground/${forked.slug}`;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <PlatformHubLayout title="Loading snippet…" description="" section="Playground" backHref="/playground" backLabel="Playground">
        <div className="h-40 bg-muted animate-pulse rounded-xl flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PlatformHubLayout>
    );
  }

  if (error || !pg) {
    return (
      <PlatformHubLayout title="Snippet not found" description="This playground may be private or deleted." section="Playground" backHref="/playground" backLabel="Playground">
        <Button asChild variant="outline"><Link href="/playground">Browse playground</Link></Button>
      </PlatformHubLayout>
    );
  }

  const editorLang = pg.language as "html-css-js" | "python" | "sql";
  const shareUrl = `${window.location.origin}/playground/${pg.slug}`;

  return (
    <PlatformHubLayout
      title={pg.title}
      description={`${pg.language} · by ${pg.authorName} · ${pg.views} views`}
      section="Playground"
      backHref="/playground"
      backLabel="Playground"
    >
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <CopyButton value={shareUrl} label="Copy link" />
        <Button size="sm" variant="secondary" onClick={() => fork.mutate()} disabled={fork.isPending}>
          {fork.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <GitFork className="h-4 w-4 mr-1" />}
          Fork
        </Button>
        <Button size="sm" variant="outline" asChild>
          <a href={`/playground/${editorLang}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" /> Open editor
          </a>
        </Button>
      </div>

      <PlaygroundWorkspace
        language={editorLang}
        initialSlug={pg.slug}
        initialTitle={pg.title}
        initialFiles={Object.fromEntries(pg.files.map((f) => [f.filename, f.content]))}
      />
    </PlatformHubLayout>
  );
}
