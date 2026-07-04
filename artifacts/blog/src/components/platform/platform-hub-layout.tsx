import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SeoHead } from "@/components/seo-head";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";
import { seoTitle } from "@/lib/site-config";

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
      <ContentShell width="wide" showAdSidebar className={className}>
        <PageHeader
          title={title}
          description={description}
          section={section}
          backHref={backHref}
          backLabel={backLabel}
        />
        {children}
        <HubSeoIntro />
      </ContentShell>
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
      className="group block rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md h-full"
    >
      {badge && <span className="text-xs font-medium text-primary">{badge}</span>}
      <h2 className="font-semibold mt-1 group-hover:text-primary transition-colors">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
    </Link>
  );
}
