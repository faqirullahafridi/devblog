import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeSectionHeader({
  label,
  title,
  description,
  href,
  linkText = "View all",
  className,
}: {
  label: string;
  title: string;
  description?: string;
  href?: string;
  linkText?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6", className)}>
      <div className="min-w-0">
        <p className="section-label mb-1">{label}</p>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
        >
          {linkText}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
