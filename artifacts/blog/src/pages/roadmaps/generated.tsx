import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { getRoadmap, updateRoadmapProgress } from "@/lib/platform-api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { seoTitle } from "@/lib/site-config";

export default function RoadmapGeneratedPage() {
  const params = useParams<{ id: string }>();
  const slug = params.id ?? "";
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["roadmap", slug],
    queryFn: () => getRoadmap(slug),
    enabled: !!slug,
  });

  const toggle = useMutation({
    mutationFn: ({ key, done }: { key: string; done: boolean }) => updateRoadmapProgress(slug, key, done),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap", slug] }),
  });

  if (isLoading || !data) {
    return (
      <PlatformHubLayout title="Loading…" description="" section="Roadmaps" backHref="/roadmaps" backLabel="Roadmaps">
        <div className="animate-pulse h-40 bg-muted rounded-xl" />
      </PlatformHubLayout>
    );
  }

  const p = data.payload;
  const done = new Set(data.progress.filter((x) => x.completed).map((x) => x.itemKey));

  return (
    <PlatformHubLayout title={p.title} description={p.summary} section="Roadmaps" backHref="/roadmaps/generator" backLabel="Generator">
      <SeoHead title={seoTitle(p.title)} description={p.summary} url={siteUrl(`/roadmaps/generated/${slug}`)} />
      <p className="text-sm text-muted-foreground mb-6">Estimated timeline: <strong>{p.totalWeeks} weeks</strong></p>

      <ol className="space-y-4 mb-10">
        {p.steps.map((step, i) => (
          <li key={step.key} className="flex gap-4 rounded-xl border bg-card p-4">
            <div className="flex items-start pt-1">
              {data.isOwner ? (
                <Checkbox
                  checked={done.has(step.key)}
                  onCheckedChange={(c) => toggle.mutate({ key: step.key, done: !!c })}
                />
              ) : (
                <span className="text-xs font-bold text-primary w-6">{i + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{step.estimatedWeeks} weeks</p>
              {step.learnHref && (
                <Link href={step.learnHref} className="text-sm text-primary hover:underline mt-2 inline-block">
                  Open learning path →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <h2 className="font-bold mb-3">Resources</h2>
      <ul className="grid sm:grid-cols-2 gap-2">
        {p.resources.map((r) => (
          <li key={r.href}>
            <Link href={r.href} className="text-sm text-primary hover:underline">{r.title}</Link>
            <span className="text-xs text-muted-foreground ml-2">({r.type})</span>
          </li>
        ))}
      </ul>
    </PlatformHubLayout>
  );
}
