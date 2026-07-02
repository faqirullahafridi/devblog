import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { TOOLS, getToolHref } from "@/lib/tools-config";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";

export default function ToolsIndexPage() {
  return (
    <PublicLayout>
      <SeoHead
        title={seoTitle("Developer Tools")}
        description="Free online tools for developers: JSON formatter, JWT decoder, regex tester, and more."
      />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight">Developer Tools</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Handy utilities for everyday development. Everything runs in your browser — nothing is sent to a server.
            Each tool includes a full guide explaining concepts, usage, and common mistakes.
          </p>
        </header>
        <HubSeoIntro path="/tools" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={getToolHref(tool.slug)}
                className="group rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{tool.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
