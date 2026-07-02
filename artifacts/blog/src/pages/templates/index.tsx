import { Link } from "wouter";
import { SITE_NAME } from "@/lib/site-config";
import { TemplateCard } from "@/components/templates/template-card";
import { TemplatesLayout } from "@/components/templates/templates-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  getTrendingTemplates,
  getNewTemplates,
  getPopularTemplates,
  getTemplateCategoryHref,
} from "@/lib/templates-config";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { Search, LayoutTemplate, TrendingUp, Sparkles, Flame, ArrowRight } from "lucide-react";
import { useState } from "react";

export default function TemplatesIndexPage() {
  const [query, setQuery] = useState("");
  const trending = getTrendingTemplates(6);
  const newest = getNewTemplates(6);
  const popular = getPopularTemplates(6);

  return (
    <TemplatesLayout wide>
      <SeoHead
        title="Templates — Free Landing Pages, Portfolios & SaaS Source Code"
        description="Professional template library. Preview, copy code, and download 100+ free HTML, React, and Tailwind landing pages and portfolio templates."
        url={siteUrl("/templates")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${SITE_NAME} Templates`,
          description: "Free website template library with source code downloads",
          url: siteUrl("/templates"),
          numberOfItems: TEMPLATES.length,
        }}
      />

      {/* Premium hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(120,119,198,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_100%_50%,rgba(56,189,248,0.08),transparent)]" />
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
              <LayoutTemplate className="h-3.5 w-3.5" />
              {TEMPLATES.length}+ templates · Free source code
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl md:leading-[1.08]">
              Design templates for{" "}
              <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                builders who ship
              </span>
            </h1>
            <p className="mt-5 text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              A dedicated template library — not the blog. Browse premium landing pages, portfolios,
              and SaaS kits. Live preview, copy code, download ZIP.
            </p>
            <form
              className="mt-8 flex max-w-lg mx-auto gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) window.location.href = `/templates/search?q=${encodeURIComponent(query.trim())}`;
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search landing page, react, saas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-12 rounded-xl border-border/60 bg-background/80 backdrop-blur"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-xl px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                Search
              </Button>
            </form>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                { href: "/templates/trending", label: "Trending", icon: TrendingUp },
                { href: "/templates/new", label: "Latest", icon: Sparkles },
                { href: "/templates/popular", label: "Popular", icon: Flame },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium backdrop-blur transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-14">
        {/* Categories grid */}
        <section>
          <h2 className="text-xl font-bold mb-6">Categories</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATE_CATEGORIES.map((cat) => {
              const count = TEMPLATES.filter((t) => t.categorySlug === cat.slug).length;
              return (
                <Link
                  key={cat.slug}
                  href={getTemplateCategoryHref(cat.slug)}
                  className="rounded-xl border border-border/60 bg-card p-5 block"
                >
                  <h3 className="font-semibold">{cat.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{cat.description}</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-3">
                    {count} templates
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {[
          { title: "Trending", items: trending, href: "/templates/trending", icon: TrendingUp, color: "text-amber-500" },
          { title: "Latest", items: newest, href: "/templates/new", icon: Sparkles, color: "text-sky-500" },
          { title: "Popular", items: popular, href: "/templates/popular", icon: Flame, color: "text-orange-500" },
        ].map(({ title, items, href, icon: Icon, color }) => (
          <section key={title}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color}`} /> {title}
              </h2>
              <Link href={href} className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((t) => (
                <TemplateCard key={t.slug} template={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </TemplatesLayout>
  );
}
