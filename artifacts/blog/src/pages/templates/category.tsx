import { useRoute, Link } from "wouter";
import { TemplatesLayout } from "@/components/templates/templates-layout";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { TemplateCard } from "@/components/templates/template-card";
import { getCategoryBySlug, getTemplatesByCategory } from "@/lib/templates-config";
import NotFound from "@/pages/not-found";
import { ChevronLeft } from "lucide-react";

export default function TemplatesCategoryPage() {
  const [, params] = useRoute("/templates/category/:slug");
  const category = params?.slug ? getCategoryBySlug(params.slug) : undefined;

  if (!category) return <NotFound />;

  const templates = getTemplatesByCategory(category.slug);

  return (
    <TemplatesLayout wide>
      <SeoHead
        title={category.seoTitle}
        description={category.seoDescription}
        url={siteUrl(`/templates/category/${category.slug}`)}
      />
      <div className="container mx-auto px-4 py-10">
        <Link href="/templates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All templates
        </Link>
        <header className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">Category</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{category.title}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">{category.description}</p>
          <p className="text-sm text-muted-foreground mt-2">{templates.length} free templates</p>
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
