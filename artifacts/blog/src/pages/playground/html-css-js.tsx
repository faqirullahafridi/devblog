import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { PlaygroundWorkspace } from "@/components/platform/playground-workspace";

export default function PlaygroundHtmlPage() {
  return (
    <PlatformHubLayout title="HTML / CSS / JS" description="Live preview playground." section="Playground" backHref="/playground" backLabel="Playground">
      <PlaygroundWorkspace language="html-css-js" />
    </PlatformHubLayout>
  );
}
