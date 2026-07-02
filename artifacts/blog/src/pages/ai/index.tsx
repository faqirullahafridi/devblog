import { Link } from "wouter";
import { SeoHead } from "@/components/seo-head";
import { SITE_NAME, seoTitle } from "@/lib/site-config";
import { AiLandingShell } from "@/components/platform/ai-layout";
import { AI_MODES, AI_SPECIAL_MODES } from "@/components/platform/ai-config";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";

const ALL_MODES = [...AI_MODES, ...AI_SPECIAL_MODES];

export default function AiIndexPage() {
  return (
    <AiLandingShell>
      <SeoHead
        title={seoTitle("AI Studio")}
        description="Explain, debug, generate, and convert code with a developer-tuned AI assistant."
      />

      {/* Hero */}
      <section className="border-b border-border/50">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Studio
            </div>
            <h1 className="text-[clamp(2.25rem,6vw,4rem)] font-extrabold tracking-tight leading-[1.05]">
              Ask anything about
              <span className="block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                your code.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Nine specialized modes — from debugging stack traces to designing REST APIs. Paste a snippet, pick a
              mode, get a clear answer.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-8 shadow-lg shadow-primary/20">
                <Link href="/ai/chat">
                  <MessageSquare className="h-4 w-4" />
                  Open chat
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-8">
                <Link href="/ai/debug">Debug something</Link>
              </Button>
            </div>
          </div>

          {/* Preview mock */}
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="rounded-2xl border border-border/60 bg-card/90 p-1 shadow-2xl shadow-primary/5 backdrop-blur-sm ring-1 ring-black/5">
              <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs text-muted-foreground">{SITE_NAME} AI · Chat mode</span>
              </div>
              <div className="space-y-4 p-5 text-sm">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
                  How do I structure a REST API for a blog with tags and comments?
                </div>
                <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-border/50 bg-muted/50 px-4 py-3 text-foreground">
                  Start with resource-based routes: <code className="text-primary">/posts</code>,{" "}
                  <code className="text-primary">/tags</code>, nested{" "}
                  <code className="text-primary">/posts/:id/comments</code>…
                </div>
              </div>
              <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
                <span className="flex-1 text-xs text-muted-foreground">Ask anything about code…</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl">
        <HubSeoIntro path="/ai" />
      </section>

      {/* Mode bento */}
      <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pick your mode</h2>
          <p className="mt-2 text-muted-foreground">Each mode tunes the assistant for a different job.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_MODES.map((mode, i) => {
            const featured = i === 0;
            return (
              <Link
                key={mode.href}
                href={mode.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                  featured && "sm:col-span-2 lg:row-span-2 lg:p-8",
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex items-center justify-center rounded-xl ring-1 ring-border/40",
                    mode.iconBg,
                    featured ? "h-14 w-14" : "h-11 w-11",
                  )}
                >
                  <mode.icon className={cn(featured ? "h-7 w-7" : "h-5 w-5", mode.accent)} />
                </div>
                <h3 className={cn("font-bold group-hover:text-primary transition-colors", featured ? "text-xl" : "text-base")}>
                  {mode.label}
                </h3>
                <p className={cn("mt-2 text-muted-foreground leading-relaxed", featured ? "text-sm max-w-md" : "text-xs line-clamp-2")}>
                  {mode.description}
                </p>
                {featured && (
                  <p className="mt-4 text-xs text-muted-foreground/80 italic">“{mode.prompts[0]}”</p>
                )}
                <ArrowRight className="absolute bottom-5 right-5 h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>
    </AiLandingShell>
  );
}
