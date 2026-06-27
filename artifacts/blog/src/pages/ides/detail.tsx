import { Link, useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIdeBySlug } from "@/lib/ides-config";
import NotFound from "@/pages/not-found";
import { Check, Download, ExternalLink } from "lucide-react";
import { ContentGuide } from "@/components/hub/content-guide";
import { getIdeGuide } from "@/lib/content/ide-guides";

const PLATFORM_LABELS: Record<string, string> = {
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  web: "Web",
};

export default function IdeDetailPage() {
  const [, params] = useRoute("/ides/:slug");
  const ide = params?.slug ? getIdeBySlug(params.slug) : undefined;

  if (!ide) return <NotFound />;

  const Icon = ide.icon;

  return (
    <HubPageLayout
      title={ide.name}
      description={ide.tagline}
      backHref="/ides"
      backLabel="All IDEs"
      section="IDE"
      footer={
        <div className="mt-10 pt-8 border-t flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <a href={ide.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Official website
            </a>
          </Button>
          {ide.relatedHref && (
            <Button asChild variant="ghost">
              <Link href={ide.relatedHref}>Related guide on devblog →</Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <Badge variant="secondary">{ide.pricing}</Badge>
        <Badge variant="outline">{IDE_CATEGORIES_LABEL[ide.category]}</Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-8">{ide.description}</p>

      <section className="mb-10">
        <h2 className="text-lg font-bold mb-4">Download</h2>
        <div className="flex flex-wrap gap-3">
          {ide.downloads.map((dl) => (
            <Button key={dl.platform} asChild>
              <a href={dl.url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                {dl.label || PLATFORM_LABELS[dl.platform]}
              </a>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Links go to official vendor download pages. Always verify URLs before installing.
        </p>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold mb-4">Key features</h2>
          <ul className="space-y-2.5">
            {ide.features.map((feature) => (
              <li key={feature} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Best for</h2>
          <ul className="flex flex-wrap gap-2">
            {ide.bestFor.map((item) => (
              <li key={item}>
                <Badge variant="outline">{item}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <ContentGuide title="Setup guide & tips" content={getIdeGuide(ide.slug)} />
    </HubPageLayout>
  );
}

const IDE_CATEGORIES_LABEL: Record<string, string> = {
  editors: "Editor",
  "full-ide": "Full IDE",
  jetbrains: "JetBrains",
  terminal: "Terminal",
  mobile: "Mobile / Platform",
};
