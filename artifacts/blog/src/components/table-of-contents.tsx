import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

type TableOfContentsProps = {
  content: string;
  /** `inline` — in article flow (mobile). `sidebar` — compact sticky nav. */
  variant?: "inline" | "sidebar";
  className?: string;
};

export function TableOfContents({ content, variant = "inline", className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const lines = content.split("\n");
    const found: Heading[] = [];
    for (const line of lines) {
      const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
      if (m) {
        const text = m[2].trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
        found.push({ id, text, level: m[1].length });
      }
    }
    setHeadings(found);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  const isSidebar = variant === "sidebar";

  return (
    <nav
      className={cn(
        isSidebar
          ? "rounded-lg border border-border bg-card p-4 shadow-sm"
          : "rounded-xl border border-border bg-muted/30 p-4 mb-8",
        className,
      )}
      aria-label="Table of contents"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        On this page
      </p>
      <ul className={cn("space-y-1.5", isSidebar ? "text-xs" : "text-sm")}>
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && "pl-3")}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block py-0.5 text-muted-foreground hover:text-primary transition-colors line-clamp-2",
                active === h.id && "text-primary font-medium",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
