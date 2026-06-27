import { useMemo } from "react";
import { Link } from "wouter";
import { TemplatesLayout } from "@/components/templates/templates-layout";
import { SeoHead } from "@/components/seo-head";
import { TemplateCard } from "@/components/templates/template-card";
import { searchTemplates } from "@/lib/templates-config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft } from "lucide-react";

export default function TemplatesSearchPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const q = params.get("q") ?? "";
  const results = useMemo(() => searchTemplates(q), [q]);

  return (
    <TemplatesLayout wide>
      <SeoHead
        title={q ? `Search: ${q} — Templates` : "Search Templates — Free Source Code Library"}
        description="Search our template library by keyword, technology stack, or category."
        url={`/templates/search${q ? `?q=${encodeURIComponent(q)}` : ""}`}
      />
      <div className="container mx-auto px-4 py-10">
        <Link href="/templates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" /> All templates
        </Link>
        <header className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight">Search templates</h1>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const query = String(fd.get("q") ?? "").trim();
              window.location.href = query ? `/templates/search?q=${encodeURIComponent(query)}` : "/templates/search";
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q} placeholder="react saas landing page..." className="pl-9" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </header>
        {q && (
          <p className="text-sm text-muted-foreground mb-6">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      </div>
    </TemplatesLayout>
  );
}
