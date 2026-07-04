import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bug,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";
import { SITE_NAME } from "@/lib/site-config";

const PROMPT_CHIPS = [
  { label: "Debug my code", href: "/ai/debug", icon: Bug },
  { label: "Explain this snippet", href: "/ai/explain", icon: Lightbulb },
  { label: "Generate a component", href: "/ai/generate", icon: Sparkles },
  { label: "Optimize performance", href: "/ai/optimize", icon: Zap },
] as const;

const STATS = [
  { value: "9", label: "AI modes" },
  { value: "Free", label: "to start" },
  { value: "Dev", label: "tuned prompts" },
] as const;

export function HomeHero() {
  return (
    <section className="home-ai-hero relative overflow-hidden text-white">
      <div className="home-ai-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="home-ai-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 pt-12 pb-28 sm:pt-16 sm:pb-32 lg:pt-20 lg:pb-36">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
          {/* Copy */}
          <div className="min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {SITE_NAME} AI Studio
            </div>

            <h1 className="text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight text-balance">
              Your AI copilot for{" "}
              <span className="bg-gradient-to-r from-primary via-orange-300 to-amber-200 bg-clip-text text-transparent">
                real developer work
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-lg mx-auto lg:mx-0 text-pretty">
              Debug stack traces, explain unfamiliar code, generate components, and design APIs — paste a snippet, pick a mode, ship faster.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-8 shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              >
                <Link href="/ai/chat">
                  <MessageSquare className="h-4 w-4" />
                  Start chatting
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
              >
                <Link href="/ai">Explore AI modes</Link>
              </Button>
            </div>

            {/* Prompt chips */}
            <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
              {PROMPT_CHIPS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:border-primary/40"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <dl className="mt-10 flex items-center justify-center lg:justify-start gap-8 sm:gap-10">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center lg:text-left">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
                  <dd className="text-xs text-white/50 mt-0.5">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Chat preview */}
          <div className="min-w-0 lg:pl-4">
            <Link
              href="/ai/chat"
              className="group block rounded-2xl border border-white/10 bg-white/[0.06] p-1 shadow-xl shadow-black/30 ring-1 ring-white/10"
            >
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 text-xs text-white/45 font-mono">{SITE_NAME} · Debug mode</span>
              </div>

              <div className="space-y-3 p-4 sm:p-5 text-sm">
                <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground text-[0.8125rem] sm:text-sm leading-relaxed">
                  Why does this React hook re-run on every render?
                  <pre className="mt-2 rounded-lg bg-black/20 p-2.5 text-[0.7rem] sm:text-xs font-mono overflow-x-auto text-left">
{`useEffect(() => {
  fetchData(filters);
}, [filters]);`}
                  </pre>
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-white/85 text-[0.8125rem] sm:text-sm leading-relaxed">
                  <span className="text-primary font-medium">Root cause:</span>{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 rounded">filters</code> is a new object each render. Memoize it with{" "}
                  <code className="font-mono text-xs bg-white/10 px-1 rounded">useMemo</code> or pass primitives as deps.
                </div>
              </div>

              <div className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="flex-1 text-xs text-white/40 group-hover:text-white/55">
                  Paste code or describe your problem…
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
