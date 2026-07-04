import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { TOOLS, getToolHref, getToolBySlug } from "@/lib/tools-config";
import { ToolRelatedArticles } from "@/components/tools/tool-related-articles";
import { ContentGuide } from "@/components/hub/content-guide";
import { getToolGuide } from "@/lib/content/tool-guides";

export function ToolPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const toolSlug = location.match(/\/tools\/([^/?#]+)/)?.[1];
  const tool = toolSlug ? getToolBySlug(toolSlug) : TOOLS.find((t) => t.name === title);
  const others = TOOLS.filter((t) => t.name !== title).slice(0, 6);

  return (
    <PublicLayout>
      <SeoHead title={seoTitle(`${title} Tools`)} description={description} />
      <ContentShell width="default" showAdSidebar>
        <PageHeader
          title={title}
          description={description}
          section="Developer tools"
          backHref="/tools"
          backLabel="All tools"
        />
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm mb-8">{children}</div>
        {tool && <ContentGuide content={getToolGuide(tool.slug)} />}
        {tool && <ToolRelatedArticles searchTerms={tool.searchTerms} />}
        <aside className="mt-12 pt-8 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-3">More developer tools</p>
          <div className="flex flex-wrap gap-2">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={getToolHref(t.slug)}
                className="text-sm px-3 py-1.5 rounded-md border border-border bg-muted/40 text-foreground hover:bg-muted transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </aside>
      </ContentShell>
    </PublicLayout>
  );
}
