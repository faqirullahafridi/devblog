import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { SITE_DESCRIPTION, SITE_NAME, seoTitle } from "@/lib/site-config";
import { HERO_IMAGE } from "@/lib/hero-image";
import { getHomeFeed } from "@/lib/api-extra";
import type { Post } from "@workspace/api-client-react";
import { HomeHero } from "@/components/home/home-hero";
import { HomeFeaturedSpotlight } from "@/components/home/home-featured-spotlight";
import { HomeRecentFeed } from "@/components/home/home-recent-feed";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";

const HomeTemplatesStrip = lazy(() =>
  import("@/components/home/home-templates-strip").then((m) => ({ default: m.HomeTemplatesStrip })),
);
const HomeDevHeadlines = lazy(() =>
  import("@/components/home/home-dev-headlines").then((m) => ({ default: m.HomeDevHeadlines })),
);

function SectionHeader({
  label,
  title,
  href,
  linkText = "View all",
}: {
  label: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1">{label}</p>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:underline shrink-0"
        >
          {linkText} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["posts", "home-feed"],
    queryFn: getHomeFeed,
    staleTime: 2 * 60_000,
  });

  const featuredPosts = (feed?.featured ?? []) as Post[];
  const recentPosts = (feed?.recent ?? []) as Post[];
  const popularPosts = (feed?.popular ?? []) as Post[];

  return (
    <PublicLayout>
      <SeoHead
        title={seoTitle("Developer knowledge hub")}
        description={SITE_DESCRIPTION}
        url={siteUrl("/")}
        image={HERO_IMAGE.og}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: siteUrl("/"),
          description: SITE_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <HomeHero />

      {/* Featured spotlight */}
      <section className="container mx-auto px-4 py-14 md:py-16">
        <SectionHeader label="Editor's pick" title="Featured this week" href="/search" />
        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 flex flex-col md:flex-row border-2 border-foreground bg-card overflow-hidden">
              <div className="w-full md:w-52 aspect-[16/10] md:aspect-[4/3] md:max-h-[180px] bg-muted animate-pulse border-b-2 md:border-b-0 md:border-r-2 border-foreground" />
              <div className="flex-1 p-6 space-y-3">
                <div className="h-4 w-24 bg-muted animate-pulse" />
                <div className="h-8 w-full bg-muted animate-pulse" />
                <div className="h-12 w-3/4 bg-muted animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 border-2 border-foreground bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <HomeFeaturedSpotlight posts={featuredPosts} />
        )}
      </section>

      {/* Main feed + sidebar */}
      <section className="border-y-2 border-foreground bg-muted/40">
        <div className="container mx-auto px-4 py-14 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] lg:gap-12">
            <div className="min-w-0">
              <SectionHeader label="Fresh reads" title="Latest articles" href="/search" />
              {isLoading ? (
                <div className="space-y-0 border-2 border-foreground">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-24 border-b-2 last:border-b-0 border-foreground bg-card animate-pulse" />
                  ))}
                </div>
              ) : (
                <HomeRecentFeed posts={recentPosts} />
              )}
            </div>
            <HomeSidebar popularPosts={popularPosts} />
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <HomeTemplatesStrip />
        <HomeDevHeadlines />
      </Suspense>

      <section className="container mx-auto px-4 py-14 max-w-4xl border-t">
        <HubSeoIntro path="/" />
      </section>
    </PublicLayout>
  );
}
