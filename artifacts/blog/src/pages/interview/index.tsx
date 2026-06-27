import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { HubCardGrid } from "@/components/hub/hub-card-grid";
import { INTERVIEW_TOPICS, getInterviewHref } from "@/lib/interview-config";

export default function InterviewIndexPage() {
  return (
    <HubIndexLayout
      title="Interview Prep"
      description="Study guides and 100+ technical & behavioral questions with detailed answers — JavaScript, Python, SQL, React, TypeScript, Node.js, system design, and more."
      section="Interview"
    >
      <HubCardGrid
        items={INTERVIEW_TOPICS.map((t) => ({
          slug: t.slug,
          name: t.title,
          description: t.description,
          icon: t.icon,
        }))}
        getHref={getInterviewHref}
      />
    </HubIndexLayout>
  );
}
