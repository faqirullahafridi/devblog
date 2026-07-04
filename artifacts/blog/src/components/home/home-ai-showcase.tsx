import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { VISIBLE_AI_MODES, type AiModeConfig } from "@/components/platform/ai-config";
import { cn } from "@/lib/utils";

/** Top modes for mobile — Chat + 2 essentials, no orphan grid cell. */
const MOBILE_MODES = VISIBLE_AI_MODES.slice(0, 3);

function ModeCard({
  mode,
  highlight = false,
  className,
}: {
  mode: AiModeConfig;
  highlight?: boolean;
  className?: string;
}) {
  const Icon = mode.icon;
  return (
    <Link
      href={mode.href}
      className={cn(
        "group relative flex h-full min-h-[6.5rem] sm:min-h-[7.5rem] flex-col rounded-xl border p-3.5 sm:p-4",
        highlight
          ? "border-primary/35 bg-gradient-to-br from-primary/[0.07] to-transparent"
          : "border-border/70 bg-muted/20 hover:border-primary/30",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg",
            highlight ? "bg-primary/15" : "bg-background ring-1 ring-border/60",
          )}
        >
          <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", mode.accent)} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-sm font-semibold leading-tight group-hover:text-primary">{mode.label}</h3>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {mode.description}
          </p>
        </div>
      </div>
      <ArrowRight className="absolute bottom-3 right-3 h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary" />
    </Link>
  );
}

export function HomeAiShowcase() {
  const [chat, ...others] = VISIBLE_AI_MODES;
  const lastIndex = others.length - 1;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5 sm:mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI Studio
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="sm:hidden">AI modes for dev work</span>
            <span className="hidden sm:inline">Six modes, one assistant</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
            <span className="sm:hidden">Chat, debug, and explain — tap below for more.</span>
            <span className="hidden sm:inline">Pick a mode tuned for your task — from debugging to API design.</span>
          </p>
        </div>
        <Link
          href="/ai/chat"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shrink-0 w-full sm:w-auto"
        >
          Open chat
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mobile: 4 popular modes only */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden perf-card-grid">
        {MOBILE_MODES.map((mode, i) => (
          <ModeCard key={mode.id} mode={mode} highlight={i === 0} className={i === 0 ? "col-span-2" : undefined} />
        ))}
      </div>
      <p className="mt-3 text-center sm:hidden">
        <Link href="/ai" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all 6 modes
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </p>

      {/* Tablet / desktop: full grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 perf-card-grid">
        <ModeCard mode={chat} highlight />
        {others.map((mode, i) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            className={i === lastIndex ? "sm:col-span-2 lg:col-span-1" : undefined}
          />
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground hidden sm:block">
        Free to use ·{" "}
        <Link href="/ai" className="font-medium text-primary hover:underline">
          Learn more about AI Studio
        </Link>
      </p>
    </div>
  );
}
