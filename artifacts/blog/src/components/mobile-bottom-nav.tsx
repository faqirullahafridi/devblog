import { useLocation } from "wouter";
import { BookOpen, Bot, Home, Menu, Wrench } from "lucide-react";
import { PreloadLink } from "@/components/preload-link";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  { href: "/search", label: "Articles", icon: BookOpen, match: (path: string) => path === "/search" || path.startsWith("/category/") || path.startsWith("/post/") || path.startsWith("/tag/") },
  { href: "/tools", label: "Tools", icon: Wrench, match: (path: string) => path === "/tools" || path.startsWith("/tools/") },
  { href: "/ai", label: "AI", icon: Bot, match: (path: string) => path === "/ai" || path.startsWith("/ai/") },
] as const;

type MobileBottomNavProps = {
  onOpenMenu: () => void;
  menuOpen: boolean;
};

export function MobileBottomNav({ onOpenMenu, menuOpen }: MobileBottomNavProps) {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[100] border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Quick navigation"
    >
      <div className="mx-auto flex h-14 max-w-lg items-stretch justify-around px-1">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(location);
          return (
            <PreloadLink
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors touch-manipulation",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "stroke-[2.5]")} aria-hidden />
              <span className="truncate w-full text-center">{label}</span>
            </PreloadLink>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1 text-[10px] font-medium transition-colors touch-manipulation",
            menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
          aria-label="Open full menu"
          aria-expanded={menuOpen}
        >
          <Menu className={cn("h-5 w-5 shrink-0", menuOpen && "stroke-[2.5]")} aria-hidden />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
