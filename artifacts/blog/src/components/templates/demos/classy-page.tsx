import type { CSSProperties } from "react";
import type { TemplateDef } from "@/lib/templates-config";
import { getRichDemoContent } from "@/lib/templates/demo-content";
import { getTemplateImages } from "@/lib/templates/template-images";
import { getTemplatePageConfig, type SectionId, type TemplatePageConfig } from "@/lib/templates/page-config";
import { buildTemplateUi, type TemplateUi } from "@/lib/templates/template-ui";
import { categoryFlags } from "@/lib/templates/template-design";

function Img({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: CSSProperties }) {
  return <img src={src} alt={alt} className={className} style={style} loading="lazy" decoding="async" />;
}

type Props = { template: TemplateDef };

function radiusClass(r: TemplatePageConfig["radius"]) {
  return r === "none" ? "rounded-none" : r === "lg" ? "rounded-xl" : "rounded-md";
}

type SectionProps = {
  cfg: TemplatePageConfig;
  ui: TemplateUi;
  content: ReturnType<typeof getRichDemoContent>;
  img: ReturnType<typeof getTemplateImages>;
  template: TemplateDef;
};

function SectionHero({ cfg, ui, content, img, template }: SectionProps) {
  const { palette: p } = cfg;
  const r = radiusClass(cfg.radius);

  if (cfg.hero === "minimal") {
    return (
      <section className="px-8 py-20 max-w-4xl" style={{ fontFamily: cfg.fontHeading }}>
        <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: p.primary }}>{content.tagline}</p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: p.text }}>{content.headline}</h1>
        <p className="mt-5 text-lg leading-relaxed max-w-2xl" style={{ color: p.muted }}>{content.intro}</p>
        <div className="mt-8 flex gap-3 flex-wrap">
          <button type="button" className={`px-6 py-3 ${ui.btnPrimary(r).className}`} style={ui.btnPrimary(r).style}>{content.cta}</button>
          <button type="button" className={`px-6 py-3 ${ui.btnSecondary(r).className}`} style={ui.btnSecondary(r).style}>{content.secondaryCta}</button>
        </div>
      </section>
    );
  }

  if (cfg.hero === "split" || cfg.hero === "split-reverse") {
    const textFirst = cfg.hero === "split";
    const textBlock = (
      <div className="flex flex-col justify-center p-8 md:p-14 lg:p-16">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: p.primary }}>{template.categoryTitle}</p>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: cfg.fontHeading, color: p.text }}>{content.headline}</h1>
        <p className="mt-4 leading-relaxed" style={{ color: p.muted }}>{content.intro}</p>
        <button type="button" className={`mt-8 self-start px-6 py-3 ${ui.btnPrimary(r).className}`} style={ui.btnPrimary(r).style}>{content.cta}</button>
      </div>
    );
    const imgBlock = <Img src={img.dashboard} alt="Preview" className="w-full h-full min-h-[320px] object-cover" />;
    return (
      <section className="grid lg:grid-cols-2 min-h-[420px]" style={{ background: p.bg }}>
        {textFirst ? textBlock : imgBlock}
        {textFirst ? imgBlock : textBlock}
      </section>
    );
  }

  return (
    <section className="relative min-h-[520px] flex items-end">
      <Img src={img.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={ui.heroOverlay(!!p.dark)} />
      <div className="relative z-10 p-8 md:p-14 max-w-3xl text-white">
        <p className="text-xs uppercase tracking-[0.25em] mb-3 opacity-90">{content.brand}</p>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ fontFamily: cfg.fontHeading }}>{content.headline}</h1>
        <p className="mt-4 text-lg text-white/90 max-w-xl">{content.tagline}</p>
        <button type="button" className={`mt-8 px-6 py-3 ${ui.btnPrimary(r).className}`} style={ui.btnPrimary(r).style}>{content.cta}</button>
      </div>
    </section>
  );
}

function SectionIntro({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  return (
    <section className="py-16 px-8" style={ui.sectionBg("alt")}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-[180px_1fr] gap-8">
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: p.primary }}>Overview</p>
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>{content.aboutTitle}</h2>
          <p className="leading-relaxed text-lg" style={{ color: p.muted }}>{content.aboutBody}</p>
        </div>
      </div>
    </section>
  );
}

