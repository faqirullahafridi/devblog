import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { PlaygroundWorkspace } from "@/components/platform/playground-workspace";

export default function PlaygroundSqlPage() {
  return (
    <PlatformHubLayout title="SQL Playground" description="Practice queries on a sample database." section="Playground" backHref="/playground" backLabel="Playground">
      <PlaygroundWorkspace language="sql" />
    </PlatformHubLayout>
  );
}
