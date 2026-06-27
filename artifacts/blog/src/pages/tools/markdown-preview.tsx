import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";

const SAMPLE = `# Hello devblog

Write **markdown** here and see a live preview.

\`\`\`javascript
const tools = ["json", "jwt", "regex"];
console.log(tools.join(", "));
\`\`\`

- Lists
- Links [like this](https://example.com)
- And more
`;

export default function MarkdownPreviewPage() {
  const [markdown, setMarkdown] = useState(SAMPLE);

  return (
    <ToolPageLayout
      title="Markdown Preview"
      description="Write markdown and preview styled output — same renderer used on blog posts."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel label="Markdown">
          <Textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>
        <ToolPanel label="Preview">
          <div className="min-h-[400px] overflow-auto">
            {markdown ? (
              <MarkdownContent content={markdown} />
            ) : (
              <p className="text-sm text-muted-foreground">Preview will appear here…</p>
            )}
          </div>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
