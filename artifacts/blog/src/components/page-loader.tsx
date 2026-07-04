/** Minimal route fallback — no layout shift, low paint cost. */
export function PageLoader() {
  return <div className="min-h-[40vh] w-full" aria-busy="true" aria-label="Loading page" />;
}
