import { cn } from "@/lib/utils";

/** Centered hub page container — matches /tools layout. */
export const HUB_CONTAINER_CLASS = "container mx-auto px-4 py-12 max-w-5xl";

export function HubShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(HUB_CONTAINER_CLASS, className)}>{children}</div>;
}
