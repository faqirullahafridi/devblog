import { useEffect, useState } from "react";
import { ToolPageLayout } from "@/components/tools/tool-page-layout";
import { ToolPanel } from "@/components/tools/tool-panel";
import { Input } from "@/components/ui/input";
import { describeCron } from "@/lib/tool-utils";

const EXAMPLES = [
  { expr: "* * * * *", label: "Every minute" },
  { expr: "0 0 * * *", label: "Daily at midnight" },
  { expr: "0 9 * * 1", label: "Mondays at 9:00" },
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
];

export default function CronParserPage() {
  const [expr, setExpr] = useState("0 9 * * 1");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const parse = (value: string) => {
    setExpr(value);
    try {
      setDescription(describeCron(value));
      setError("");
    } catch (e) {
      setDescription("");
      setError(e instanceof Error ? e.message : "Invalid cron expression");
    }
  };

  useEffect(() => {
    parse(expr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToolPageLayout
      title="Cron Parser"
      description="Understand cron schedules with a plain-English explanation."
    >
      <div className="space-y-4">
        <ToolPanel label="Cron expression (minute hour day month weekday)">
          <Input
            value={expr}
            onChange={(e) => parse(e.target.value)}
            className="font-mono"
            placeholder="0 9 * * 1"
            spellCheck={false}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Format: <code className="bg-muted px-1 rounded">minute hour day-of-month month day-of-week</code>
          </p>
        </ToolPanel>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              type="button"
              onClick={() => parse(ex.expr)}
              className="text-xs px-3 py-1.5 border border-border bg-muted/30 text-foreground hover:bg-muted transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <ToolPanel label="Explanation">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description || "Enter a cron expression to see its meaning."}
          </p>
        </ToolPanel>

        <ToolPanel label="Field reference">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div><dt className="font-medium text-foreground">Minute</dt><dd className="text-muted-foreground">0–59, *, */n</dd></div>
            <div><dt className="font-medium text-foreground">Hour</dt><dd className="text-muted-foreground">0–23, *, */n</dd></div>
            <div><dt className="font-medium text-foreground">Day</dt><dd className="text-muted-foreground">1–31, *</dd></div>
            <div><dt className="font-medium text-foreground">Month</dt><dd className="text-muted-foreground">1–12, *</dd></div>
            <div><dt className="font-medium text-foreground">Weekday</dt><dd className="text-muted-foreground">0–6 (Sun=0), *</dd></div>
          </dl>
        </ToolPanel>
      </div>
    </ToolPageLayout>
  );
}
