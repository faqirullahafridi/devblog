import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";

export function HubCardGrid({
  items,
  getHref,
}: {
  items: Array<{ slug: string; name: string; description: string; icon: LucideIcon }>;
  getHref: (slug: string) => string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.slug}
            href={getHref(item.slug)}
            className="group border-2 border-foreground bg-card p-5 brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/15 transition-colors shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold group-hover:text-primary transition-colors">{item.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
