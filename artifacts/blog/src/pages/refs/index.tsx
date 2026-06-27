import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { HubCardGrid } from "@/components/hub/hub-card-grid";
import { REFS, getRefHref } from "@/lib/refs-config";

export default function RefsIndexPage() {
  return (
    <HubIndexLayout
      title="References & Cheatsheets"
      description="In-depth guides for Git, HTTP, Python, JavaScript, SQL, CSS, TypeScript, Node.js, JWT, and more — beginner to intermediate."
      section="References"
    >
      <HubCardGrid items={REFS} getHref={getRefHref} />
    </HubIndexLayout>
  );
}
