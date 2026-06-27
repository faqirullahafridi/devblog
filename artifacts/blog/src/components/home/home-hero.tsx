import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Briefcase, Code2, Layers, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const QUICK_LINKS: { href: string; label: string; desc: string; icon: LucideIcon }[] = [
  { href: "/search", label: "Articles", desc: "Tutorials & deep dives", icon: BookOpen },
  { href: "/tools", label: "Tools", desc: "Free dev utilities", icon: Wrench },
  { href: "/templates", label: "Templates", desc: "Download & preview", icon: Layers },
  { href: "/learn", label: "Learn", desc: "Structured paths", icon: Code2 },
  { href: "/ai", label: "AI", desc: "Code assistant", icon: Sparkles },
  { href: "/jobs", label: "Jobs", desc: "Remote IT roles", icon: Briefcase },
];

export function HomeHero() {
  return (
    <section className="border-b-2 border-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 lg:min-h-[660px]">
          {/* Copy block */}
          <div className="lg:col-span-7 flex flex-col justify-center py-16 md:py-24 lg:py-28 lg:pr-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground">
            <p className="inline-flex w-fit items-center border-2 border-foreground bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary-foreground brutal-shadow-sm mb-8">
              Developer knowledge hub
            </p>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-tight text-foreground">
              Build better
              <span className="block text-primary">software.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
              Articles, tools, templates, and learning paths — one place for developers who care about craft.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href="/search">
                  Read articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[160px]">
                <Link href="/tools">Open tools</Link>
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-0 border-2 border-foreground brutal-shadow-sm max-w-md">
              {[
                { label: "Articles", value: "100+" },
                { label: "Tools", value: "12" },
                { label: "Templates", value: "50+" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`bg-card px-4 py-3 ${i < 2 ? "border-r-2 border-foreground" : ""}`}
                >
                  <dt className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{stat.label}</dt>
                  <dd className="text-xl font-black text-foreground">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Visual + quick links */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative flex-1 min-h-[340px] md:min-h-[400px] lg:min-h-0 border-b-2 border-foreground bg-muted overflow-hidden">
              <img
                src="/hero-devblog.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 opacity-90"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,hsl(var(--background)/0.95)_100%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Free for builders</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">No paywalls on tools, refs, or learning paths.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-[2px] bg-foreground border-t-2 border-foreground">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex flex-col gap-2 bg-card p-4 transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                    <span className="font-black text-sm leading-none">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground group-hover:text-primary-foreground/80 leading-snug">
                      {item.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
