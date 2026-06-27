import { useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { CopyableBlock } from "@/components/hub/copyable-block";
import { Badge } from "@/components/ui/badge";
import { getSnippetBySlug } from "@/lib/snippets-config";
import { ContentGuide } from "@/components/hub/content-guide";
import { getSnippetGuide } from "@/lib/content/snippet-guides";
import NotFound from "@/pages/not-found";

export default function SnippetDetailPage() {
  const [, params] = useRoute("/snippets/:slug");
  const snippet = params?.slug ? getSnippetBySlug(params.slug) : undefined;

  if (!snippet) return <NotFound />;

  return (
    <HubPageLayout
      title={snippet.title}
      description={snippet.description}
      backHref="/snippets"
      backLabel="All snippets"
      section="Snippet"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant="outline" className="capitalize">
          {snippet.language}
        </Badge>
        {snippet.tags.map((t) => (
          <Badge key={t} variant="secondary">
            {t}
          </Badge>
        ))}
      </div>
      <CopyableBlock value={snippet.code} label="Copy code" />
      <ContentGuide
        title="How it works"
        content={getSnippetGuide(snippet.slug, snippet.language, snippet.tags)}
      />
    </HubPageLayout>
  );
}
