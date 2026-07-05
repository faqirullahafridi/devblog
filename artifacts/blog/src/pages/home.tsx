import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { PreloadLink } from "@/components/preload-link";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { SITE_NAME, seoTitle } from "@/lib/site-config";
import { getHomeFeed } from "@/lib/api-extra";
import type { Post } from "@workspace/api-client-react";
import { HomeHero } from "@/components/home/home-hero";
import { HomeAiShowcase } from "@/components/home/home-ai-showcase";
import { HomeFeaturedSpotlight } from "@/components/home/home-featured-spotlight";
import { HomeRecentFeed } from "@/components/home/home-recent-feed";
import {
  HomeSidebar,
  HomeNewsletterCard,
  HomePopularCard,
} from "@/components/home/home-sidebar";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { AdSlot } from "@/components/site-scripts";
import { BookOpen, Layers, Wrench } from "lucide-react";

const HomeTemplatesStrip = lazy(() =>
  import("@/components/home/home-templates-strip").then((m) => ({ default: m.HomeTemplatesStrip })),
);
const HomeDevHeadlines = lazy(() =>
  import("@/components/home/home-dev-headlines").then((m) => ({ default: m.HomeDevHeadlines })),
);

const SECONDARY_LINKS = [
  { href: "/search", label: "Articles", icon: BookOpen },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/templates", label: "Templates", icon: Layers },
] as const;

function FeaturedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="aspect-[2/1] bg-muted animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-7 w-full bg-muted animate-pulse rounded" />
          <div className="h-12 w-4/5 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  );
}

function RecentSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

const HOME_DESCRIPTION =
  "AI-powered developer hub — debug, explain, and generate code with nine specialized modes, plus articles, tools, and templates on TechVentry.";

export default function Home() {
  const { data: feed, isLoading } = useQuery({
    queryKey: ["posts", "home-feed"],
    queryFn: getHomeFeed,
    staleTime: 5 * 60_000,
  });

  const featuredPosts = (feed?.featured ?? []) as Post[];
  const recentPosts = (feed?.recent ?? []) as Post[];
  const popularPosts = (feed?.popular ?? []) as Post[];

  return (
    <>
      <SeoHead
        title={seoTitle("AI Developer Hub")}
        description={HOME_DESCRIPTION}
        url={siteUrl("/")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: siteUrl("/"),
          description: HOME_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl("/search")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      <HomeHero />

      {/* AI modes — overlaps hero */}
      <section className="relative z-10 -mt-16 sm:-mt-20 mb-4">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 lg:p-7 shadow-md ring-1 ring-black/[0.03]">
            <HomeAiShowcase />
          </div>
        </div>
      </section>

      {/* Mobile newsletter — high on the page */}
      <div className="lg:hidden container mx-auto max-w-7xl px-4 sm:px-6 pb-6">
        <HomeNewsletterCard compact />
      </div>

      {/* Secondary nav strip */}
      <div className="border-y border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3" aria-label="More on TechVentry">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Also explore</span>
            {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => (
              <PreloadLink
                key={href}
                href={href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </PreloadLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Blog & resources */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12 perf-defer">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 xl:gap-12">
          <div className="min-w-0 space-y-12 sm:space-y-14">
            <section>
              <HomeSectionHeader
                label="From the blog"
                title="Featured articles"
                description="Deep dives and practical guides from the TechVentry team."
                href="/search"
              />
              {isLoading ? <FeaturedSkeleton /> : <HomeFeaturedSpotlight posts={featuredPosts} />}
            </section>

            <div className="lg:hidden">
              <AdSlot variant="banner" />
            </div>

            <section>
              <HomeSectionHeader
                label="Fresh reads"
                title="Latest articles"
                href="/search"
              />
              {isLoading ? <RecentSkeleton /> : <HomeRecentFeed posts={recentPosts} />}
            </section>

            <div className="lg:hidden">
              <HomePopularCard popularPosts={popularPosts} />
            </div>

            <Suspense fallback={null}>
              <HomeTemplatesStrip embedded />
              <HomeDevHeadlines embedded />
            </Suspense>
          </div>

          <div className="hidden lg:block min-w-0">
            <div className="sticky top-[4.5rem] space-y-5 max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain pb-4">
              <HomeSidebar popularPosts={popularPosts} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
