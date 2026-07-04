import { useMemo, useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Textarea } from "@/components/ui/textarea";
import { diffText } from "@/lib/tool-utils";
import { cn } from "@/lib/utils";

const SAMPLE_A = `function greet(name) {\n  return "Hello, " + name;\n}\n\nconsole.log(greet("devblog"));`;
const SAMPLE_B = `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet("devblog"));`;

export default function TextDiffPage() {
  const [textA, setTextA] = useState(SAMPLE_A);
  const [textB, setTextB] = useState(SAMPLE_B);

  const diff = useMemo(() => diffText(textA, textB), [textA, textB]);
  const changes = diff.filter((d) => d.type !== "same").length;

  return (
    <ToolPageLayout
      title="Text Diff"
      description="Compare two blocks of text and highlight added and removed lines."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <ToolPanel label="Original (A)">
          <Textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            className="min-h-[220px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>
        <ToolPanel label="Modified (B)">
          <Textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            className="min-h-[220px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>
      </div>

      <ToolPanel label={`Diff (${changes} changed line${changes === 1 ? "" : "s"})`} className="mt-4">
        <div className="font-mono text-sm overflow-hidden border border-border">
          {diff.length === 0 ? (
            <p className="p-4 text-muted-foreground">No content to compare.</p>
          ) : (
            diff.map((row, i) => (
              <div
                key={i}
                className={cn(
                  "px-3 py-1 border-b border-foreground/20 last:border-b-0 whitespace-pre-wrap break-all",
                  row.type === "same" && "bg-muted/40 text-foreground",
                  row.type === "remove" && "bg-red-500/10 text-red-800",
                  row.type === "add" && "bg-green-500/10 text-green-800",
                )}
              >
                <span className="select-none mr-2 opacity-60">
                  {row.type === "remove" ? "−" : row.type === "add" ? "+" : " "}
                </span>
                {row.line || " "}
              </div>
            ))
          )}
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
