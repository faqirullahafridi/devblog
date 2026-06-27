import { SeoHead } from "@/components/seo-head";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplatesLayout } from "@/components/templates/templates-layout";
import type { TemplateDef } from "@/lib/templates-config";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

type TemplateListPageProps = {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  path: string;
  templates: TemplateDef[];
  backHref?: string;
  backLabel?: string;
};

export function TemplateListPage({
  title,
  description,
  seoTitle,
  seoDescription,
  path,
  templates,
  backHref = "/templates",
  backLabel = "All templates",
}: TemplateListPageProps) {
  return (
    <TemplatesLayout wide>
      <SeoHead title={seoTitle} description={seoDescription} url={path} />
      <div className="container mx-auto px-4 py-10">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>
          <p className="text-sm text-muted-foreground mt-2">{templates.length} templates</p>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      </div>
    </TemplatesLayout>
  );
}
