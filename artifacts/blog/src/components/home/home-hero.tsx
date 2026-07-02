import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, Briefcase, Code2, Layers, Server, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HERO_IMAGE } from "@/lib/hero-image";
import { cn } from "@/lib/utils";

const HERO_BUTTONS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/api-sources", label: "APIs", icon: Server },
  { href: "/ai/chat", label: "AI", icon: Sparkles },
  { href: "/search", label: "Articles", icon: BookOpen },
];

const QUICK_LINKS: { href: string; label: string; desc: string; icon: LucideIcon }[] = [
  { href: "/tools", label: "Tools", desc: "Free dev utilities", icon: Wrench },
  { href: "/templates", label: "Templates", desc: "Download & preview", icon: Layers },
  { href: "/learn", label: "Learn", desc: "Structured paths", icon: Code2 },
];

function HeroActionButtons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3">
        {HERO_BUTTONS.map(({ href, label, icon: Icon }) => (
          <Button
            key={href}
            asChild
            size="lg"
            className="h-11 w-full gap-2 border-2 border-foreground bg-primary text-primary-foreground font-black uppercase tracking-wider brutal-shadow-sm hover:bg-primary/90 hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <Link href={href}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function HomeHero() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const { mobile, desktop, lqip } = HERO_IMAGE;

  return (
    <section className="border-b-2 border-foreground">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 lg:min-h-[520px]">
          {/* Copy block */}
          <div className="lg:col-span-7 flex flex-col justify-center py-10 md:py-14 lg:py-16 lg:pr-10 border-b-2 lg:border-b-0 lg:border-r-2 border-foreground">
            <p className="inline-flex w-fit items-center border-2 border-foreground bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary-foreground brutal-shadow-sm mb-5">
              Developer knowledge hub
            </p>

            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-tight text-foreground">
              Build better
              <span className="block text-primary">software.</span>
            </h1>

            <p className="mt-4 max-w-lg text-base md:text-lg font-medium text-muted-foreground leading-relaxed">
              Articles, tools, templates, and learning paths — one place for developers who care about craft.
            </p>

            <HeroActionButtons className="mt-7 max-w-md" />

            <dl className="mt-8 grid grid-cols-3 gap-0 border-2 border-foreground brutal-shadow-sm max-w-md">
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
            <div
              className="relative flex-1 min-h-[240px] md:min-h-[300px] lg:min-h-0 border-b-2 border-foreground bg-muted overflow-hidden"
              style={{
                backgroundImage: `url(${lqip})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <picture>
                <source
                  media="(max-width: 1023px)"
                  srcSet={mobile.webp}
                  type="image/webp"
                />
                <source
                  media="(max-width: 1023px)"
                  srcSet={mobile.jpg}
                  type="image/jpeg"
                />
                <source
                  media="(min-width: 1024px)"
                  srcSet={desktop.webp}
                  type="image/webp"
                />
                <source
                  media="(min-width: 1024px)"
                  srcSet={desktop.jpg}
                  type="image/jpeg"
                />
                <img
                  src={desktop.jpg}
                  alt=""
                  width={desktop.width}
                  height={desktop.height}
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover grayscale contrast-125 transition-opacity duration-300",
                    heroLoaded ? "opacity-90" : "opacity-0",
                  )}
                  fetchPriority="high"
                  decoding="sync"
                  onLoad={() => setHeroLoaded(true)}
                />
              </picture>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,hsl(var(--background)/0.95)_100%)]" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Free for builders</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">No paywalls on tools, refs, or learning paths.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-[2px] bg-foreground border-t-2 border-foreground">
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
