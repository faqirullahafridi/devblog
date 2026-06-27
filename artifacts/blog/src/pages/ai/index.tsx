import { Link } from "wouter";
import { AiHubLayout } from "@/components/platform/ai-layout";
import { AI_MODES, AI_SPECIAL_MODES } from "@/components/platform/ai-config";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AiIndexPage() {
  return (
    <AiHubLayout
      title="Developer Assistant"
      description="Explain, debug, generate, and convert code — built for developers. Pick a mode and start a conversation."
      backHref="/"
      backLabel="Home"
      icon={Sparkles}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AI_MODES.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1", mode.iconBg)}>
                <mode.icon className={cn("h-5 w-5", mode.accent)} />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-primary -translate-x-1" />
            </div>
            <h2 className="font-semibold mt-4 group-hover:text-primary transition-colors">{mode.label}</h2>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed flex-1">{mode.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold">Specialized modes</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {AI_SPECIAL_MODES.map((mode) => (
            <Link
              key={mode.href}
              href={mode.href}
              className="group flex items-center gap-4 rounded-xl border bg-muted/20 px-4 py-3.5 transition-colors hover:bg-muted/40 hover:border-primary/25"
            >
              <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1", mode.iconBg)}>
                <mode.icon className={cn("h-4 w-4", mode.accent)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{mode.label}</p>
                <p className="text-xs text-muted-foreground truncate">{mode.description}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </AiHubLayout>
  );
}
