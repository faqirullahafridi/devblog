import { Link, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlatformHubLayout } from "@/components/platform/platform-hub-layout";
import { listJobs, listJobSources, getJob, toggleJobBookmark, type Job } from "@/lib/platform-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SeoHead, siteUrl } from "@/components/seo-head";
import { useEffect, useState } from "react";
import { JobTranslatableContent } from "@/components/jobs/job-translatable-content";
import { toast } from "sonner";
import { platformEvents } from "@/lib/analytics";
import { Globe, MapPin } from "lucide-react";

const CATEGORIES = ["frontend", "backend", "full-stack", "react", "nodejs", "django", "python", "qa", "devops", "remote"];

const SOURCE_LABELS: Record<string, string> = {
  remoteok: "RemoteOK",
  remotive: "Remotive",
  arbeitnow: "Arbeitnow",
  themuse: "The Muse",
  jooble: "Jooble",
  everjobs: "Ever Jobs",
};

const HIDDEN_DEFAULT_SOURCES = new Set(["arbeitnow"]);

function SourceBadge({ source }: { source?: string | null }) {
  if (!source) return null;
  return <Badge variant="outline" className="text-[10px]">{SOURCE_LABELS[source] ?? source}</Badge>;
}

const PAGE_SIZE = 50;

export default function JobsIndexPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const [allJobs, setAllJobs] = useState<Job[]>([]);

  const filters = { search, category, source, region };

  useEffect(() => {
    setPage(1);
    setAllJobs([]);
  }, [search, category, source, region]);

  const { data: sources } = useQuery({ queryKey: ["jobs", "sources"], queryFn: listJobSources });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["jobs", "list", filters, page],
    queryFn: () =>
      listJobs({
        search: search || undefined,
        category: category || undefined,
        source: source || undefined,
        region: region || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  useEffect(() => {
    if (!data?.jobs) return;
    const jobs =
      source
        ? data.jobs
        : data.jobs.filter((j) => !j.source || !HIDDEN_DEFAULT_SOURCES.has(j.source));
    setAllJobs((prev) => {
      if (page === 1) return jobs;
      const slugs = new Set(prev.map((j) => j.slug));
      return [...prev, ...jobs.filter((j) => !slugs.has(j.slug))];
    });
  }, [data, page, source]);

  const total = data?.total ?? 0;
  const hasMore = allJobs.length < total;

  return (
    <PlatformHubLayout
      title="Developer Jobs"
      description="IT roles from RemoteOK, Remotive, The Muse, Jooble, and more. European Arbeitnow listings are available when you select that source."
      section="Platform"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Search jobs…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources (excl. Arbeitnow)</option>
          {(sources ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
              {s.id === "arbeitnow" ? " — German/EU" : ""}
            </option>
          ))}
        </select>
        <select className="h-9 rounded-md border bg-background px-3 text-sm" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          <option value="global">Global</option>
          <option value="europe">Europe</option>
          <option value="pakistan">Pakistan</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(sources ?? [])
          .filter((s) => !s.hiddenByDefault || source === s.id)
          .map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSource(source === s.id ? "" : s.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                source === s.id
                  ? "border-primary bg-primary/10 text-primary font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {s.region === "pakistan" ? <MapPin className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
              {s.label}
            </button>
          ))}
      </div>

      {isLoading && page === 1 ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse border-2 border-foreground" />)}</div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            Showing {allJobs.length} of {total} active IT jobs · updated daily
            {source === "arbeitnow" && " · German listings — use Translate on each job"}
          </p>
          <div className="space-y-3">
            {allJobs.map((job) => (
              <Link key={job.slug} href={`/jobs/${job.slug}`} className="block border-2 border-foreground bg-card p-4 brutal-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:brutal-shadow transition-all">
                <div className="flex flex-wrap gap-2 mb-1">
                  <Badge variant="outline">{job.category}</Badge>
                  {job.remote && <Badge variant="secondary">Remote</Badge>}
                  {job.region === "pakistan" && <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))] text-white border-foreground">Pakistan</Badge>}
                  <SourceBadge source={job.source} />
                </div>
                <h2 className="font-semibold">{job.title}</h2>
                <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
                {job.salaryRange && <p className="text-xs text-muted-foreground mt-1">{job.salaryRange}</p>}
              </Link>
            ))}
            {allJobs.length === 0 && !isFetching && (
              <p className="text-muted-foreground text-sm">No listings match your filters. Jobs sync daily from external sources.</p>
            )}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
                {isFetching ? "Loading…" : `Load more (${allJobs.length} of ${total})`}
              </Button>
            </div>
          )}
        </>
      )}
    </PlatformHubLayout>
  );
}

