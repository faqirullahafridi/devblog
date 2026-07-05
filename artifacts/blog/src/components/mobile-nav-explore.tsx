import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { PreloadLink } from "@/components/preload-link";
import { releaseMobileDrawerFocus } from "@/components/mobile-drawer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Category } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import {
  CONTENT_LINKS,
  LEGAL_LINKS,
  MORE_PLATFORM_LINKS,
  PRIMARY_NAV,
  PRIMARY_PAGE_LINKS,
  RESOURCE_LINKS,
} from "@/lib/nav-config";
import { TOOLS, getToolHref } from "@/lib/tools-config";
import { REF_NAV_ITEMS, getRefHref } from "@/lib/refs-config";
import { LEARN_PATHS, getLearnHref } from "@/lib/learn-config";
import { INTERVIEW_TOPICS, getInterviewHref } from "@/lib/interview-config";
import { TEMPLATE_CATEGORIES, getTemplateCategoryHref } from "@/lib/templates-config";

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <PreloadLink
      href={href}
      onClick={() => {
        releaseMobileDrawerFocus();
        onNavigate();
      }}
      className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/60 touch-manipulation"
    >
      {label}
    </PreloadLink>
  );
}

function CollapsibleNavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors touch-manipulation">
        <span>{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-0.5 space-y-0.5 border-l-2 border-border ml-3 pl-1 pb-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type Props = {
  categories?: Category[];
  onNavigate: () => void;
};

/** Collapsible deep links — kept mounted so open/close does not re-render the tree. */
export function MobileNavExploreSections({ categories, onNavigate }: Props) {
  return (
    <div className="space-y-1">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Explore more
      </p>

      {categories && categories.length > 0 && (
        <CollapsibleNavSection title={`Article categories (${categories.length})`}>
          {categories.map((c) => (
            <NavLink key={c.id} href={`/category/${c.slug}`} label={c.name} onNavigate={onNavigate} />
          ))}
        </CollapsibleNavSection>
      )}

      {MORE_PLATFORM_LINKS.length > 0 && (
        <CollapsibleNavSection title="Platform">
          {MORE_PLATFORM_LINKS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
          ))}
        </CollapsibleNavSection>
      )}

      <CollapsibleNavSection title="Templates">
        <NavLink href="/templates" label="Browse all" onNavigate={onNavigate} />
        <NavLink href="/templates/trending" label="Trending" onNavigate={onNavigate} />
        <NavLink href="/templates/new" label="Latest" onNavigate={onNavigate} />
        <NavLink href="/templates/popular" label="Popular" onNavigate={onNavigate} />
        {TEMPLATE_CATEGORIES.map((cat) => (
          <NavLink
            key={cat.slug}
            href={getTemplateCategoryHref(cat.slug)}
            label={cat.title}
            onNavigate={onNavigate}
          />
        ))}
      </CollapsibleNavSection>

      <CollapsibleNavSection title={`Tools (${TOOLS.length})`}>
        <NavLink href="/tools" label="All tools" onNavigate={onNavigate} />
        {TOOLS.map((tool) => (
          <NavLink key={tool.slug} href={getToolHref(tool.slug)} label={tool.name} onNavigate={onNavigate} />
        ))}
      </CollapsibleNavSection>

      <CollapsibleNavSection title={`Learn (${LEARN_PATHS.length} paths)`}>
        <NavLink href="/learn" label="All paths" onNavigate={onNavigate} />
        {LEARN_PATHS.map((path) => (
          <NavLink key={path.slug} href={getLearnHref(path.slug)} label={path.title} onNavigate={onNavigate} />
        ))}
      </CollapsibleNavSection>

      <CollapsibleNavSection title="Interview prep">
        <NavLink href="/interview" label="All topics" onNavigate={onNavigate} />
        {INTERVIEW_TOPICS.map((t) => (
          <NavLink key={t.slug} href={getInterviewHref(t.slug)} label={t.title} onNavigate={onNavigate} />
        ))}
      </CollapsibleNavSection>

      <CollapsibleNavSection title="References & snippets">
        <NavLink href="/refs" label="All references" onNavigate={onNavigate} />
        {REF_NAV_ITEMS.map((ref) => (
          <NavLink key={ref.slug} href={getRefHref(ref.slug)} label={ref.name} onNavigate={onNavigate} />
        ))}
        <NavLink href="/snippets" label="Snippets" onNavigate={onNavigate} />
      </CollapsibleNavSection>

      <CollapsibleNavSection title="Resources">
        {RESOURCE_LINKS.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
        ))}
        {CONTENT_LINKS.filter((c) => !PRIMARY_NAV.some((p) => p.href === c.href)).map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
        ))}
      </CollapsibleNavSection>

      <CollapsibleNavSection title="About & legal">
        {PRIMARY_PAGE_LINKS.map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
        ))}
        <NavLink href="/disclaimer" label="Disclaimer" onNavigate={onNavigate} />
        <NavLink href="/cookie-policy" label="Cookie Policy" onNavigate={onNavigate} />
        {LEGAL_LINKS.filter(
          (l) =>
            !PRIMARY_PAGE_LINKS.some((p) => p.href === l.href) &&
            l.href !== "/disclaimer" &&
            l.href !== "/cookie-policy",
        ).map((item) => (
          <NavLink key={item.href} href={item.href} label={item.label} onNavigate={onNavigate} />
        ))}
      </CollapsibleNavSection>
    </div>
  );
}
