import { useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { CopyButton } from "@/components/tools/copy-button";
import { Button } from "@/components/ui/button";

function uuidv4() {
  return crypto.randomUUID();
}

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([uuidv4()]);

  const generate = (count: number) => {
    setUuids(Array.from({ length: count }, () => uuidv4()));
  };

  return (
    <ToolPageLayout
      title="UUID Generator"
      description="Generate random UUID v4 identifiers for your projects."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => generate(1)}>Generate 1</Button>
          <Button type="button" variant="secondary" onClick={() => generate(5)}>Generate 5</Button>
          <Button type="button" variant="outline" onClick={() => generate(10)}>Generate 10</Button>
        </div>
        <ToolPanel label="UUIDs" actions={<CopyButton value={uuids.join("\n")} label="Copy all" />}>
          <ul className="space-y-2">
            {uuids.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 font-mono text-sm bg-muted/30 rounded-md px-3 py-2">
                <span className="break-all">{id}</span>
                <CopyButton value={id} label="Copy" />
              </li>
            ))}
          </ul>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
