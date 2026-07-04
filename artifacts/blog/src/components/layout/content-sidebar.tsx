import { AdSlot } from "@/components/site-scripts";
import { cn } from "@/lib/utils";

type ContentSidebarProps = {
  children?: React.ReactNode;
  className?: string;
  /** Show sticky AdSense unit (desktop sidebar). */
  showAd?: boolean;
};

export function ContentSidebar({ children, className, showAd = true }: ContentSidebarProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
      {showAd && <AdSlot variant="sidebar" />}
    </div>
  );
}
