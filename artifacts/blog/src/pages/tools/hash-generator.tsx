import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("devblog");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      setHash(await sha256(input));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolPageLayout
      title="Hash Generator"
      description="Generate SHA-256 hashes from any text using the Web Crypto API."
    >
      <div className="space-y-4">
        <ToolPanel
          label="Input"
          actions={
            <Button type="button" size="sm" onClick={generate} disabled={loading}>
              {loading ? "Hashing…" : "Generate SHA-256"}
            </Button>
          }
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />
        </ToolPanel>
        <ToolPanel label="SHA-256" actions={<CopyButton value={hash} />}>
          <p className="font-mono text-sm break-all text-muted-foreground min-h-[2.5rem]">
            {hash || "Click Generate to compute hash"}
          </p>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
