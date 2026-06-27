import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EncodeDecodePage() {
  const [input, setInput] = useState("Hello, devblog!");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = (action: string) => {
    setError("");
    try {
      switch (action) {
        case "b64-encode":
          setOutput(btoa(unescape(encodeURIComponent(input))));
          break;
        case "b64-decode":
          setOutput(decodeURIComponent(escape(atob(input))));
          break;
        case "url-encode":
          setOutput(encodeURIComponent(input));
          break;
        case "url-decode":
          setOutput(decodeURIComponent(input));
          break;
        default:
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Operation failed");
      setOutput("");
    }
  };

  return (
    <ToolPageLayout
      title="Base64 & URL Encoder"
      description="Encode and decode Base64 and URL-encoded strings instantly."
    >
      <Tabs defaultValue="base64">
        <TabsList className="mb-4">
          <TabsTrigger value="base64">Base64</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="base64" className="space-y-4">
          <ToolPanel
            label="Input"
            actions={
              <>
                <Button type="button" size="sm" onClick={() => run("b64-encode")}>Encode</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => run("b64-decode")}>Decode</Button>
              </>
            }
          >
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[120px] font-mono text-sm" />
          </ToolPanel>
        </TabsContent>
        <TabsContent value="url" className="space-y-4">
          <ToolPanel
            label="Input"
            actions={
              <>
                <Button type="button" size="sm" onClick={() => run("url-encode")}>Encode</Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => run("url-decode")}>Decode</Button>
              </>
            }
          >
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[120px] font-mono text-sm" />
          </ToolPanel>
        </TabsContent>
      </Tabs>
      {error && <p className="text-sm text-destructive mt-4">{error}</p>}
      <ToolPanel label="Output" actions={<CopyButton value={output} />} className="mt-4">
        <Textarea value={output} readOnly className="min-h-[120px] font-mono text-sm bg-muted/20" placeholder="Result…" />
      </ToolPanel>
    </ToolPageLayout>
  );
}
