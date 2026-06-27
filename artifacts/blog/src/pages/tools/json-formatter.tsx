import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function JsonFormatterPage() {
  const [input, setInput] = useState('{\n  "name": "devblog",\n  "tools": true\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = (minify = false) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, minify ? 0 : 2));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <ToolPageLayout
      title="JSON Formatter"
      description="Format, validate, and minify JSON. All processing happens locally in your browser."
    >
      <div className="space-y-4">
        <ToolPanel
          label="Input"
          actions={
            <>
              <Button type="button" size="sm" onClick={() => format(false)}>Format</Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => format(true)}>Minify</Button>
            </>
          }
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <ToolPanel label="Output" actions={<CopyButton value={output} />}>
          <Textarea
            value={output}
            readOnly
            className="min-h-[200px] font-mono text-sm bg-muted/20"
            placeholder="Formatted JSON will appear here…"
          />
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
