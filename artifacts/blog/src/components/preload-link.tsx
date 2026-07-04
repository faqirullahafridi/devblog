import { Link } from "wouter";
import { preloadPath } from "@/lib/lazy-pages";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type PreloadLinkProps = ComponentProps<typeof Link>;

/** wouter Link that preloads the route chunk on hover/focus. */
export function PreloadLink({ href, onMouseEnter, onFocus, className, ...props }: PreloadLinkProps) {
  const path = typeof href === "string" ? href : String(href);

  return (
    <Link
      href={href}
      className={cn(className)}
      onMouseEnter={(e) => {
        preloadPath(path);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        preloadPath(path);
        onFocus?.(e);
      }}
      {...props}
    />
  );
}
