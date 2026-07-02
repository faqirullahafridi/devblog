import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { TOOLS, getToolHref, getToolBySlug } from "@/lib/tools-config";
import { ChevronLeft } from "lucide-react";
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
  const others = TOOLS.filter((t) => t.name !== title).slice(0, 4);

  return (
    <PublicLayout>
      <SeoHead title={seoTitle(`${title} Tools`)} description={description} />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          All tools
        </Link>
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </header>
        {children}
        {tool && <ContentGuide content={getToolGuide(tool.slug)} />}
        {tool && <ToolRelatedArticles searchTerms={tool.searchTerms} />}
        <aside className="mt-12 pt-8 border-t">
          <p className="text-sm font-medium text-foreground mb-3">More developer tools</p>
          <div className="flex flex-wrap gap-2">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={getToolHref(t.slug)}
                className="text-sm px-3 py-1.5 border-2 border-foreground bg-muted/30 text-foreground hover:bg-muted transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}
