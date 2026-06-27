import { PlatformHubLayout, PlatformCard, PlatformCardGrid } from "@/components/platform/platform-hub-layout";

export default function RoadmapsIndexPage() {
  return (
    <PlatformHubLayout
      title="Developer Roadmaps"
      description="Personalized learning paths integrated with our courses, interview prep, and blog."
      section="Platform"
    >
      <PlatformCardGrid>
        <PlatformCard href="/roadmaps/generator" title="Roadmap Generator" description="Pick your level and goal — get a tailored plan." badge="New" />
        <PlatformCard href="/learn" title="Learning Paths" description="Follow structured chapters from our learn hub." />
        <PlatformCard href="/challenges" title="Coding Challenges" description="Practice daily and track progress." />
      </PlatformCardGrid>
    </PlatformHubLayout>
  );
}
