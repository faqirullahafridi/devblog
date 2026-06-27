import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

export function TableOfContents({ content }: { content: string }) {
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

  return (
    <nav className="rounded-xl border bg-muted/30 p-4 mb-8">
      <p className="text-sm font-semibold mb-3">On this page</p>
      <ul className="space-y-2 text-sm">
        {headings.map((h) => (
          <li key={h.id} className={cn(h.level === 3 && "pl-4")}>
            <a
              href={`#${h.id}`}
              className={cn(
                "text-muted-foreground hover:text-primary transition-colors",
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
