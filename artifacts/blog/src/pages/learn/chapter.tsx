import { Link, useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getLearnChapter,
  getChaptersForPath,
  getLearnChapterHref,
} from "@/lib/content/learn-chapters/registry";
import { getLearnPathBySlug } from "@/lib/learn-config";
import NotFound from "@/pages/not-found";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LearnChapterPage() {
  const [, params] = useRoute("/learn/:pathSlug/:chapterSlug");
  const pathSlug = params?.pathSlug;
  const chapterSlug = params?.chapterSlug;
  const path = pathSlug ? getLearnPathBySlug(pathSlug) : undefined;
  const chapter =
    pathSlug && chapterSlug ? getLearnChapter(pathSlug, chapterSlug) : undefined;

  if (!path || !chapter) return <NotFound />;

  const chapters = getChaptersForPath(pathSlug!);
  const index = chapters.findIndex((c) => c.slug === chapterSlug);
  const prev = index > 0 ? chapters[index - 1] : null;
  const next = index < chapters.length - 1 ? chapters[index + 1] : null;

  return (
    <HubPageLayout
      title={chapter.title}
      description={chapter.description}
      backHref={`/learn/${pathSlug}`}
      backLabel={path.title}
      section="Lesson"
      footer={
        <nav className="mt-10 pt-8 border-t flex flex-wrap justify-between gap-4">
          {prev ? (
            <Button asChild variant="outline">
              <Link href={getLearnChapterHref(pathSlug!, prev.slug)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {prev.title}
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild>
              <Link href={getLearnChapterHref(pathSlug!, next.slug)}>
                {next.title}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : null}
        </nav>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <Badge variant="outline" className="capitalize">
          {chapter.level}
        </Badge>
        <Badge variant="secondary">~{chapter.minutes} min read</Badge>
        <Badge variant="outline">
          Lesson {index + 1} of {chapters.length}
        </Badge>
      </div>
      <MarkdownContent content={chapter.content} />
    </HubPageLayout>
  );
}
