import { MarkdownContent } from "@/components/markdown-content";
import { cn } from "@/lib/utils";

export function AiMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none min-w-0 break-words [overflow-wrap:anywhere]", className)}>
      <MarkdownContent content={content} size="sm" />
    </div>
  );
}
