import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jsonToTypeScript } from "@/lib/tool-utils";

const SAMPLE = `{
  "id": 1,
  "name": "devblog",
  "tags": ["js", "python"],
  "published": true,
  "meta": { "views": 120 }
}`;

export default function JsonToTypescriptPage() {
  const [input, setInput] = useState(SAMPLE);
  const [typeName, setTypeName] = useState("BlogPost");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convert = () => {
    try {
      const parsed = JSON.parse(input);
      const safeName = typeName.trim().replace(/[^a-zA-Z0-9_]/g, "") || "Root";
      setOutput(jsonToTypeScript(parsed, safeName));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      setOutput("");
    }
  };

  return (
    <ToolPageLayout
      title="JSON to TypeScript"
      description="Paste JSON and generate a TypeScript type definition."
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="space-y-2 flex-1">
            <Label htmlFor="typeName">Type name</Label>
            <Input
              id="typeName"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className="font-mono max-w-xs"
              placeholder="BlogPost"
            />
          </div>
          <Button type="button" onClick={convert}>Generate TypeScript</Button>
        </div>

        <ToolPanel label="JSON Input">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            spellCheck={false}
          />
        </ToolPanel>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <ToolPanel label="TypeScript Output" actions={<CopyButton value={output} />}>
          <Textarea
            value={output}
            readOnly
            className="min-h-[200px] font-mono text-sm bg-muted/20"
            placeholder="export type BlogPost = { ... };"
          />
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
