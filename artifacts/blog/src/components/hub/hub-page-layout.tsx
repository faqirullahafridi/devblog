import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { PageHeader } from "@/components/layout/page-header";
import { SeoHead } from "@/components/seo-head";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";
import { seoTitle } from "@/lib/site-config";

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
      <ContentShell width="default" showAdSidebar>
        <PageHeader
          title={title}
          description={description}
          section={section}
          backHref={backHref}
          backLabel={backLabel}
        />
        {children}
        <HubSeoIntro />
        {footer}
      </ContentShell>
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
      <ContentShell width="wide" showAdSidebar showTopAd>
        <PageHeader title={title} description={description} section={section} align="center" />
        {children}
        <HubSeoIntro className="max-w-4xl mx-auto" />
      </ContentShell>
    </PublicLayout>
  );
}
