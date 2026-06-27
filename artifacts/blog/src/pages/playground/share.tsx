import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { PlaygroundWorkspace } from "@/components/platform/playground-workspace";
import { getPlaygroundByShareToken } from "@/lib/platform-api";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PlaygroundSharePage() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";

  const { data: pg, isLoading, error } = useQuery({
    queryKey: ["playgrounds", "share", token],
    queryFn: () => getPlaygroundByShareToken(token),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <PlatformHubLayout title="Loading shared snippet…" description="" section="Playground" backHref="/playground" backLabel="Playground">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </PlatformHubLayout>
    );
  }

  if (error || !pg) {
    return (
      <PlatformHubLayout title="Link expired or invalid" description="" section="Playground" backHref="/playground" backLabel="Playground">
        <Button asChild variant="outline"><Link href="/playground">Go to playground</Link></Button>
      </PlatformHubLayout>
    );
  }

  const editorLang = pg.language as "html-css-js" | "python" | "sql";

  return (
    <PlatformHubLayout
      title={pg.title}
      description="Shared snippet (read-only)"
      section="Playground"
      backHref="/playground"
      backLabel="Playground"
    >
      <PlaygroundWorkspace
        language={editorLang}
        initialTitle={pg.title}
        initialFiles={Object.fromEntries(pg.files.map((f) => [f.filename, f.content]))}
        readOnly
      />
    </PlatformHubLayout>
  );
}
