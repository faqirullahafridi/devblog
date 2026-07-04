import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/public-layout";
import { SeoHead } from "@/components/seo-head";
import { SITE_DESCRIPTION, SITE_NAME, seoTitle } from "@/lib/site-config";
import { useGetDeveloperProfile, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail, PenLine, Search, Wrench, User, BookMarked, Code, GraduationCap, MessageSquare, Link2 } from "lucide-react";
import { TOOLS } from "@/lib/tools-config";
import { REFS } from "@/lib/refs-config";
import { SNIPPETS } from "@/lib/snippets-config";
import { LEARN_PATHS } from "@/lib/learn-config";
import { HubSeoIntro } from "@/components/hub/hub-seo-intro";

export default function AboutPage() {
  const { data: profile } = useGetDeveloperProfile();
  const { data: categories } = useListCategories();

  return (
    <PublicLayout>
      <SeoHead title={seoTitle("About")} description={SITE_DESCRIPTION} />
      <div className="border-b-2 border-foreground bg-muted">
        <div className="container mx-auto px-4 py-14 md:py-20 max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            About this site
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            A home for developers who care about craft
          </h1>
          <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
            {SITE_NAME} is a focused knowledge hub for tutorials, deep dives, and practical tools —
            covering web development, Python, JavaScript, and the craft of building software well.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl space-y-14">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            What you&apos;ll find here
          </h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Articles &amp; tutorials</strong> — clear, practical
              posts on topics that matter to working developers, from fundamentals to production patterns.
            </li>
            <li>
              <strong className="text-foreground">Organized by topic</strong> — browse by category
              {categories && categories.length > 0 && (
                <> such as {categories.slice(0, 4).map((c) => c.name).join(", ")}</>
              )}
              .
            </li>
            <li>
              <strong className="text-foreground">Developer tools</strong> — {TOOLS.length} free
              browser-based utilities (JSON, JWT, regex, SQL, and more) at{" "}
              <Link href="/tools" className="text-primary hover:underline">/tools</Link>.
            </li>
            <li>
              <strong className="text-foreground">References &amp; snippets</strong> — {REFS.length} cheatsheets
              and {SNIPPETS.length} copy-paste code snippets for everyday tasks.
            </li>
            <li>
              <strong className="text-foreground">Learning paths &amp; interview prep</strong> — {LEARN_PATHS.length}{" "}
              curated journeys plus Q&amp;A by topic to help you grow and interview with confidence.
            </li>
            <li>
              <strong className="text-foreground">Curated resources</strong> — hand-picked docs, tools, and communities
              at <Link href="/resources" className="text-primary hover:underline">/resources</Link>.
            </li>
            <li>
              <strong className="text-foreground">Newsletter</strong> — get new posts in your inbox.
              Subscribe from the homepage; we use double opt-in and respect your privacy.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <PenLine className="h-6 w-6 text-primary" />
            Our mission
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We believe good software comes from clear thinking, solid fundamentals, and attention to detail.
            This site exists to share what we learn along the way — not hype, but useful knowledge you can
            apply on real projects. Every article aims to respect your time: structured, searchable, and
            written for developers who build and ship.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/search"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <Search className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Search articles</h3>
            <p className="text-sm text-muted-foreground mt-1">Find tutorials and guides across the blog.</p>
          </Link>
          <Link
            href="/tools"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <Wrench className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Developer tools</h3>
            <p className="text-sm text-muted-foreground mt-1">Free utilities that run entirely in your browser.</p>
          </Link>
          <Link
            href="/refs"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <BookMarked className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">References</h3>
            <p className="text-sm text-muted-foreground mt-1">Git, HTTP, Python, SQL, and more cheatsheets.</p>
          </Link>
          <Link
            href="/snippets"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <Code className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Snippets</h3>
            <p className="text-sm text-muted-foreground mt-1">Copy-paste code for common dev tasks.</p>
          </Link>
          <Link
            href="/learn"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <GraduationCap className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Learning paths</h3>
            <p className="text-sm text-muted-foreground mt-1">Step-by-step journeys from basics to practice.</p>
          </Link>
          <Link
            href="/interview"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group"
          >
            <MessageSquare className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Interview prep</h3>
            <p className="text-sm text-muted-foreground mt-1">Technical and behavioral Q&amp;A by topic.</p>
          </Link>
          <Link
            href="/resources"
            className="rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 transition-colors group sm:col-span-2 lg:col-span-1"
          >
            <Link2 className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-semibold group-hover:text-primary transition-colors">Resources</h3>
            <p className="text-sm text-muted-foreground mt-1">Curated docs, tools, and communities.</p>
          </Link>
        </section>

        {profile && (
          <section className="rounded-xl border bg-muted/20 p-6 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Who runs {SITE_NAME}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {SITE_NAME} is created and maintained by{" "}
              <strong className="text-foreground">{profile.name}</strong>
              {profile.headline ? ` — ${profile.headline}` : ""}.
              {profile.aboutMe && (
                <> {profile.aboutMe.split(".").slice(0, 1).join(".")}.</>
              )}
            </p>
            <Button asChild variant="outline">
              <Link href="/developer">View developer profile</Link>
            </Button>
          </section>
        )}

        <section className="space-y-4 border-t pt-10">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Get in touch
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions, feedback, corrections, or partnership inquiries? We&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/terms">Terms of Service</Link>
            </Button>
          </div>
        </section>

        <HubSeoIntro path="/about" />
      </div>
    </PublicLayout>
  );
}