function SectionServices({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);

  if (cfg.servicesLayout === "rows") {
    return (
      <section className="py-16 px-8" style={ui.sectionBg("default")}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: cfg.fontHeading, color: p.text }}>What we deliver</h2>
          <p className="mb-10" style={{ color: p.muted }}>End-to-end capabilities for {content.brand} clients.</p>
          <div className="divide-y" style={{ borderColor: p.border }}>
            {content.services.map((s, i) => (
              <article key={s.title} className="grid md:grid-cols-[1fr_2fr_auto] gap-4 py-8 items-start">
                <span className="text-4xl font-bold opacity-20" style={{ color: p.primary }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold text-lg" style={{ color: p.text }}>{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{s.desc}</p>
                </div>
                {s.price && <p className="text-sm font-semibold shrink-0" style={{ color: p.primary }}>{s.price}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (cfg.servicesLayout === "bento") {
    return (
      <section className="py-16 px-8" style={ui.sectionBg("alt")}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: cfg.fontHeading, color: p.text }}>Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-4 auto-rows-fr">
            {content.services.map((s, i) => {
              const card = ui.card(r);
              return (
              <article
                key={s.title}
                className={`${card.className} p-6 ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                style={{ ...card.style, ...(i === 0 ? { backgroundImage: `linear-gradient(135deg, ${p.bg} 40%, ${p.bgAlt})` } : {}) }}
              >
                {i === 0 && <Img src={img.projects[0]} alt="" className="aspect-[21/9] w-[calc(100%+3rem)] max-w-none object-cover mb-4 -mx-6 -mt-6" />}
                <h3 className="font-semibold" style={{ color: p.text }}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{s.desc}</p>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  const cols = cfg.gridCols === 2 ? "md:grid-cols-2" : cfg.gridCols === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <section className="py-16 px-8" style={ui.sectionBg("default")}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: cfg.fontHeading, color: p.text }}>Services</h2>
        <p className="mb-10" style={{ color: p.muted }}>What we offer clients and partners.</p>
        <div className={`grid gap-6 ${cols}`}>
          {content.services.map((s, i) => {
            const card = ui.card(r);
            return (
            <article key={s.title} className={`${card.className} overflow-hidden`} style={card.style}>
              <Img src={img.projects[i % img.projects.length]} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <h3 className="font-semibold" style={{ color: p.text }}>{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{s.desc}</p>
                {s.price && <p className="mt-3 text-sm font-semibold" style={{ color: p.primary }}>{s.price}</p>}
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionPortfolio({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);

  if (cfg.portfolioLayout === "featured") {
    const [hero, ...rest] = content.projects;
    const featuredCard = ui.card(r);
    return (
      <section className="py-16 px-8" style={ui.sectionBg("alt")}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>Featured work</h2>
          <article className={`grid lg:grid-cols-2 gap-8 mb-12 overflow-hidden ${featuredCard.className}`} style={featuredCard.style}>
            <Img src={img.projects[0]} alt={hero.name} className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-col justify-center p-6 lg:p-8">
              <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: p.primary }}>{hero.tag} · {hero.year}</p>
              <h3 className="text-2xl font-bold mt-2" style={{ color: p.text }}>{hero.name}</h3>
              <p className="mt-3 leading-relaxed" style={{ color: p.muted }}>{hero.desc}</p>
            </div>
          </article>
          <div className="grid sm:grid-cols-3 gap-6">
            {rest.map((proj, i) => {
              const card = ui.card(r);
              return (
              <article key={proj.name} className={`overflow-hidden ${card.className}`} style={card.style}>
                <Img src={img.projects[i + 1]} alt={proj.name} className="aspect-square w-full object-cover" />
                <h3 className="font-semibold mt-3 px-4 pb-4 text-sm" style={{ color: p.text }}>{proj.name}</h3>
              </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (cfg.portfolioLayout === "rows") {
    return (
      <section className="py-16 px-8" style={ui.sectionBg("alt")}>
        <div className="max-w-5xl mx-auto space-y-12">
          <h2 className="text-2xl font-bold" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>Case studies</h2>
          {content.projects.map((proj, i) => (
            <article key={proj.name} className={`grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
              <Img src={img.projects[i]} alt={proj.name} className="aspect-[16/10] w-full object-cover md:[direction:ltr]" />
              <div className="md:[direction:ltr]">
                <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: p.primary }}>{proj.tag}</p>
                <h3 className="text-xl font-bold mt-1" style={{ color: p.text }}>{proj.name}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{proj.desc}</p>
                <p className="mt-3 text-xs" style={{ color: p.muted }}>{proj.year}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-8" style={ui.sectionBg("alt")}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>Selected work</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {content.projects.map((proj, i) => {
            const card = ui.card(r);
            return (
            <article key={proj.name} className={`group overflow-hidden ${card.className}`} style={card.style}>
              <Img src={img.projects[i]} alt={proj.name} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5 flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: p.primary }}>{proj.tag}</p>
                  <h3 className="font-bold mt-1" style={{ color: p.text }}>{proj.name}</h3>
                  <p className="text-sm mt-1" style={{ color: p.muted }}>{proj.desc}</p>
                </div>
                <span className="text-sm shrink-0" style={{ color: p.muted }}>{proj.year}</span>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionStats({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);

  if (cfg.statsLayout === "cards") {
    return (
      <section className="py-16 px-8" style={ui.sectionBg("alt")}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.stats.map((s) => {
            const card = ui.card(r);
            return (
            <div key={s.label} className={`p-6 text-center ${card.className}`} style={card.style}>
              <p className="text-3xl font-bold" style={{ color: p.primary }}>{s.value}</p>
              <p className="text-xs uppercase tracking-widest mt-2" style={{ color: p.muted }}>{s.label}</p>
            </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (cfg.statsLayout === "split") {
    return (
      <section className="py-16 px-8 grid lg:grid-cols-2" style={{ background: p.bg }}>
        <div className="flex flex-col justify-center p-8 lg:p-14" style={{ background: p.primary, color: "#fff" }}>
          <p className="text-xs uppercase tracking-widest opacity-80 mb-4">By the numbers</p>
          <p className="text-2xl font-bold leading-snug" style={{ fontFamily: cfg.fontHeading }}>{content.brand} in brief</p>
        </div>
        <div className="grid grid-cols-2 gap-8 p-8 lg:p-14 items-center">
          {content.stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold" style={{ color: p.primary }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: p.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-8 border-y" style={{ borderColor: p.border, background: p.dark ? p.bgAlt : p.primary, color: p.dark ? p.text : "#fff" }}>
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-10 md:gap-16">
        {content.stats.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
            <p className="text-xs uppercase tracking-widest mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionAbout({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  const card = ui.card(r);
  return (
    <section className="py-16 px-8" style={ui.sectionBg("default")}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className={`overflow-hidden ${card.className}`} style={card.style}>
          <Img src={img.side} alt="Team" className="w-full aspect-[4/3] object-cover" />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>{content.aboutTitle}</h2>
          <p className="mt-4 leading-relaxed" style={{ color: p.muted }}>{content.aboutBody}</p>
          <ul className="mt-6 space-y-2">
            {content.features.slice(0, 4).map((f) => (
              <li key={f.title} className="flex gap-2 text-sm" style={{ color: p.text }}>
                <span style={{ color: p.primary }}>—</span> {f.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SectionPricing({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  return (
    <section className="py-16 px-8" style={{ background: p.bgAlt }}>
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h2 className="text-2xl font-bold" style={{ fontFamily: cfg.fontHeading, color: p.text }}>Pricing</h2>
        <p style={{ color: p.muted }}>Transparent plans for every stage.</p>
      </div>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {content.pricing.map((plan) => {
          const card = ui.card(r);
          return (
          <div key={plan.name} className={`${card.className} p-6 ${plan.featured ? "ring-2" : ""}`} style={{ ...card.style, ...(plan.featured ? { outline: `2px solid ${p.primary}` } : {}) }}>
            <h3 className="font-semibold" style={{ color: p.text }}>{plan.name}</h3>
            <p className="text-3xl font-bold mt-2" style={{ color: p.primary }}>{plan.price}</p>
            <p className="text-xs mt-1" style={{ color: p.muted }}>{plan.period}</p>
            <ul className="mt-6 space-y-2 text-sm text-left" style={{ color: p.muted }}>
              {plan.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionTestimonial({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const t = content.testimonials[0];

  if (cfg.testimonialLayout === "split") {
    return (
      <section className="py-16 px-8" style={{ background: p.bgAlt }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <Img src={img.side} alt="" className="aspect-[4/3] w-full object-cover" />
          <div>
            <p className="text-xl leading-relaxed" style={{ fontFamily: cfg.fontHeading, color: p.text }}>&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-6 flex items-center gap-4">
              <Img src={img.avatars[0]} alt={t.author} className="h-12 w-12 rounded-full object-cover" />
              <div className="text-sm">
                <p className="font-semibold" style={{ color: p.text }}>{t.author}</p>
                <p style={{ color: p.muted }}>{t.role}, {t.company}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (cfg.testimonialLayout === "card") {
    const r = radiusClass(cfg.radius);
    const card = ui.card(r);
    return (
      <section className="py-16 px-8" style={ui.sectionBg("default")}>
        <div className={`max-w-2xl mx-auto p-10 text-center ${card.className}`} style={card.style}>
          <p className="text-5xl leading-none mb-4" style={{ color: p.primary }}>&ldquo;</p>
          <p className="text-lg leading-relaxed italic" style={{ color: p.text }}>{t.quote}</p>
          <div className="mt-8 pt-6 border-t" style={{ borderColor: p.border }}>
            <p className="font-semibold text-sm" style={{ color: p.text }}>{t.author}</p>
            <p className="text-xs mt-1" style={{ color: p.muted }}>{t.role} · {t.company}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-8" style={ui.sectionBg("default")}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xl md:text-2xl leading-relaxed italic" style={{ fontFamily: cfg.fontHeading, color: p.text }}>&ldquo;{t.quote}&rdquo;</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Img src={img.avatars[0]} alt={t.author} className="h-14 w-14 rounded-full object-cover" />
          <div className="text-left text-sm">
            <p className="font-semibold" style={{ color: p.text }}>{t.author}</p>
            <p style={{ color: p.muted }}>{t.role}, {t.company}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTeam({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  return (
    <section className="py-16 px-8" style={ui.sectionBg("alt")}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>Our team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.team.map((member, i) => {
            const card = ui.card(r);
            return (
            <div key={member.name} className={`text-center p-6 ${card.className}`} style={card.style}>
              <Img src={img.avatars[i % img.avatars.length]} alt={member.name} className="h-24 w-24 rounded-full object-cover mx-auto border-2" style={{ borderColor: p.primary }} />
              <p className="mt-4 font-semibold" style={{ color: p.text }}>{member.name}</p>
              <p className="text-sm" style={{ color: p.primary }}>{member.role}</p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: p.muted }}>{member.bio}</p>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionProcess({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  return (
    <section className="py-16 px-8" style={ui.sectionBg("default")}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-10" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>How we work</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {content.processSteps.map((step) => (
            <div key={step.step}>
              <p className="text-3xl font-bold" style={{ color: p.primary }}>{step.step}</p>
              <h3 className="font-semibold mt-2" style={{ color: p.text }}>{step.title}</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: p.muted }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionFaq({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  return (
    <section className="py-16 px-8" style={ui.sectionBg("alt")}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>FAQ</h2>
        <dl className="space-y-4">
          {content.faq.map((item) => {
            const card = ui.card(r);
            return (
            <div key={item.q} className={`p-5 ${card.className}`} style={card.style}>
              <dt className="font-semibold" style={{ color: p.text }}>{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed" style={{ color: p.muted }}>{item.a}</dd>
            </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function SectionBlog({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  return (
    <section className="py-16 px-8" style={ui.sectionBg("default")}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>From the journal</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {content.blogPosts.map((post, i) => {
            const card = ui.card(r);
            return (
            <article key={post.title} className={`overflow-hidden ${card.className}`} style={card.style}>
              <Img src={img.projects[i]} alt="" className="aspect-[16/10] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs" style={{ color: p.muted }}>{post.date}</p>
                <h3 className="font-semibold mt-1 leading-snug" style={{ color: p.text }}>{post.title}</h3>
                <p className="text-sm mt-2" style={{ color: p.muted }}>{post.excerpt}</p>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionClients({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  return (
    <section className="py-10 px-8 border-y" style={{ borderColor: p.border, background: p.bgAlt }}>
      <p className="text-center text-xs uppercase tracking-widest mb-6" style={{ color: p.muted }}>Trusted by</p>
      <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-10 gap-y-4">
        {content.clients.map((c) => (
          <span key={c} className="text-sm font-semibold" style={{ color: p.muted }}>{c}</span>
        ))}
      </div>
    </section>
  );
}

function SectionCta({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  const btn = ui.btnSecondary(r);
  return (
    <section className="py-16 px-8" style={ui.ctaSection}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold" style={ui.heading(cfg.fontHeading)}>{content.ctaBand.title}</h2>
        <p className="mt-3 opacity-90">{content.ctaBand.subtitle}</p>
        <button type="button" className={`mt-8 px-8 py-3 text-sm font-bold ${btn.className}`} style={{ ...btn.style, background: "#fff", color: p.primaryDark }}>{content.cta}</button>
      </div>
    </section>
  );
}

function SectionWaitlist({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  return (
    <section className="py-16 px-8" style={{ background: p.bgAlt }}>
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-4" style={{ color: p.text }}>Join the waitlist</h2>
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="you@company.com" className={`${r} flex-1 border px-4 py-3 text-sm`} style={{ borderColor: p.border, background: p.bg, color: p.text }} />
          <button type="submit" className={`px-5 py-3 text-sm ${ui.btnPrimary(r).className}`} style={ui.btnPrimary(r).style}>Notify me</button>
        </form>
      </div>
    </section>
  );
}

function SectionResume({ cfg, ui, content, img }: Pick<SectionProps, "cfg" | "ui" | "content" | "img">) {
  const p = cfg.palette;
  const r = radiusClass(cfg.radius);
  const card = ui.card(r);
  const btn = ui.btnSecondary(r);
  return (
    <section className="py-12 px-8 max-w-4xl mx-auto" style={ui.sectionBg("default")}>
      <div className={`grid md:grid-cols-[200px_1fr] gap-10 p-8 ${card.className}`} style={card.style}>
        <div className="text-center md:text-left">
          <Img src={img.portrait} alt={content.brand} className="w-40 h-40 rounded-full object-cover mx-auto md:mx-0 border-4" style={{ borderColor: p.primary }} />
          <h1 className="mt-6 text-2xl font-bold" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>{content.brand}</h1>
          <p className="text-sm mt-1" style={{ color: p.primary }}>{content.tagline}</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
            {content.skills.slice(0, 8).map((s) => (
              <span key={s} className={`text-xs border px-2 py-0.5 ${r}`} style={{ borderColor: p.border, color: p.muted }}>{s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="leading-relaxed" style={{ color: p.muted }}>{content.intro}</p>
          <h2 className="mt-10 font-bold text-sm uppercase tracking-wider" style={{ color: p.primary }}>Experience</h2>
          {content.timeline.map((t) => (
            <div key={t.year} className="mt-5 pb-5 border-b" style={{ borderColor: p.border }}>
              <div className="flex justify-between gap-4">
                <p className="font-semibold" style={{ color: p.text }}>{t.title}</p>
                <span className="text-sm shrink-0" style={{ color: p.muted }}>{t.year}</span>
              </div>
              <p className="text-sm" style={{ color: p.primary }}>{t.org}</p>
              <p className="text-sm mt-1" style={{ color: p.muted }}>{t.detail}</p>
            </div>
          ))}
          <button type="button" className={`mt-8 px-6 py-2 text-sm ${btn.className}`} style={btn.style}>{content.cta}</button>
        </div>
      </div>
    </section>
  );
}

function SiteNav({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  if (cfg.navStyle === "centered") {
    return (
      <header className="text-center py-6 px-6" style={ui.navWrap}>
        <span className="font-bold text-lg" style={{ fontFamily: cfg.fontHeading, color: p.text }}>{content.brand}</span>
        <nav className="mt-3 flex justify-center gap-6 text-sm" style={{ color: p.muted }}>
          <span>Work</span><span>About</span><span>Contact</span>
        </nav>
      </header>
    );
  }
  if (cfg.navStyle === "minimal") {
    const btn = ui.btnPrimary("rounded-sm");
    return (
      <header className="px-8 py-6 flex justify-between items-baseline" style={ui.navWrap}>
        <span className="text-sm tracking-[0.2em] uppercase" style={{ color: p.primary }}>{content.brand}</span>
        <button type="button" className={`text-sm px-4 py-2 ${btn.className}`} style={btn.style}>{content.cta}</button>
      </header>
    );
  }
  const btn = ui.btnPrimary("rounded-sm");
  return (
    <header className="flex items-center justify-between px-6 py-4" style={ui.navWrap}>
      <span className="font-bold" style={{ ...ui.heading(cfg.fontHeading), color: p.text }}>{content.brand}</span>
      <nav className="hidden md:flex gap-6 text-sm" style={{ color: p.muted }}><span>Services</span><span>Work</span><span>About</span></nav>
      <button type="button" className={`text-sm px-4 py-2 ${btn.className}`} style={btn.style}>{content.cta}</button>
    </header>
  );
}

function SiteFooter({ cfg, ui, content }: Pick<SectionProps, "cfg" | "ui" | "content">) {
  const p = cfg.palette;
  return (
    <footer className="px-8 py-14 border-t" style={{ borderColor: p.border, background: p.dark ? p.bgAlt : p.bgAlt, color: p.muted }}>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <p className="font-bold text-lg mb-2" style={{ color: p.text }}>{content.brand}</p>
          <p className="text-sm">{content.tagline}</p>
        </div>
        {[["Product", ["Features", "Pricing", "Changelog"]], ["Company", ["About", "Careers", "Contact"]], ["Legal", ["Privacy", "Terms"]]].map(([title, links]) => (
          <div key={title as string}>
            <p className="font-semibold text-sm mb-3" style={{ color: p.text }}>{title as string}</p>
            <ul className="space-y-2 text-sm">{(links as string[]).map((l) => <li key={l}>{l}</li>)}</ul>
          </div>
        ))}
      </div>
      <p className="max-w-6xl mx-auto mt-10 pt-6 border-t text-xs text-center" style={{ borderColor: p.border }}>© {new Date().getFullYear()} {content.brand}. Crafted with care.</p>
    </footer>
  );
}

const SECTION_RENDERERS: Record<SectionId, React.ComponentType<SectionProps>> = {
  "hero-full": SectionHero,
  "hero-split": SectionHero,
  "hero-minimal": SectionHero,
  intro: SectionIntro,
  services: SectionServices,
  portfolio: SectionPortfolio,
  stats: SectionStats,
  about: SectionAbout,
  pricing: SectionPricing,
  testimonial: SectionTestimonial,
  team: SectionTeam,
  process: SectionProcess,
  faq: SectionFaq,
  blog: SectionBlog,
  clients: SectionClients,
  cta: SectionCta,
  waitlist: SectionWaitlist,
  resume: SectionResume,
};

export function ClassyTemplatePage({ template }: Props) {
  const cfg = getTemplatePageConfig(template);
  const ui = buildTemplateUi(cfg);
  const content = getRichDemoContent(template);
  const img = getTemplateImages(template);
  const p = cfg.palette;

  const sections = cfg.sections.filter((id) => {
    if (id.startsWith("hero-")) return false;
    if (id === "pricing" && !categoryFlags(template.categoryId).pricing) return false;
    if (id === "portfolio" && !categoryFlags(template.categoryId).projects) return false;
    return true;
  });

  const heroId = cfg.sections.find((s) => s.startsWith("hero-")) ?? "hero-full";

  return (
    <div
      className={`min-h-screen antialiased ${ui.pageClassName}`}
      style={{ ...ui.pageStyle, color: p.text, fontFamily: cfg.fontBody }}
      data-ui-style={cfg.uiStyle}
    >
      <SiteNav cfg={cfg} ui={ui} content={content} />
      {(() => {
        const Hero = SECTION_RENDERERS[heroId];
        return Hero ? <Hero cfg={cfg} ui={ui} content={content} img={img} template={template} /> : null;
      })()}
      {sections.map((id) => {
        const C = SECTION_RENDERERS[id];
        return C ? <C key={id} cfg={cfg} ui={ui} content={content} img={img} template={template} /> : null;
      })}
      <SiteFooter cfg={cfg} ui={ui} content={content} />
    </div>
  );
}

export function PremiumThemeDemo({ template }: Props) {
  return <ClassyTemplatePage template={template} />;
}
