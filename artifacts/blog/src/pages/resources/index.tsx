import { ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { MarkdownContent } from "@/components/markdown-content";
import { RESOURCE_CATEGORIES, RESOURCES_PAGE } from "@/lib/resources-config";

function isInternal(url: string) {
  return url.startsWith("/");
}

export default function ResourcesPage() {
  return (
    <HubIndexLayout
      title={RESOURCES_PAGE.title}
      description={RESOURCES_PAGE.description}
      section="Resources"
    >
      <div className="space-y-14">
        {RESOURCE_CATEGORIES.map((cat) => (
          <section key={cat.id}>
            <h2 className="text-xl font-bold tracking-tight">{cat.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-4">{cat.description}</p>
            {cat.guide && (
              <div className="mb-6 rounded-xl border bg-muted/20 p-5 prose-sm dark:prose-invert max-w-none">
                <MarkdownContent content={cat.guide} size="sm" />
              </div>
            )}
            <ul className="space-y-3">
              {cat.items.map((item) => (
                <li key={item.url}>
                  {isInternal(item.url) ? (
                    <Link
                      href={item.url}
                      className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                        {item.detail && (
                          <p className="text-sm text-muted-foreground/90 mt-2 leading-relaxed border-t pt-2">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-primary shrink-0" />
                      <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                        {item.detail && (
                          <p className="text-sm text-muted-foreground/90 mt-2 leading-relaxed border-t pt-2">
                            {item.detail}
                          </p>
                        )}
                      </div>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </HubIndexLayout>
  );
}
