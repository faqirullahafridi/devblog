import { useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { MarkdownContent } from "@/components/markdown-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getInterviewTopicBySlug } from "@/lib/interview-config";
import { INTERVIEW_GUIDES } from "@/lib/content/interview-guides";
import NotFound from "@/pages/not-found";

export default function InterviewDetailPage() {
  const [, params] = useRoute("/interview/:slug");
  const topic = params?.slug ? getInterviewTopicBySlug(params.slug) : undefined;

  if (!topic) return <NotFound />;

  const Icon = topic.icon;
  const guide = INTERVIEW_GUIDES[topic.slug] ?? "";

  return (
    <HubPageLayout
      title={topic.title}
      description={topic.description}
      backHref="/interview"
      backLabel="All topics"
      section="Interview prep"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="outline">{topic.questions.length} questions</Badge>
      </div>

      {guide && (
        <section className="mb-10 rounded-xl border bg-muted/20 p-5">
          <h2 className="text-lg font-bold mb-4">Study guide</h2>
          <MarkdownContent content={guide} />
        </section>
      )}

      <h2 className="text-lg font-bold mb-4">Practice questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {topic.questions.map((item, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left font-medium">
              <span className="pr-4">
                <span className="text-muted-foreground mr-2">Q{i + 1}.</span>
                {item.q}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap pl-6 border-l-2 border-primary/20 ml-1">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </HubPageLayout>
  );
}
