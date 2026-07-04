import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type Breadcrumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  description?: string;
  section?: string;
  backHref?: string;
  backLabel?: string;
  breadcrumbs?: Breadcrumb[];
  align?: "left" | "center";
  className?: string;
};

export function PageHeader({
  title,
  description,
  section,
  backHref,
  backLabel,
  breadcrumbs,
  align = "left",
  className,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header className={cn("mb-8 md:mb-10", centered && "text-center max-w-2xl mx-auto", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel ?? "Back"}
        </Link>
      )}

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className="text-border">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[12rem] sm:max-w-none">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {section && <p className={cn("section-label mb-2", centered && "justify-center")}>{section}</p>}

      <h1
        className={cn(
          "text-3xl md:text-4xl font-semibold tracking-tight text-foreground text-balance",
          centered && "mx-auto",
        )}
      >
        {title}
      </h1>

      {description && (
        <p
          className={cn(
            "mt-3 text-base md:text-lg text-muted-foreground leading-relaxed text-pretty",
            centered ? "mx-auto" : "max-w-3xl",
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}
