import { Link } from "wouter";
import { preloadPath } from "@/lib/lazy-pages";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type PreloadLinkProps = ComponentProps<typeof Link>;

/** wouter Link that preloads the route chunk on hover, focus, or touch. */
export function PreloadLink({ href, onMouseEnter, onFocus, onTouchStart, className, ...props }: PreloadLinkProps) {
  const path = typeof href === "string" ? href : String(href);

  const warm = () => preloadPath(path);

  return (
    <Link
      href={href}
      className={cn(className)}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        warm();
        onTouchStart?.(e);
      }}
      {...props}
    />
  );
}
