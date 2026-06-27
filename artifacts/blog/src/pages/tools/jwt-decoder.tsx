import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Textarea } from "@/components/ui/textarea";

function decodePart(part: string) {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  return JSON.stringify(JSON.parse(json), null, 2);
}

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");

  const decode = (value: string) => {
    setToken(value);
    if (!value.trim()) {
      setHeader("");
      setPayload("");
      setError("");
      return;
    }
    try {
      const parts = value.trim().split(".");
      if (parts.length < 2) throw new Error("JWT must have at least header and payload.");
      setHeader(decodePart(parts[0]));
      setPayload(decodePart(parts[1]));
      setError("");
    } catch (e) {
      setHeader("");
      setPayload("");
      setError(e instanceof Error ? e.message : "Failed to decode JWT");
    }
  };

  return (
    <ToolPageLayout
      title="JWT Decoder"
      description="Decode JWT header and payload. Signatures are not verified — for debugging only."
    >
      <div className="space-y-4">
        <ToolPanel label="JWT Token">
          <Textarea
            value={token}
            onChange={(e) => decode(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            spellCheck={false}
          />
        </ToolPanel>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <ToolPanel label="Header" actions={<CopyButton value={header} />}>
            <pre className="text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all text-muted-foreground">
              {header || "—"}
            </pre>
          </ToolPanel>
          <ToolPanel label="Payload" actions={<CopyButton value={payload} />}>
            <pre className="text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all text-muted-foreground">
              {payload || "—"}
            </pre>
          </ToolPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}
