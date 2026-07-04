import { cn } from "@/lib/utils";

export function ToolPanel({
  label,
  children,
  className,
  actions,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn("border border-border bg-card shadow-sm overflow-hidden", className)}>
      {(label || actions) && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/30">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
