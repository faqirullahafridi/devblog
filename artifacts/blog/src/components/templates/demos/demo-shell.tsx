import type { DemoTheme } from "@/lib/templates/demo-theme";
import type { DemoContent } from "@/lib/templates/demo-content";

type ShellProps = {
  theme: DemoTheme;
  content: DemoContent;
  children: React.ReactNode;
  navLinks?: Array<{ href: string; label: string }>;
};

export function DemoShell({ theme, content, children, navLinks }: ShellProps) {
  const links = navLinks ?? [
    { href: "#features", label: "Features" },
    { href: "#work", label: "Work" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen text-white antialiased" style={{ background: theme.surface }}>
      <header
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl"
        style={{ background: `${theme.surface}cc` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight" style={{ color: theme.accentLight }}>
            {theme.brand}
          </span>
          <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
          >
            {content.cta}
          </button>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 px-6 py-10 text-center text-sm" style={{ color: theme.muted }}>
        <p>
          {content.headline} — free template · Customize and deploy anywhere
        </p>
      </footer>
    </div>
  );
}

export function DemoHero({
  theme,
  content,
  badge,
  children,
}: {
  theme: DemoTheme;
  content: DemoContent;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${theme.accent}44, transparent)`,
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div>
          {badge && (
            <p
              className="mb-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: `${theme.accent}44`, color: theme.accentLight }}
            >
              {badge}
            </p>
          )}
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            {content.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed" style={{ color: theme.muted }}>
            {content.subheadline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl px-6 py-3 text-sm font-bold text-white shadow-xl"
              style={{ background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})` }}
            >
              {content.cta}
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              {content.secondaryCta}
            </button>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export function DemoStats({ theme, content }: { theme: DemoTheme; content: DemoContent }) {
  return (
    <section className="border-y border-white/10 px-6 py-10">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
        {content.stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold md:text-3xl" style={{ color: theme.accentLight }}>
              {s.value}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: theme.muted }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DemoFeatures({
  theme,
  content,
  id = "features",
}: {
  theme: DemoTheme;
  content: DemoContent;
  id?: string;
}) {
  return (
    <section id={id} className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Everything you need</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: theme.muted }}>
          Production-ready sections you can copy, customize, and ship today.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.features.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-white/10 p-6 transition-colors hover:border-white/20"
              style={{ background: `${theme.accent}08` }}
            >
              <span className="text-xl" style={{ color: theme.accentLight }}>
                {f.icon}
              </span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoPricing({ theme, content }: { theme: DemoTheme; content: DemoContent }) {
  return (
    <section id="pricing" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm" style={{ color: theme.muted }}>
          Start free. Upgrade when you scale.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {content.pricing.map((plan) => (
            <article
              key={plan.name}
              className="relative rounded-2xl border p-6"
              style={{
                borderColor: plan.featured ? theme.accent : "rgba(255,255,255,0.1)",
                background: plan.featured ? `${theme.accent}12` : "rgba(255,255,255,0.03)",
              }}
            >
              {plan.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase"
                  style={{ background: theme.accent, color: "#fff" }}
                >
                  Popular
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">{plan.price}</p>
              <ul className="mt-6 space-y-2 text-sm" style={{ color: theme.muted }}>
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span style={{ color: theme.accentLight }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-6 w-full rounded-lg py-2.5 text-sm font-semibold"
                style={
                  plan.featured
                    ? { background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`, color: "#fff" }
                    : { border: "1px solid rgba(255,255,255,0.15)", color: theme.muted }
                }
              >
                Choose {plan.name}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DemoMockBrowser({ theme, label }: { theme: DemoTheme; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3" style={{ background: "rgba(0,0,0,0.3)" }}>
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs text-white/40">{label}</span>
      </div>
      <div
        className="aspect-[4/3] p-6"
        style={{ background: `linear-gradient(135deg, ${theme.surface}, ${theme.accent}22)` }}
      >
        <div className="space-y-3">
          <div className="h-3 w-2/3 rounded bg-white/20" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg" style={{ background: `${theme.accent}33` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
