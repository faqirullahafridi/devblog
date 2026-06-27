import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { HubPageLayout } from "@/components/hub/hub-page-layout";
import { MarkdownContent } from "@/components/markdown-content";
import { getRefBySlug } from "@/lib/refs-config";
import { getToolHref } from "@/lib/tools-config";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

function scrollToHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;
  requestAnimationFrame(() => {
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export default function RefDetailPage() {
  const [, params] = useRoute("/refs/:slug");
  const slug = params?.slug?.split("#")[0];
  const ref = slug ? getRefBySlug(slug) : undefined;

  useEffect(() => {
    const run = () => scrollToHash();
    run();
    const t = setTimeout(run, 200);
    window.addEventListener("hashchange", run);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", run);
    };
  }, [ref?.slug]);

  if (!ref) return <NotFound />;

  const Icon = ref.icon;

  return (
    <HubPageLayout
      title={ref.name}
      description={ref.description}
      backHref="/refs"
      backLabel="All references"
      section="Reference"
      footer={
        <div className="mt-10 pt-8 border-t flex flex-wrap gap-3">
          {ref.relatedTool && (
            <Button asChild variant="outline">
              <Link href={getToolHref(ref.relatedTool)}>Try related tool →</Link>
            </Button>
          )}
          {ref.relatedLearn && (
            <Button asChild variant="ghost">
              <Link href={ref.relatedLearn}>
                <BookOpen className="h-4 w-4 mr-2" />
                Full learning path →
              </Link>
            </Button>
          )}
        </div>
      }
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <MarkdownContent content={ref.content} />
    </HubPageLayout>
  );
}
