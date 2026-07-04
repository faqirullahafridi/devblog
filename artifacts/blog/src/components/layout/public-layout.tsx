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
import { PLATFORM_LINKS, CONTENT_LINKS } from "@/lib/nav-config";
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

const PRIMARY_HREFS = new Set(PRIMARY_NAV.map((item) => item.href));

const MORE_NAV = PLATFORM_LINKS.filter((item) => !PRIMARY_HREFS.has(item.href));

function NavLink({
  href,
  label,
  active,
  className,
  variant = "default",
}: {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  variant?: "default" | "strip";
}) {
  return (
    <PreloadLink
      href={href}
      className={cn(
        "font-medium whitespace-nowrap transition-colors",
        variant === "strip"
          ? cn(
              "rounded-none px-3 py-2.5 text-xs border-b-2",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )
          : cn(
              "rounded-md px-2 py-2 text-sm",
              active ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground",
            ),
        className,
      )}
    >
      {label}
    </PreloadLink>
  );
}

function MoreMenu({ align = "end", compact = false }: { align?: "start" | "end" | "center"; compact?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center gap-1 rounded-md font-medium text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "px-3 py-2.5 text-xs border-b-2 border-transparent" : "px-2.5 py-2 text-sm",
        )}
      >
        More
        <ChevronDown className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Platform</DropdownMenuLabel>
        {MORE_NAV.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Resources</DropdownMenuLabel>
        {CONTENT_LINKS.filter((c) => !PRIMARY_HREFS.has(c.href)).map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: categoriesRaw } = useListCategories();
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
  const [location] = useLocation();

  const isActive = (href: string) => location === href || location.startsWith(`${href}/`);

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background flex flex-col">
      <Analytics />
      <AdSenseScript />

      <header className="sticky top-0 z-[110] isolate w-full border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center">
            <div className="col-start-1 flex min-w-0 items-center gap-2 justify-self-start">
              <Suspense fallback={<div className="h-9 w-9 shrink-0 md:hidden" aria-hidden />}>
                <MobileNav categories={categories} />
              </Suspense>
              <PreloadLink href="/" className="flex shrink-0 items-center">
                <BrandLogo compact className="sm:hidden" />
                <BrandLogo className="hidden sm:flex" />
              </PreloadLink>
            </div>

            <nav
              className="col-start-2 hidden min-w-0 items-center justify-center gap-0.5 lg:flex"
              aria-label="Primary"
            >
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} active={isActive(item.href)} />
              ))}
              <MoreMenu />
            </nav>

            <div className="col-start-3 flex shrink-0 items-center justify-end gap-1 sm:gap-2 justify-self-end">
              <div className="hidden md:flex lg:hidden items-center">
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
                    <DropdownMenuSeparator />
                    {MORE_NAV.map((item) => (
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
        </div>

        {/* Tablet nav strip — full width, centered */}
        <nav
          className="hidden md:flex lg:hidden border-t border-border/60 bg-muted/30"
          aria-label="Primary tablet"
        >
          <div className="mx-auto flex w-full max-w-7xl justify-center px-4 sm:px-6">
            <div className="flex max-w-full items-stretch overflow-x-auto">
              {PRIMARY_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={isActive(item.href)}
                  variant="strip"
                />
              ))}
              <MoreMenu align="center" compact />
            </div>
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
