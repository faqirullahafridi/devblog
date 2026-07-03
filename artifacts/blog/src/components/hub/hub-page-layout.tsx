import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";
import { seoTitle } from "@/lib/site-config";
import { ChevronLeft } from "lucide-react";

export function HubPageLayout({
  title,
  description,
  backHref,
  backLabel,
  section,
  children,
  footer,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  section: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <SeoHead title={seoTitle(`${title} ${section}`)} description={description} />
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{section}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>
        </header>
        {children}
        <HubSeoIntro />
        {footer}
      </div>
    </PublicLayout>
  );
}

export function HubIndexLayout({
  title,
  description,
  section,
  children,
}: {
  title: string;
  description: string;
  section: string;
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <SeoHead title={seoTitle(title)} description={description} />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <header className="mb-10 text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">{section}</p>
          <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">{description}</p>
        </header>
        {children}
        <HubSeoIntro className="max-w-3xl mx-auto" />
      </div>
    </PublicLayout>
  );
}
