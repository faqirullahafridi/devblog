import { Link, useLocation } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_CATEGORIES,
  getTemplateCategoryHref,
} from "@/lib/templates-config";
import { LayoutTemplate, Sparkles, TrendingUp, Flame, Search } from "lucide-react";

const SUB_LINKS = [
  { href: "/templates", label: "Browse all", icon: LayoutTemplate },
  { href: "/templates/trending", label: "Trending", icon: TrendingUp },
  { href: "/templates/new", label: "Latest", icon: Sparkles },
  { href: "/templates/popular", label: "Popular", icon: Flame },
  { href: "/templates/search", label: "Search", icon: Search },
];

export function TemplatesLayout({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const [location] = useLocation();
  const inTemplates = location.startsWith("/templates");

  return (
    <PublicLayout>
      {inTemplates && (
        <div className="border-b bg-gradient-to-r from-violet-500/[0.07] via-background to-cyan-500/[0.07]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
                  <LayoutTemplate className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                    Design library
                  </p>
                  <p className="text-sm font-semibold leading-none">Templates</p>
                </div>
              </div>
              <nav className="flex flex-wrap gap-1">
                {SUB_LINKS.map((item) => {
                  const active =
                    item.href === "/templates"
                      ? location === "/templates"
                      : location.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                        active
                          ? "bg-foreground text-background shadow-sm"
                          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={getTemplateCategoryHref(cat.slug)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    location === getTemplateCategoryHref(cat.slug)
                      ? "border-violet-500/50 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                      : "border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div
        className={cn(
          "relative",
          inTemplates && "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/[0.04] via-background to-background",
        )}
      >
        <div className={cn("mx-auto", wide ? "max-w-[1400px]" : "max-w-7xl")}>{children}</div>
      </div>
    </PublicLayout>
  );
}
