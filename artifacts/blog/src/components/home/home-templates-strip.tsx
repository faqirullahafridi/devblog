import { Link } from "wouter";
import { getFeaturedTemplates, getTemplateHref } from "@/lib/templates-config";
import { SafeImage } from "@/components/safe-image";
import { HomeSectionHeader } from "@/components/home/home-section-header";
import { cn } from "@/lib/utils";

export function HomeTemplatesStrip({ embedded = false }: { embedded?: boolean }) {
  const templates = getFeaturedTemplates(4);

  return (
    <section className={cn(!embedded && "container mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-16")}>
      <HomeSectionHeader
        label="Templates"
        title="Free starter templates"
        description="Preview live, copy code, or download — landing pages, portfolios, and SaaS kits."
        href="/templates"
        linkText="Browse all"
      />

      {/* Mobile: horizontal scroll; desktop: grid */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 lg:grid-cols-4">
        {templates.map((template) => (
          <Link
            key={template.slug}
            href={getTemplateHref(template.slug)}
            className="group flex w-[72vw] max-w-[280px] sm:w-auto sm:max-w-none flex-col shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <SafeImage
                src={template.previewImage}
                alt=""
                className="h-full w-full object-cover object-top"
                wrapperClassName="h-full w-full"
              />
              <span className="absolute top-2 left-2 rounded-md bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] sm:text-xs font-medium">
                {template.categoryTitle}
              </span>
            </div>
            <div className="p-3 sm:p-4 flex flex-col gap-1 min-h-[4.5rem]">
              <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary">
                {template.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
