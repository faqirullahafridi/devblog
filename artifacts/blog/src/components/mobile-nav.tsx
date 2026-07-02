import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MobileDrawer, MobileDrawerTitle } from "@/components/mobile-drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Category } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { forceUnlockBodyScroll } from "@/lib/body-scroll-lock";
import { MORE_PAGE_LINKS, PRIMARY_PAGE_LINKS, PLATFORM_LINKS } from "@/lib/nav-config";
import { TOOLS, getToolHref } from "@/lib/tools-config";
import { REFS, getRefHref } from "@/lib/refs-config";
import { LEARN_PATHS, getLearnHref } from "@/lib/learn-config";
import { INTERVIEW_TOPICS, getInterviewHref } from "@/lib/interview-config";
import { TEMPLATE_CATEGORIES, getTemplateCategoryHref } from "@/lib/templates-config";
import { getSiteUser } from "@/lib/api-extra";

function MobileAuthLinks({ onNavigate }: { onNavigate: () => void }) {
  const { data } = useQuery({
    queryKey: ["auth", "site-user"],
    queryFn: getSiteUser,
    staleTime: 60_000,
  });

  if (data?.authenticated && data.user) {
    return (
      <NavSection title="Account">
        <NavLink
          href={`/community/profile/${data.user.username}`}
          label={data.user.displayName || data.user.username}
          onNavigate={onNavigate}
        />
      </NavSection>
    );
  }

  return (
    <div className="flex gap-2 px-3">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="flex-1 font-bold border-foreground brutal-shadow-sm"
      >
        <Link href="/login" onClick={onNavigate}>Sign in</Link>
      </Button>
      <Button
        asChild
        size="sm"
        className="flex-1 font-bold border-2 border-foreground bg-primary text-primary-foreground brutal-shadow-sm hover:bg-primary/90"
      >
        <Link href="/signup" onClick={onNavigate}>Sign up</Link>
      </Button>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  const [location] = useLocation();
  const active = location === href || (href !== "/" && location.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "block border-2 border-transparent px-3 py-2.5 text-sm font-bold transition-colors hover:border-foreground hover:bg-muted hover:text-foreground",
        active ? "border-foreground bg-muted text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function MobileNav({ categories }: { categories?: Category[] }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => {
    setMoreOpen(false);
    setOpen(false);
    forceUnlockBodyScroll();
    document.documentElement.style.overflow = "";
  };

  const toggleMenu = () => {
    setOpen((v) => {
      if (v) {
        forceUnlockBodyScroll();
        document.documentElement.style.overflow = "";
      }
      return !v;
    });
  };

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [location]);

  useEffect(() => {
    return () => forceUnlockBodyScroll();
  }, []);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative z-20 shrink-0 touch-manipulation md:hidden border-2 border-transparent hover:border-foreground"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <MobileDrawer open={open} onClose={closeMenu}>
        <div id="mobile-nav-drawer" className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4 shrink-0">
            <MobileDrawerTitle>Menu</MobileDrawerTitle>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-6 touch-pan-y [-webkit-overflow-scrolling:touch]">
            <NavLink href="/" label="Home" onNavigate={closeMenu} />

            <NavSection title="Platform">
              {PLATFORM_LINKS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} onNavigate={closeMenu} />
              ))}
            </NavSection>

            <NavSection title="Pages">
              {PRIMARY_PAGE_LINKS.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} onNavigate={closeMenu} />
              ))}
              <Collapsible open={moreOpen} onOpenChange={setMoreOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between border-2 border-transparent px-3 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-foreground hover:bg-muted hover:text-foreground">
                  <span>More</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform duration-200", moreOpen && "rotate-180")}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden">
                  <div className="mt-0.5 space-y-0.5 border-l-2 border-foreground ml-3 pl-2">
                    {MORE_PAGE_LINKS.map((item) => (
                      <NavLink key={item.href} href={item.href} label={item.label} onNavigate={closeMenu} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </NavSection>

            <NavSection title="Blogs">
              {categories && categories.length > 0 ? (
                categories.map((c) => (
                  <NavLink
                    key={c.id}
                    href={`/category/${c.slug}`}
                    label={c.name}
                    onNavigate={closeMenu}
                  />
                ))
              ) : (
                <p className="px-3 py-2 text-sm text-muted-foreground">No categories yet</p>
              )}
            </NavSection>

            <NavSection title="Templates">
              <NavLink href="/templates" label="Browse all" onNavigate={closeMenu} />
              <NavLink href="/templates/trending" label="Trending" onNavigate={closeMenu} />
              <NavLink href="/templates/new" label="Latest" onNavigate={closeMenu} />
              <NavLink href="/templates/popular" label="Popular" onNavigate={closeMenu} />
              {TEMPLATE_CATEGORIES.map((cat) => (
                <NavLink
                  key={cat.slug}
                  href={getTemplateCategoryHref(cat.slug)}
                  label={cat.title}
                  onNavigate={closeMenu}
                />
              ))}
            </NavSection>

            <NavSection title="Tools">
              <NavLink href="/tools" label="All tools" onNavigate={closeMenu} />
              {TOOLS.map((tool) => (
                <NavLink
                  key={tool.slug}
                  href={getToolHref(tool.slug)}
                  label={tool.name}
                  onNavigate={closeMenu}
                />
              ))}
            </NavSection>

            <NavSection title="Refs">
              <NavLink href="/refs" label="All references" onNavigate={closeMenu} />
              {REFS.map((ref) => (
                <NavLink
                  key={ref.slug}
                  href={getRefHref(ref.slug)}
                  label={ref.name}
                  onNavigate={closeMenu}
                />
              ))}
            </NavSection>

            <NavSection title="Learn">
              <NavLink href="/learn" label="All paths" onNavigate={closeMenu} />
              {LEARN_PATHS.map((path) => (
                <NavLink
                  key={path.slug}
                  href={getLearnHref(path.slug)}
                  label={path.title}
                  onNavigate={closeMenu}
                />
              ))}
            </NavSection>

            <NavSection title="Snippets">
              <NavLink href="/snippets" label="All snippets" onNavigate={closeMenu} />
            </NavSection>

            <NavSection title="Interview">
              <NavLink href="/interview" label="All topics" onNavigate={closeMenu} />
              {INTERVIEW_TOPICS.map((t) => (
                <NavLink
                  key={t.slug}
                  href={getInterviewHref(t.slug)}
                  label={t.title}
                  onNavigate={closeMenu}
                />
              ))}
            </NavSection>

            <NavLink href="/resources" label="Resources" onNavigate={closeMenu} />
            <NavLink href="/ides" label="IDEs & Editors" onNavigate={closeMenu} />

            <MobileAuthLinks onNavigate={closeMenu} />
          </nav>
        </div>
      </MobileDrawer>
    </>
  );
}
