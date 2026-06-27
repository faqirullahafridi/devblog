import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListCategories } from "@workspace/api-client-react";
import { BrandLogo } from "@/components/brand-logo";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { CookieConsent } from "@/components/cookie-consent";
import { Analytics, AdSenseScript } from "@/components/site-scripts";
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
import { SiteFooter } from "@/components/layout/site-footer";

const PRIMARY_NAV = [
  { href: "/search", label: "Articles" },
  { href: "/templates", label: "Templates" },
  { href: "/tools", label: "Tools" },
  { href: "/learn", label: "Learn" },
  { href: "/ai", label: "AI" },
  { href: "/jobs", label: "Jobs" },
] as const;

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { data: categories } = useListCategories();

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-background flex flex-col">
      <Analytics />
      <AdSenseScript />

      <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background">
        {/* Top bar: brand + actions */}
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4 border-b-2 border-foreground">
          <div className="flex items-center gap-3 min-w-0">
            <MobileNav categories={categories} />
            <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity">
              <BrandLogo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex gap-2 font-bold">
              <Link href="/search">
                <Search className="h-4 w-4" />
                Search
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden" asChild>
              <Link href="/search" aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Desktop nav strip */}
        <nav className="hidden md:block bg-muted/50">
          <div className="container mx-auto flex items-stretch px-4">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground border-r-2 border-foreground last:border-r-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 px-4 py-3 text-xs font-black uppercase tracking-wider text-muted-foreground border-l-2 border-foreground hover:bg-card hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ml-auto">
                More
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider">Platform</DropdownMenuLabel>
                {PLATFORM_LINKS.filter((p) => !PRIMARY_NAV.some((n) => n.href === p.href)).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider">Resources</DropdownMenuLabel>
                {CONTENT_LINKS.filter((c) => !PRIMARY_NAV.some((n) => n.href === c.href)).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider">Blog categories</DropdownMenuLabel>
                {(categories ?? []).slice(0, 8).map((cat) => (
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
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}
