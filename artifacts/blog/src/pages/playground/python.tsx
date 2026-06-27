import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { PlaygroundWorkspace } from "@/components/platform/playground-workspace";

export default function PlaygroundPythonPage() {
  return (
    <PlatformHubLayout title="Python Playground" description="Run Python in your browser." section="Playground" backHref="/playground" backLabel="Playground">
      <PlaygroundWorkspace language="python" />
    </PlatformHubLayout>
  );
}
