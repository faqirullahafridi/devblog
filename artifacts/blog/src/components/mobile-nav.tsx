import { useEffect, useMemo, useRef, useState, lazy, Suspense, startTransition } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreloadLink } from "@/components/preload-link";
import { MobileDrawer, MobileDrawerTitle, releaseMobileDrawerFocus } from "@/components/mobile-drawer";
import type { Category } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV } from "@/lib/nav-config";

const MobileNavExploreSections = lazy(() =>
  import("@/components/mobile-nav-explore").then((m) => ({
    default: m.MobileNavExploreSections,
  })),
);

type MobileNavProps = {
  categories?: Category[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function DrawerAuthBar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex gap-2 border-b border-border bg-muted/30 px-4 py-3 shrink-0">
      <Button asChild variant="outline" size="sm" className="flex-1 h-10 font-semibold">
        <Link
          href="/login"
          onClick={() => {
            releaseMobileDrawerFocus();
            onNavigate();
          }}
        >
          Sign in
        </Link>
      </Button>
      <Button asChild size="sm" className="flex-1 h-10 font-semibold">
        <Link
          href="/signup"
          onClick={() => {
            releaseMobileDrawerFocus();
            onNavigate();
          }}
        >
          Sign up
        </Link>
      </Button>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
  active,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
  active: boolean;
}) {
  return (
    <PreloadLink
      href={href}
      onClick={() => {
        releaseMobileDrawerFocus();
        onNavigate();
      }}
      className={cn(
        "block rounded-lg px-3 py-3.5 text-sm font-medium touch-manipulation",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-foreground hover:bg-muted/60",
      )}
    >
      {label}
    </PreloadLink>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function MobileNav({ categories, open: controlledOpen, onOpenChange }: MobileNavProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [location] = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isActive = useMemo(
    () => (href: string) => location === href || (href !== "/" && location.startsWith(href)),
    [location],
  );

  const closeMenu = (returnFocus = false) => {
    releaseMobileDrawerFocus(returnFocus ? menuButtonRef.current : null);
    startTransition(() => setOpen(false));
  };

  const toggleMenu = () => {
    if (open) {
      closeMenu(true);
      return;
    }
    startTransition(() => setOpen(true));
  };

  useEffect(() => {
    releaseMobileDrawerFocus();
    startTransition(() => setOpen(false));
  }, [location, setOpen]);

  return (
    <>
      <Button
        ref={menuButtonRef}
        type="button"
        variant="ghost"
        size="icon"
        className="relative z-[120] shrink-0 touch-manipulation md:hidden h-9 w-9"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={(e) => {
          e.stopPropagation();
          toggleMenu();
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <MobileDrawer open={open} onClose={() => closeMenu(true)}>
        <div className="flex h-full min-h-0 flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
            <MobileDrawerTitle>Browse</MobileDrawerTitle>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              aria-label="Close menu"
              onClick={() => closeMenu(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <DrawerAuthBar onNavigate={() => closeMenu()} />

          <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-5 touch-pan-y [-webkit-overflow-scrolling:touch]">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/search"
                onClick={() => {
                  releaseMobileDrawerFocus();
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm font-semibold hover:bg-muted touch-manipulation"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
              <Link
                href="/"
                onClick={() => {
                  releaseMobileDrawerFocus();
                  closeMenu();
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm font-semibold hover:bg-muted touch-manipulation"
              >
                Home
              </Link>
            </div>

            <NavSection title="Main">
              <div className="grid grid-cols-2 gap-1">
                {PRIMARY_NAV.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    onNavigate={() => closeMenu()}
                    active={isActive(item.href)}
                  />
                ))}
              </div>
            </NavSection>

            {open && (
              <Suspense fallback={null}>
                <MobileNavExploreSections categories={categories} onNavigate={() => closeMenu()} />
              </Suspense>
            )}
          </nav>
        </div>
      </MobileDrawer>
    </>
  );
}
