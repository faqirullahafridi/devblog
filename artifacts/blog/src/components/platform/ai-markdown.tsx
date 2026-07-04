import { MarkdownContent } from "@/components/markdown-content";
import { cn } from "@/lib/utils";

export function AiMarkdown({ content, className }: { content: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none min-w-0 break-words [overflow-wrap:anywhere]",
        "prose-p:leading-relaxed prose-p:my-2 prose-headings:font-bold prose-headings:tracking-tight",
        "prose-img:my-3 prose-img:max-w-full prose-img:rounded-lg prose-img:border prose-img:border-border",
        "prose-pre:my-3 prose-pre:max-w-full prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-border/60",
        "prose-code:before:content-none prose-code:after:content-none",
        className,
      )}
    >
      <MarkdownContent content={content} size="sm" />
    </div>
  );
}
