import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { useId } from "react";

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
  const swooshId = useId().replace(/:/g, "");

  return (
    <div className={cn("group relative flex items-center gap-3.5", className)}>
      <BrandMark className={cn("h-10 w-10", markClassName)} />

      {!compact && (
        <div className="relative flex min-w-0 flex-col">
          <div className="flex items-end gap-2">
            <span className="font-mono text-[1.35rem] font-black uppercase leading-none tracking-[-0.08em] text-foreground">
              Dev
            </span>
            <span
              className="brand-wordmark-shine mb-0.5 font-mono text-[1.05rem] font-black italic leading-none tracking-[-0.03em] text-primary"
            >
              blog
            </span>
            {variant === "admin" && (
              <span className="mb-1 ml-0.5 inline-flex items-center gap-1 border-2 border-foreground bg-primary px-1.5 py-0.5 text-[0.52rem] font-black uppercase tracking-[0.18em] text-primary-foreground brutal-shadow-sm">
                <span className="brand-cursor-blink inline-block h-1.5 w-1.5 bg-primary-foreground" />
                admin
              </span>
            )}
          </div>

          <svg
            viewBox="0 0 120 8"
            className="mt-1.5 h-1.5 w-[5.4rem] overflow-visible"
            aria-hidden
          >
            <defs>
              <linearGradient id={swooshId} x1="0" y1="0" x2="120" y2="0">
                <stop stopColor="#FF6B00" />
                <stop offset="0.5" stopColor="#E65F00" />
                <stop offset="1" stopColor="#111111" />
              </linearGradient>
            </defs>
            <path
              d="M1 6 C 28 1, 52 7, 78 3 S 108 2, 119 4"
              stroke={`url(#${swooshId})`}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="brand-swoosh"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
