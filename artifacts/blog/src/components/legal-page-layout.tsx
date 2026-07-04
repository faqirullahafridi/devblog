import { PublicLayout } from "@/components/layout/public-layout";
import { ContentShell } from "@/components/layout/content-shell";
import { Link } from "wouter";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <ContentShell width="default" mainClassName="max-w-3xl mx-auto">
        <article>
          <header className="mb-10 border-b border-border pb-8">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-3">Last updated: {lastUpdated}</p>
          </header>
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:text-foreground [&_h3]:font-medium [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
            {children}
          </div>
          <p className="mt-12 pt-8 border-t border-border text-sm text-muted-foreground">
            See also:{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            {" · "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" · "}
            <Link href="/contact" className="text-primary hover:underline">Contact</Link>
            {" · "}
            <Link href="/about" className="text-primary hover:underline">About</Link>
            {" · "}
            <Link href="/developer" className="text-primary hover:underline">Developer Profile</Link>
          </p>
        </article>
      </ContentShell>
    </PublicLayout>
  );
}
