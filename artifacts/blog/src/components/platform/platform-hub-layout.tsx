import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";
import { seoTitle } from "@/lib/site-config";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlatformHubLayout({
  title,
  description,
  section,
  backHref = "/",
  backLabel = "Home",
  children,
  className,
}: {
  title: string;
  description: string;
  section: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <PublicLayout>
      <SeoHead title={seoTitle(title)} description={description} />
      <div className={cn("container mx-auto px-4 py-10 max-w-6xl", className)}>
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <header className="mb-8 border-2 border-foreground bg-card p-6 brutal-shadow-sm">
          <p className="text-xs font-black uppercase tracking-wider text-primary mb-2">{section}</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">{description}</p>
        </header>
        {children}
        <HubSeoIntro />
      </div>
    </PublicLayout>
  );
}

export function PlatformCardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function PlatformCard({
  href,
  title,
  description,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group block border-2 border-foreground bg-card p-5 brutal-shadow-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow"
    >
      {badge && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{badge}</span>
      )}
      <h2 className="font-semibold mt-1 group-hover:text-primary transition-colors">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
    </Link>
  );
}
