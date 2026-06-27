import { MarkdownContent } from "@/components/markdown-content";

export function ContentGuide({
  title = "In-depth guide",
  content,
}: {
  title?: string;
  content: string;
}) {
  if (!content.trim()) return null;
  return (
    <section className="mt-12 pt-10 border-t">
      <h2 className="text-xl font-bold tracking-tight mb-6">{title}</h2>
      <MarkdownContent content={content} />
    </section>
  );
}
