import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <div className={cn("brand-mark-tilt relative shrink-0", className)}>
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full overflow-visible"
        aria-hidden
      >
        <rect x="2" y="2" width="40" height="40" fill="#FFFFFF" stroke="#111111" strokeWidth="3" />
        <rect x="8" y="8" width="28" height="28" fill="#FF6B00" stroke="#111111" strokeWidth="2" />
        <path d="M11 33L33 11" stroke="#111111" strokeWidth="2.5" strokeLinecap="square" />
        <rect x="18" y="18" width="8" height="8" fill="#111111" />
      </svg>
    </div>
  );
}
