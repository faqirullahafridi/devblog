import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

type BrandLogoProps = {
  variant?: "default" | "admin";
  className?: string;
  markClassName?: string;
  compact?: boolean;
};

export function BrandLogo({
  variant = "default",
  className,
  markClassName,
  compact = false,
}: BrandLogoProps) {
  return (
    <div className={cn("group relative flex items-center gap-2.5", className)}>
      <BrandMark className={cn("h-9 w-9", markClassName)} />

      {!compact && (
        <div className="relative flex min-w-0 flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-semibold tracking-tight text-foreground">Tech</span>
            <span className="text-lg font-semibold tracking-tight text-primary">Ventry</span>
            {variant === "admin" && (
              <span className="ml-1.5 inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Admin
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
