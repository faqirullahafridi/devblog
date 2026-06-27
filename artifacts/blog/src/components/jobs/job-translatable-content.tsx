import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { translateJobField } from "@/lib/platform-api";
import { toast } from "sonner";
import { Languages, Loader2, RotateCcw } from "lucide-react";

type JobTranslatableContentProps = {
  slug: string;
  field: "description" | "requirements";
  content: string;
  /** Show translate control even when heuristics say English */
  showTranslate?: boolean;
  className?: string;
};

export function JobTranslatableContent({
  slug,
  field,
  content,
  showTranslate = true,
  className,
}: JobTranslatableContentProps) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);

  const translate = useMutation({
    mutationFn: () => translateJobField(slug, field),
    onSuccess: (data) => {
      setTranslated(data.text);
      setShowEnglish(true);
    },
    onError: (e: Error) => toast.error(e.message || "Translation failed"),
  });

  if (!content.trim()) return null;

  const handleToggle = () => {
    if (showEnglish) {
      setShowEnglish(false);
      return;
    }
    if (translated) {
      setShowEnglish(true);
      return;
    }
    translate.mutate();
  };

  return (
    <div className={className}>
      {showTranslate && (
        <div className="flex flex-wrap items-center gap-2 mb-3 not-prose">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleToggle}
            disabled={translate.isPending}
          >
            {translate.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : showEnglish ? (
              <RotateCcw className="h-3.5 w-3.5" />
            ) : (
              <Languages className="h-3.5 w-3.5" />
            )}
            {translate.isPending
              ? "Translating…"
              : showEnglish
                ? "Show original"
                : "Translate to English"}
          </Button>
          {showEnglish && translated && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              English translation
            </span>
          )}
        </div>
      )}
      <MarkdownContent content={showEnglish && translated ? translated : content} size="sm" />
    </div>
  );
}
