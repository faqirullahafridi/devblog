import { Link } from "wouter";
import { TemplateCard } from "@/components/templates/template-card";
import {
  getFeaturedTemplates,
  getNewTemplates,
  getPopularTemplates,
} from "@/lib/templates-config";
import { ArrowRight, Sparkles, TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeTemplatesSection() {
  const featured = getFeaturedTemplates(4);
  const latest = getNewTemplates(4);
  const popular = getPopularTemplates(4);

  return (
    <section className="border-y-2 border-foreground bg-muted py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
              Templates library
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Browse, preview & download
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
              A separate design marketplace — landing pages, portfolios, SaaS kits, and startup templates
              with live preview, copy code, and instant ZIP downloads.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 gap-2">
            <Link href="/templates">
              Explore all templates <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold">Featured templates</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((t) => (
                <TemplateCard key={t.slug} template={t} variant="featured" />
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-sky-500" />
                <h3 className="font-bold">Latest templates</h3>
                <Link href="/templates/new" className="ml-auto text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {latest.map((t) => (
                  <TemplateCard key={t.slug} template={t} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-4 w-4 text-orange-500" />
                <h3 className="font-bold">Popular downloads</h3>
                <Link href="/templates/popular" className="ml-auto text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {popular.map((t) => (
                  <TemplateCard key={t.slug} template={t} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
