import { Link } from "wouter";
import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import {
  IDE_CATEGORY_ORDER,
  IDE_CATEGORIES,
  IDES,
  IDES_PAGE,
  getIdeHref,
} from "@/lib/ides-config";
import { Badge } from "@/components/ui/badge";

export default function IdesIndexPage() {
  return (
    <HubIndexLayout title={IDES_PAGE.title} description={IDES_PAGE.description} section="IDEs">
      <div className="space-y-12">
        {IDE_CATEGORY_ORDER.map((category) => {
          const items = IDES.filter((i) => i.category === category);
          if (items.length === 0) return null;
          const meta = IDE_CATEGORIES[category];
          return (
            <section key={category}>
              <h2 className="text-xl font-bold tracking-tight">{meta.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-5">{meta.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((ide) => {
                  const Icon = ide.icon;
                  return (
                    <Link
                      key={ide.slug}
                      href={getIdeHref(ide.slug)}
                      className="group rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/15 shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {ide.name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {ide.pricing}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{ide.tagline}</p>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                            {ide.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </HubIndexLayout>
  );
}
