import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";
import { getAiMode } from "@/components/platform/ai-config";
import { ArrowLeft, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiModeSwitcher } from "@/components/platform/ai-mode-switcher";

function AiAmbientBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-primary/15 blur-[100px]" />
      <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-muted/40 blur-[80px]" />
    </div>
  );
}

export function AiStudioShell({
  mode,
  children,
}: {
  mode: string;
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const meta = getAiMode(mode);
  const activeHref = location.startsWith("/ai/") ? location.split("?")[0] : meta.href;

  return (
    <PublicLayout>
      <SeoHead title={seoTitle(`${meta.label} AI`)} description={meta.description} />
      <div className="relative flex min-w-0 flex-col overflow-x-clip">
        <AiAmbientBg />

        <div className="relative z-10 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto max-w-[min(100%,1600px)] min-w-0 px-4 py-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Link
                href="/ai"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground sm:w-auto sm:px-3 sm:gap-1.5"
                aria-label="Back to AI Studio"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-semibold">Studio</span>
              </Link>
              <AiModeSwitcher activeHref={activeHref} />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full min-w-0 max-w-[min(100%,1600px)] px-2 pb-24 pt-3 sm:px-4 sm:pb-8 sm:pt-5">
          {children}
        </div>
      </div>
    </PublicLayout>
  );
}

export function AiLandingShell({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <div className="relative overflow-hidden">
        <AiAmbientBg />
        <div className="relative z-10">{children}</div>
      </div>
    </PublicLayout>
  );
}

export function AiHubLayout({
  title,
  description,
  backHref = "/ai",
  backLabel = "AI Hub",
  icon: Icon = Sparkles,
  accent = "text-primary",
  iconBg = "bg-primary/10",
  children,
  className,
}: {
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  icon?: LucideIcon;
  accent?: string;
  iconBg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AiLandingShell>
      <SeoHead title={seoTitle(title)} description={description} />
      <div className={cn("container mx-auto max-w-6xl px-4 py-10 md:py-14", className)}>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
        <header className="mb-12 max-w-3xl">
          <div className={cn("mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 ring-border/50", iconBg)}>
            <Icon className={cn("h-6 w-6", accent)} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{description}</p>
        </header>
        {children}
      </div>
    </AiLandingShell>
  );
}

/** @deprecated use AiStudioShell */
export const AiChatLayout = AiStudioShell;
