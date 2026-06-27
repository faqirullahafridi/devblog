import { Link } from "wouter";
import { HubIndexLayout } from "@/components/hub/hub-page-layout";
import { HubCardGrid } from "@/components/hub/hub-card-grid";
import {
  LEARN_CATEGORIES,
  LEARN_PATHS,
  getLearnHref,
  getPathsByCategory,
} from "@/lib/learn-config";
import { getChaptersForPath, getLearnChapterHref } from "@/lib/content/learn-chapters/registry";
import { BookOpen, Clock } from "lucide-react";

export default function LearnIndexPage() {
  return (
    <HubIndexLayout
      title="Learning Paths"
      description="40 structured curricula from zero to production — languages, frontend, databases, DevOps, APIs, testing, and security."
      section="Learn"
    >
      <div className="mb-10 rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground leading-relaxed">
        <p className="font-medium text-foreground mb-1">How to use these paths</p>
        <p>
          Each path is a full course: start at Lesson 1, read the tutorial, try the practice
          exercises, then move to the next chapter. Paths link to our tools, snippets, and
          references along the way. Browse by category below or jump into any path.
        </p>
      </div>

      <HubCardGrid
        items={LEARN_PATHS.map((p) => {
          const chapters = getChaptersForPath(p.slug);
          const totalMin = chapters.reduce((s, c) => s + c.minutes, 0);
          const category = LEARN_CATEGORIES.find((c) => c.id === p.category);
          return {
            slug: p.slug,
            name: p.title,
            description: `${category?.title ?? p.category} · ${chapters.length} lessons · ~${Math.round(totalMin / 60) || p.estimatedHours || "?"}h — ${p.description}`,
            icon: p.icon,
          };
        })}
        getHref={getLearnHref}
      />

      <div className="mt-14 space-y-14">
        {LEARN_CATEGORIES.map((category) => {
          const paths = getPathsByCategory(category.id);
          if (paths.length === 0) return null;
          return (
            <section key={category.id}>
              <div className="mb-6">
                <h2 className="text-xl font-bold">{category.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              </div>
              <div className="space-y-10">
                {paths.map((path) => {
                  const chapters = getChaptersForPath(path.slug);
                  if (chapters.length === 0) return null;
                  return (
                    <div key={path.slug}>
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">
                          <Link href={getLearnHref(path.slug)} className="hover:text-primary">
                            {path.title}
                          </Link>
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {chapters.length} lessons
                        </span>
                      </div>
                      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {chapters.slice(0, 6).map((ch, i) => (
                          <li key={ch.slug}>
                            <Link
                              href={getLearnChapterHref(path.slug, ch.slug)}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                            >
                              <span className="text-xs font-mono text-primary/70">{i + 1}.</span>
                              {ch.title}
                            </Link>
                          </li>
                        ))}
                      </ol>
                      {chapters.length > 6 && (
                        <Link
                          href={getLearnHref(path.slug)}
                          className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          +{chapters.length - 6} more lessons →
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </HubIndexLayout>
  );
}
