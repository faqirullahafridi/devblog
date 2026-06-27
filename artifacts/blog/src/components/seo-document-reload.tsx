import { useEffect } from "react";

/** Force a full document load for SEO/XML routes (bypasses the SPA router). */
export function SeoDocumentReload() {
  useEffect(() => {
    window.location.replace(`${window.location.pathname}${window.location.search}`);
  }, []);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

export function isNonSpaPath(href: string): boolean {
  return /\.(?:xml|txt)$/.test(href) || href === "/robots.txt";
}
