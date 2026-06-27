import { PlatformHubLayout, PlatformCard, PlatformCardGrid } from "@/components/platform/platform-hub-layout";
import { Link } from "wouter";

export default function PlaygroundIndexPage() {
  return (
    <PlatformHubLayout
      title="Coding Playground"
      description="Write HTML, CSS, JavaScript, Python, and SQL in the browser. Save, share, and fork snippets."
      section="Platform"
    >
      <PlatformCardGrid>
        <PlatformCard href="/playground/html-css-js" title="HTML / CSS / JS" description="Live preview with split editor." badge="Web" />
        <PlatformCard href="/playground/python" title="Python" description="Run Python in the browser via Pyodide." badge="Python" />
        <PlatformCard href="/playground/sql" title="SQL" description="Query a sample database with sql.js." badge="SQL" />
      </PlatformCardGrid>
      <p className="text-sm text-muted-foreground mt-8">
        <Link href="/playground/html-css-js" className="text-primary hover:underline">Open editor →</Link>
      </p>
    </PlatformHubLayout>
  );
}
