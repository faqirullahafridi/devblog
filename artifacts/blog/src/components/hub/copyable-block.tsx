import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyableBlock({
  value,
  label = "Copy",
  className,
  mono = true,
}: {
  value: string;
  label?: string;
  className?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg border bg-muted/30", className)}>
      <pre className={cn("p-4 pr-12 overflow-x-auto text-sm", mono && "font-mono")}>{value}</pre>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="absolute top-2 right-2 h-8 gap-1"
        onClick={copy}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {label}
      </Button>
    </div>
  );
}

export function CopyableRow({ value, children }: { value: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="py-2.5 pr-4 align-top">{children}</td>
      <td className="py-2.5 text-right w-16">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            toast.success("Copied!");
            setTimeout(() => setCopied(false), 1500);
          }}
          aria-label="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </td>
    </tr>
  );
}
