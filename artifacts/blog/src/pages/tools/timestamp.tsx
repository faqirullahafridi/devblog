import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TimestampPage() {
  const now = Math.floor(Date.now() / 1000);
  const [unix, setUnix] = useState(String(now));
  const [iso, setIso] = useState(new Date().toISOString());

  const fromUnix = () => {
    const n = Number(unix);
    if (Number.isNaN(n)) return;
    const ms = unix.length > 10 ? n : n * 1000;
    setIso(new Date(ms).toISOString());
  };

  const fromIso = () => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    setUnix(String(Math.floor(d.getTime() / 1000)));
  };

  const useNow = () => {
    const t = Math.floor(Date.now() / 1000);
    setUnix(String(t));
    setIso(new Date().toISOString());
  };

  return (
    <ToolPageLayout
      title="Timestamp Converter"
      description="Convert between Unix timestamps and ISO 8601 dates."
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="outline" onClick={useNow}>Use now</Button>
        </div>
        <ToolPanel label="Unix timestamp (seconds)">
          <div className="flex gap-2">
            <Input value={unix} onChange={(e) => setUnix(e.target.value)} className="font-mono" />
            <Button type="button" onClick={fromUnix}>→ ISO</Button>
          </div>
        </ToolPanel>
        <ToolPanel label="ISO 8601" actions={<CopyButton value={iso} />}>
          <div className="flex gap-2">
            <Input value={iso} onChange={(e) => setIso(e.target.value)} className="font-mono text-sm" />
            <Button type="button" onClick={fromIso}>→ Unix</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Local: {(() => {
              try {
                return new Date(iso).toLocaleString();
              } catch {
                return "—";
              }
            })()}
          </p>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
