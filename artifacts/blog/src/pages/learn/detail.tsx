import { Link, useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { Badge } from "@/components/ui/badge";
import { getLearnPathBySlug } from "@/lib/learn-config";
import { getChaptersForPath, getLearnChapterHref } from "@/lib/content/learn-chapters/registry";
import NotFound from "@/pages/not-found";
import { ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-700 dark:text-green-400",
  intermediate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  advanced: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

export default function LearnDetailPage() {
  const [, params] = useRoute("/learn/:slug");
  const path = params?.slug ? getLearnPathBySlug(params.slug) : undefined;

  if (!path) return <NotFound />;

  const chapters = getChaptersForPath(path.slug);
  const totalMin = chapters.reduce((s, c) => s + c.minutes, 0);
  const Icon = path.icon;

  return (
    <HubPageLayout
      title={path.title}
      description={path.description}
      backHref="/learn"
      backLabel="All learning paths"
      section="Learning path"
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="outline">
          <BookOpen className="h-3 w-3 mr-1" />
          {chapters.length} lessons
        </Badge>
        <Badge variant="outline">~{Math.round(totalMin / 60)} hours</Badge>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-8">
        Work through each lesson in order. Every chapter includes explanations, code examples,
        and practice exercises. Beginner topics build toward advanced patterns and a capstone project.
      </p>

      <ol className="space-y-3">
        {chapters.map((chapter, i) => (
          <li key={chapter.slug}>
            <Link
              href={getLearnChapterHref(path.slug, chapter.slug)}
              className={cn(
                "flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all",
                "hover:border-primary/40 hover:shadow-md hover:bg-primary/[0.02] group",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary group-hover:bg-primary/15">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-primary group-hover:underline inline-flex items-center gap-2">
                    {chapter.title}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 transition-all" />
                  </p>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded",
                      LEVEL_COLORS[chapter.level],
                    )}
                  >
                    {chapter.level}
                  </span>
                  <span className="text-xs text-muted-foreground">{chapter.minutes} min</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{chapter.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </HubPageLayout>
  );
}
