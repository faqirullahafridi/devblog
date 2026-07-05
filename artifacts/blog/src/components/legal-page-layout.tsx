import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Link } from "wouter";

type Breadcrumb = { label: string; href?: string };

export function LegalPageLayout({
  title,
  lastUpdated,
  breadcrumbs,
  children,
}: {
  title: string;
  lastUpdated: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
}) {
  const crumbs = breadcrumbs ?? [{ label: "Home", href: "/" }, { label: title }];

  return (
    <PublicLayout>
      <ContentShell width="default" mainClassName="max-w-3xl mx-auto">
        <article>
          <PageHeader title={title} breadcrumbs={crumbs} className="mb-8 md:mb-10" />
          <p className="text-sm text-muted-foreground -mt-4 mb-8">Last updated: {lastUpdated}</p>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
            {children}
          </div>
          <p className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            See also:{" "}
            <Link href="/about" className="text-primary hover:underline">About</Link>
            {" · "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
            {" · "}
            <Link href="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link>
            {" · "}
            <Link href="/disclaimer" className="text-primary hover:underline">Disclaimer</Link>
            {" · "}
            <Link href="/contact" className="text-primary hover:underline">Contact</Link>
          </p>
        </article>
      </ContentShell>
    </PublicLayout>
  );
}
