import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { ChevronLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function AiHubLayout({
  title,
  description,
  backHref = "/ai",
  backLabel = "AI Hub",
  icon: Icon = Sparkles,
  accent = "text-primary",
  iconBg = "bg-primary/10 border-2 border-foreground",
  children,
  className,
  compact,
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
  compact?: boolean;
}) {
  return (
    <PublicLayout>
      <SeoHead title={`${title} — devblog`} description={description} />
      <div className={cn("container mx-auto px-4 py-8 md:py-10 max-w-6xl", className)}>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        <header
          className={cn(
            "relative overflow-hidden border-2 border-foreground bg-card brutal-shadow-sm mb-8",
            compact ? "p-5 md:p-6" : "p-6 md:p-8",
          )}
        >
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center", iconBg)}>
              <Icon className={cn("h-6 w-6", accent)} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                AI Assistant
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed text-sm md:text-base">
                {description}
              </p>
            </div>
          </div>
        </header>

        {children}
      </div>
    </PublicLayout>
  );
}
