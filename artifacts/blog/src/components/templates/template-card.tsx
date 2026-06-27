import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/safe-image";
import type { TemplateDef } from "@/lib/templates-config";
import { getTemplateHref } from "@/lib/templates-config";
import { getTemplateHtml } from "@/lib/templates/template-source";
import { downloadTemplateSource } from "@/lib/templates/download";
import { getDemoHref } from "@/lib/templates/demo-theme";
import { getLayoutVariantLabel } from "@/lib/templates/template-design";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Copy, Download, Eye, Sparkles, TrendingUp, Flame } from "lucide-react";

type TemplateCardProps = {
  template: TemplateDef;
  className?: string;
  variant?: "grid" | "featured";
};

export function TemplateCard({ template, className, variant = "grid" }: TemplateCardProps) {
  const [copying, setCopying] = useState(false);
  const layoutLabel = getLayoutVariantLabel(template);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCopying(true);
    try {
      await navigator.clipboard.writeText(getTemplateHtml(template));
      toast.success("HTML copied — open details for styles.css");
    } catch {
      toast.error("Could not copy code");
    } finally {
      setCopying(false);
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card",
        variant === "featured" && "border-violet-500/30",
        className,
      )}
    >
      <Link href={getTemplateHref(template.slug)} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <SafeImage
          src={template.previewImage}
          alt={template.title}
          className="h-full w-full object-cover"
          wrapperClassName="h-full w-full"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge className="border-0 bg-black/70 text-white text-[10px]">Free</Badge>
          {template.trending && (
            <Badge className="gap-0.5 border-0 bg-amber-500 text-white text-[10px]">
              <TrendingUp className="h-3 w-3" /> Hot
            </Badge>
          )}
          {template.isNew && (
            <Badge className="gap-0.5 border-0 bg-sky-500 text-white text-[10px]">
              <Sparkles className="h-3 w-3" /> New
            </Badge>
          )}
          {template.popular && !template.trending && (
            <Badge className="gap-0.5 border-0 bg-orange-500 text-white text-[10px]">
              <Flame className="h-3 w-3" /> Top
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <Link href={`/templates/category/${template.categorySlug}`} className="font-semibold text-violet-600 dark:text-violet-400">
            {template.categoryTitle}
          </Link>
          <span className="text-[10px]">{layoutLabel}</span>
        </div>

        <h3 className="text-sm font-bold leading-snug line-clamp-2">
          <Link href={getTemplateHref(template.slug)} className="hover:text-violet-600 dark:hover:text-violet-400">
            {template.title}
          </Link>
        </h3>

        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {template.stack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-[10px] font-normal px-1.5 py-0">
              {tech}
            </Badge>
          ))}
        </div>

        <div className="flex gap-1.5 pt-2 border-t border-border/50">
          <Button size="sm" variant="secondary" className="h-7 flex-1 text-[11px] px-2" asChild>
            <Link href={getDemoHref(template.slug)}>
              <Eye className="h-3 w-3 mr-1" /> Demo
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 text-[11px] px-2"
            onClick={() => downloadTemplateSource(template)}
          >
            <Download className="h-3 w-3 mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2" disabled={copying} onClick={handleCopy} aria-label="Copy HTML">
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function TemplateCardCompact({ template }: { template: TemplateDef }) {
  return (
    <Link
      href={getTemplateHref(template.slug)}
      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5"
    >
      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        <SafeImage src={template.previewImage} alt="" className="h-full w-full object-cover" wrapperClassName="h-full w-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1">{template.title}</p>
        <p className="text-[11px] text-muted-foreground line-clamp-1">{template.stack.join(" · ")}</p>
      </div>
    </Link>
  );
}
