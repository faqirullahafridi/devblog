import { useState } from "react";
import { CodeBlockCopyButton } from "@/components/code-block-copy";
import { MarkdownCodeBlock } from "@/components/markdown-code-block";
import type { TemplateDef } from "@/lib/templates-config";
import { getTemplateSourceFiles } from "@/lib/templates/template-source";
import { getLayoutVariantLabel } from "@/lib/templates/template-design";
import { cn } from "@/lib/utils";

type Tab = "html" | "css" | "jsx";

export function TemplateCodeViewer({ template }: { template: TemplateDef }) {
  const files = getTemplateSourceFiles(template);
  const isReact = Boolean(files.jsx);
  const [tab, setTab] = useState<Tab>("html");
  const variantLabel = getLayoutVariantLabel(template);

  const tabs: { id: Tab; label: string; code: string; lang: string }[] = [
    { id: "html", label: "index.html", code: files.html, lang: "html" },
    { id: "css", label: "styles.css", code: files.css, lang: "css" },
  ];
  if (isReact && files.jsx) {
    tabs.push({ id: "jsx", label: "App.tsx", code: files.jsx, lang: "tsx" });
  }

  const active = tabs.find((t) => t.id === tab) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-[#1e1e1e]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-black/20 px-3 py-2">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-mono transition-colors",
                tab === t.id ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/40">{variantLabel}</span>
          <CodeBlockCopyButton code={active.code} className="relative static h-8 w-8 opacity-100" />
        </div>
      </div>
      <MarkdownCodeBlock
        language={active.lang}
        code={active.code}
        customStyle={{ margin: 0, padding: "1.25rem", background: "transparent", maxHeight: "420px" }}
      />
    </div>
  );
}
