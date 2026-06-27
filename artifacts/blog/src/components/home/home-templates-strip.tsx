import { Link } from "wouter";
import { getFeaturedTemplates } from "@/lib/templates-config";
import { getTemplateHref } from "@/lib/templates-config";
import { SafeImage } from "@/components/safe-image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

export function HomeTemplatesStrip() {
  const templates = getFeaturedTemplates(4);

  return (
    <section className="container mx-auto px-4 py-14 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">Templates</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Ship faster with free templates</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Landing pages, portfolios, and SaaS kits — preview live, copy code, or download ZIP.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 gap-2">
          <Link href="/templates">
            Browse library <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-[2px] bg-foreground border-2 border-foreground brutal-shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((template) => (
          <Link
            key={template.slug}
            href={getTemplateHref(template.slug)}
            className="group relative flex flex-col overflow-hidden bg-card hover:bg-muted/40 transition-colors"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <SafeImage
                src={template.previewImage}
                alt=""
                className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                wrapperClassName="h-full w-full"
              />
              <span className="absolute top-3 left-3 border-2 border-foreground bg-background px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {template.categoryTitle}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1 border-t-2 border-foreground">
              <h3 className="font-black text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {template.title}
              </h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 flex-1">{template.shortDescription}</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary mt-auto">
                <Download className="h-3 w-3" /> Free download
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
