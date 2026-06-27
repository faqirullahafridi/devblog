import { useMemo, useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("[a-z]+");
  const [flags, setFlags] = useState("gi");
  const [text, setText] = useState("Hello devblog developers!");

  const result = useMemo(() => {
    if (!pattern) return { error: "", matches: [] as string[], highlighted: text };
    try {
      const re = new RegExp(pattern, flags);
      const matches = [...text.matchAll(re)].map((m) => m[0]);
      const highlighted = text.replace(re, (m) => `⟦${m}⟧`);
      return { error: "", matches, highlighted };
    } catch (e) {
      return {
        error: e instanceof Error ? e.message : "Invalid regex",
        matches: [] as string[],
        highlighted: text,
      };
    }
  }, [pattern, flags, text]);

  return (
    <ToolPageLayout
      title="Regex Tester"
      description="Test regular expressions against sample text with live match highlighting."
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label>Pattern</Label>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="font-mono"
              placeholder="[a-z]+"
            />
          </div>
          <div className="space-y-2">
            <Label>Flags</Label>
            <Input
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="font-mono w-full sm:w-24"
              placeholder="gi"
            />
          </div>
        </div>
        <ToolPanel label="Test string">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />
        </ToolPanel>
        {result.error && <p className="text-sm text-destructive">{result.error}</p>}
        <ToolPanel label={`Matches (${result.matches.length})`}>
          {result.matches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matches</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {result.matches.map((m, i) => (
                <code key={`${m}-${i}`} className="text-xs bg-muted px-2 py-1 rounded">
                  {m}
                </code>
              ))}
            </div>
          )}
        </ToolPanel>
        <ToolPanel label="Highlighted">
          <p className="text-sm font-mono whitespace-pre-wrap break-all">
            {result.highlighted.split(/⟦|⟧/).map((part, i) =>
              i % 2 === 1 ? (
                <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5">
                  {part}
                </mark>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