export function JobsCategoryPage() {
  const params = useParams<{ category: string }>();
  const category = params.category ?? "";
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", "cat", category],
    queryFn: () => listJobs({ category, limit: PAGE_SIZE }),
  });

  return (
    <PlatformHubLayout title={`${category} jobs`} description={`Open roles in ${category}.`} section="Jobs" backHref="/jobs" backLabel="All jobs">
      {isLoading ? null : (
        <div className="space-y-3">
          {data?.jobs.map((job) => (
            <Link key={job.slug} href={`/jobs/${job.slug}`} className="block rounded-xl border p-4 hover:border-primary/40">
              <h2 className="font-semibold">{job.title}</h2>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </Link>
          ))}
        </div>
      )}
    </PlatformHubLayout>
  );
}

export function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const qc = useQueryClient();
  const { data: job, isLoading } = useQuery({ queryKey: ["job", slug], queryFn: () => getJob(slug), enabled: !!slug });

  const bookmark = useMutation({
    mutationFn: () => toggleJobBookmark(slug),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["job", slug] });
      platformEvents.jobBookmark(slug, res.bookmarked);
      toast.success("Bookmark updated");
    },
  });

  if (isLoading || !job) {
    return (
      <PlatformHubLayout title="Loading…" description="" section="Jobs" backHref="/jobs" backLabel="Jobs">
        <div className="h-40 bg-muted animate-pulse border-2 border-foreground" />
      </PlatformHubLayout>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description.slice(0, 500),
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: { "@type": "Place", address: job.location },
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: "FULL_TIME",
  };

  return (
    <PlatformHubLayout title={job.title} description={`${job.company} — ${job.location}`} section="Jobs" backHref="/jobs" backLabel="Jobs">
      <SeoHead title={`${job.title} at ${job.company}`} description={job.description.slice(0, 155)} url={siteUrl(`/jobs/${slug}`)} jsonLd={jsonLd} />
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{job.category}</Badge>
        {job.remote && <Badge variant="secondary">Remote</Badge>}
        {job.region === "pakistan" && <Badge className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))] text-white border-foreground">Pakistan</Badge>}
        <SourceBadge source={job.source} />
        {job.salaryRange && <Badge variant="outline">{job.salaryRange}</Badge>}
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <JobTranslatableContent
          slug={slug}
          field="description"
          content={job.description}
          showTranslate={job.mayNeedTranslation ?? true}
        />
      </div>
      {job.requirements && (
        <>
          <h2 className="font-bold mb-2">Requirements</h2>
          <JobTranslatableContent
            slug={slug}
            field="requirements"
            content={job.requirements}
            showTranslate={job.mayNeedTranslation ?? true}
          />
        </>
      )}
      <div className="flex flex-wrap gap-2 mt-8">
        <Button asChild><a href={job.applyUrl} target="_blank" rel="noopener noreferrer">Apply now</a></Button>
        <Button variant="outline" onClick={() => bookmark.mutate()}>{job.bookmarked ? "Remove bookmark" : "Bookmark"}</Button>
      </div>
    </PlatformHubLayout>
  );
}
