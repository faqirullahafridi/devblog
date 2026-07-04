import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListCategories } from "@workspace/api-client-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics, AdSenseScript } from "@/components/site-scripts";
import { PreloadLink } from "@/components/preload-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import { PAGE_LINKS, PLATFORM_LINKS, CONTENT_LINKS } from "@/lib/nav-config";
import { SiteAuthLinks } from "@/components/site-auth-links";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const MobileNav = lazy(() =>
  import("@/components/mobile-nav").then((m) => ({ default: m.MobileNav })),
);
const SiteFooter = lazy(() =>
  import("@/components/layout/site-footer").then((m) => ({ default: m.SiteFooter })),
);

const PRIMARY_NAV = [
  { href: "/search", label: "Articles" },
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
  { href: "/ai", label: "AI" },
  { href: "/jobs", label: "Jobs" },
  { href: "/api-sources", label: "APIs" },
] as const;

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: categoriesRaw } = useListCategories();
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const [location] = useLocation();

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background flex flex-col">
      <Analytics />
      <AdSenseScript />

      <header className="sticky top-0 z-[110] isolate w-full border-b border-border bg-background">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="relative z-20 flex min-w-0 shrink-0 items-center gap-2">
            <Suspense fallback={<div className="h-9 w-9 shrink-0 md:hidden" aria-hidden />}>
              <MobileNav categories={categories} />
            </Suspense>
            <PreloadLink href="/" className="flex min-w-0 shrink items-center">
              <BrandLogo compact className="sm:hidden" />
              <BrandLogo className="hidden sm:flex" />
            </PreloadLink>
          </div>

          <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center max-w-2xl" aria-label="Primary">
            {PRIMARY_NAV.map((item) => {
              const active = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <PreloadLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap",
                    active
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </PreloadLink>
              );
            })}
          </nav>

          <div className="relative z-20 flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden md:flex xl:hidden items-center">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  Browse
                  <ChevronDown className="h-3.5 w-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 max-h-[70vh] overflow-y-auto">
                  {PRIMARY_NAV.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <SiteAuthLinks />
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex gap-2 h-9">
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:hidden" asChild>
              <Link href="/search" aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Tablet nav strip */}
        <nav
          className="hidden md:flex xl:hidden border-t border-border/60 bg-muted/30 overflow-x-auto"
          aria-label="Primary tablet"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex items-stretch min-w-max">
            {PRIMARY_NAV.map((item) => {
              const active = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <PreloadLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </PreloadLink>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent outline-none">
                More <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Platform</DropdownMenuLabel>
                {PLATFORM_LINKS.filter((p) => !PRIMARY_NAV.some((n) => n.href === p.href)).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Resources</DropdownMenuLabel>
                {CONTENT_LINKS.filter((c) => !PRIMARY_NAV.some((n) => n.href === c.href)).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {categories.slice(0, 6).map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild>
                    <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {PAGE_LINKS.slice(0, 4).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>

      <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
      <CookieConsent />
    </div>
  );
}
