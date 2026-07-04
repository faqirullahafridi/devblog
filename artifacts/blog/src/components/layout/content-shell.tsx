import { ContentSidebar } from "@/components/layout/content-sidebar";
import { AdSlot } from "@/components/site-scripts";
import { cn } from "@/lib/utils";

type ContentShellProps = {
  children: React.ReactNode;
  /** Custom sidebar content (replaces default ad sidebar). */
  sidebar?: React.ReactNode;
  /** Sticky sidebar with AdSense on lg+ screens. */
  showAdSidebar?: boolean;
  /** Leaderboard ad above main grid (mobile + desktop). */
  showTopAd?: boolean;
  /** Max content width preset. */
  width?: "default" | "article" | "wide" | "full";
  className?: string;
  mainClassName?: string;
};

const WIDTH_CLASS = {
  default: "max-w-6xl",
  article: "max-w-7xl",
  wide: "max-w-[88rem]",
  full: "max-w-none",
} as const;

export function ContentShell({
  children,
  sidebar,
  showAdSidebar = false,
  showTopAd = false,
  width = "default",
  className,
  mainClassName,
}: ContentShellProps) {
  const hasSidebar = Boolean(sidebar) || showAdSidebar;

  return (
    <div className={cn("w-full", className)}>
      {showTopAd && (
        <div className="container mx-auto px-4 sm:px-6 pt-6 md:pt-8">
          <div className={cn("mx-auto", WIDTH_CLASS[width])}>
            <AdSlot variant="banner" className="mb-2" />
          </div>
        </div>
      )}

      <div
        className={cn(
          "container mx-auto w-full px-4 sm:px-6 py-8 md:py-12",
          WIDTH_CLASS[width],
        )}
      >
        <div
          className={cn(
            hasSidebar && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] xl:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:gap-12",
          )}
        >
          <div className={cn("min-w-0", mainClassName)}>{children}</div>

          {hasSidebar && (
            <aside className="hidden lg:block min-w-0">
              <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto overscroll-contain space-y-6 pb-6">
                {sidebar ?? <ContentSidebar />}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/** Two-column listing: main + sidebar (visible on md+). */
export function ListingShell({
  children,
  sidebar,
  className,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 md:py-12", className)}>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(240px,300px)] lg:gap-10">
        <div className="min-w-0 order-2 md:order-1">{children}</div>
        <aside className="min-w-0 order-1 md:order-2">
          <div className="md:sticky md:top-[4.5rem] space-y-6">{sidebar}</div>
        </aside>
      </div>
    </div>
  );
}
