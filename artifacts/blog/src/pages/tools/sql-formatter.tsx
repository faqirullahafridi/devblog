import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatSql } from "@/lib/tool-utils";

const SAMPLE = `SELECT u.id, u.name, p.title FROM users u LEFT JOIN posts p ON p.user_id = u.id WHERE u.active = true AND p.published_at IS NOT NULL ORDER BY p.published_at DESC LIMIT 10;`;

export default function SqlFormatterPage() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = () => {
    try {
      if (!input.trim()) throw new Error("Enter a SQL query");
      setOutput(formatSql(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to format");
      setOutput("");
    }
  };

  return (
    <ToolPageLayout
      title="SQL Formatter"
      description="Format and beautify SQL with keyword casing and line breaks."
    >
      <div className="space-y-4">
        <ToolPanel
          label="SQL Input"
          actions={<Button type="button" size="sm" onClick={format}>Format SQL</Button>}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <ToolPanel label="Formatted SQL" actions={<CopyButton value={output} />}>
          <Textarea
            value={output}
            readOnly
            className="min-h-[200px] font-mono text-sm bg-muted/20"
            placeholder="Formatted SQL will appear here…"
          />
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
