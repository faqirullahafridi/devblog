/** In-layout content skeleton — header/footer stay visible while route chunks load. */
export function PageContentLoader() {
  return (
    <div
      className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-5 bg-background"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="h-8 w-40 max-w-[50%] rounded-md bg-muted animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-full max-w-2xl rounded bg-muted/80 animate-pulse" />
        <div className="h-4 w-5/6 max-w-xl rounded bg-muted/60 animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-36 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/** Minimal fallback for admin / full-page suspense. */
export function PageLoader() {
  return <PageContentLoader />;
}
