import type { TemplateDef } from "../templates-config";
import { getRichDemoContent } from "./demo-content";
import { getTemplateImages, brandName } from "./template-images";
import { getTemplatePageConfig, categoryFlags } from "./page-config";
import { getUiStyleCssComment, buildTemplateUi } from "./template-ui";

export type TemplateSourceFiles = { html: string; css: string; jsx?: string };

function esc(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function getTemplateSourceFiles(template: TemplateDef): TemplateSourceFiles {
  const css = generateCss(template);
  const html = generateHtml(template);
  const isReact = template.stack.some((s) => s.toLowerCase().includes("react"));
  if (isReact) return { html, css, jsx: generateJsx(template) };
  return { html, css };
}

export function getTemplateSourceCode(t: TemplateDef) {
  const f = getTemplateSourceFiles(t);
  return f.jsx ?? f.html;
}
export function getTemplateHtml(t: TemplateDef) { return getTemplateSourceFiles(t).html; }
export function getTemplateCss(t: TemplateDef) { return getTemplateSourceFiles(t).css; }

function generateCss(template: TemplateDef): string {
  const cfg = getTemplatePageConfig(template);
  const p = cfg.palette;
  const ui = buildTemplateUi(cfg);
  const r = cfg.radius === "none" ? "0" : cfg.radius === "lg" ? "0.75rem" : "0.375rem";
  const uiRules = uiStyleCssRules(ui.preset);

  return `/*
 * ${template.title}
 * Style: ${cfg.label}
 * ${getUiStyleCssComment(cfg)}
 * Files: index.html + styles.css
 */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

:root {
  --primary: ${p.primary};
  --primary-dark: ${p.primaryDark};
  --text: ${p.text};
  --muted: ${p.muted};
  --bg: ${p.bg};
  --bg-alt: ${p.bgAlt};
  --border: ${p.border};
  --radius: ${r};
  --font-heading: ${cfg.fontHeading};
  --font-body: ${cfg.fontBody};
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); color: var(--text); background: var(--bg); line-height: 1.65; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }

.container { width: min(100% - 2rem, 72rem); margin-inline: auto; }

.site-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); background: var(--bg);
}
.logo { font-family: var(--font-heading); font-weight: 700; font-size: 1.125rem; }
.nav { display: flex; gap: 1.5rem; font-size: 0.875rem; color: var(--muted); }

.btn {
  display: inline-block; background: var(--primary); color: #fff;
  padding: 0.75rem 1.5rem; font-size: 0.875rem; font-weight: 600;
  border: none; cursor: pointer; border-radius: var(--radius);
}
.btn-outline { background: transparent; color: var(--text); border: 1px solid var(--border); }

.hero { position: relative; min-height: 28rem; display: flex; align-items: flex-end; }
.hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.25)); }
.hero .content { position: relative; z-index: 1; padding: 3rem 1.5rem; color: #fff; max-width: 40rem; }
.hero h1 { font-family: var(--font-heading); font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }

.hero-split { display: grid; min-height: 26rem; }
@media (min-width: 960px) { .hero-split { grid-template-columns: 1fr 1fr; } }
.hero-split img { width: 100%; height: 100%; min-height: 18rem; object-fit: cover; }
.hero-split .copy { padding: 3rem 1.5rem; display: flex; flex-direction: column; justify-content: center; }

.section { padding: 4rem 1.5rem; }
.section--alt { background: var(--bg-alt); }
.section-label { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 600; }
.section h2 { font-family: var(--font-heading); font-size: 1.75rem; margin-bottom: 1rem; }

.grid-2 { display: grid; gap: 1.5rem; }
@media (min-width: 768px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }
.grid-3 { display: grid; gap: 1.5rem; }
@media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

.card { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--bg); }
.card img { aspect-ratio: 16/10; object-fit: cover; width: 100%; }
.card-body { padding: 1.25rem; }
.card h3 { font-size: 1rem; font-weight: 600; }
.card p { font-size: 0.875rem; color: var(--muted); margin-top: 0.35rem; }

.stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 2.5rem; padding: 2.5rem 1.5rem; background: var(--primary); color: #fff; text-align: center; }
.stats strong { display: block; font-size: 2rem; }
.stats span { font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }

.testimonial { max-width: 40rem; margin: 0 auto; text-align: center; }
.testimonial blockquote { font-family: var(--font-heading); font-size: 1.25rem; font-style: italic; line-height: 1.5; }
.author { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.5rem; }
.author img { width: 3.5rem; height: 3.5rem; border-radius: 999px; object-fit: cover; }

.team-grid { display: grid; gap: 2rem; text-align: center; }
@media (min-width: 640px) { .team-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .team-grid { grid-template-columns: repeat(4, 1fr); } }
.team-grid img { width: 5rem; height: 5rem; border-radius: 999px; object-fit: cover; margin: 0 auto 1rem; border: 2px solid var(--border); }

.pricing { display: grid; gap: 1rem; }
@media (min-width: 768px) { .pricing { grid-template-columns: repeat(3, 1fr); } }
.price-card { border: 1px solid var(--border); padding: 1.5rem; border-radius: var(--radius); background: var(--bg); }
.price-card.featured { border-color: var(--primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 25%, transparent); }

.faq dt { font-weight: 600; margin-bottom: 0.35rem; }
.faq dd { font-size: 0.875rem; color: var(--muted); margin-bottom: 1.25rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); }

.cta-band { background: var(--primary); color: #fff; text-align: center; padding: 4rem 1.5rem; }
.cta-band h2 { font-family: var(--font-heading); font-size: 1.75rem; }

.site-footer { background: var(--bg-alt); border-top: 1px solid var(--border); padding: 3rem 1.5rem; color: var(--muted); font-size: 0.875rem; }
.footer-grid { display: grid; gap: 2rem; }
@media (min-width: 640px) { .footer-grid { grid-template-columns: repeat(4, 1fr); } }
.footer-grid h4 { color: var(--text); font-size: 0.875rem; margin-bottom: 0.75rem; }
.footer-copy { text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); font-size: 0.75rem; }

/* UI style: ${cfg.uiStyleLabel} */
${uiRules}
`;
}

function uiStyleCssRules(preset: ReturnType<typeof buildTemplateUi>["preset"]): string {
  switch (preset) {
    case "brutal":
      return `.card, .price-card { border: 3px solid var(--text); box-shadow: 4px 4px 0 0 var(--text); }
.btn { border: 3px solid var(--text); box-shadow: 3px 3px 0 0 var(--text); font-weight: 800; text-transform: uppercase; }
.site-header { border-bottom: 3px solid var(--text); }`;
    case "glass":
      return `.card, .price-card { background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); border-color: color-mix(in srgb, var(--primary) 20%, transparent); box-shadow: 0 8px 32px color-mix(in srgb, var(--primary) 10%, transparent); }
.site-header { backdrop-filter: blur(12px); background: rgba(255,255,255,0.72); }
body { background: linear-gradient(135deg, var(--bg) 0%, var(--bg-alt) 45%, color-mix(in srgb, var(--primary) 10%, transparent) 100%); }`;
    case "soft":
      return `.card, .price-card { border: none; box-shadow: 8px 8px 16px var(--border), -8px -8px 16px var(--bg-alt); }
.btn { box-shadow: 6px 6px 12px var(--border), -4px -4px 10px var(--bg-alt); }`;
    case "cyber":
      return `.card, .price-card { border-color: var(--primary); box-shadow: 0 0 20px color-mix(in srgb, var(--primary) 27%, transparent); }
.btn { background: transparent; color: var(--primary); border: 2px solid var(--primary); box-shadow: 0 0 16px color-mix(in srgb, var(--primary) 40%, transparent); }
.hero .overlay { background: linear-gradient(to top, color-mix(in srgb, var(--bg) 93%, transparent), color-mix(in srgb, var(--primary) 20%, transparent)); }`;
    case "retro":
      return `.card, .price-card { border: 2px solid var(--primary); background: linear-gradient(135deg, var(--bg), var(--bg-alt)); }
.cta-band { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); }
body { background: linear-gradient(180deg, var(--bg-alt) 0%, var(--bg) 40%, color-mix(in srgb, var(--primary) 7%, transparent) 100%); }`;
    case "terminal":
      return `body, .btn { font-family: "Geist Mono", "Courier New", monospace; }
.btn { border-radius: 0; }`;
    case "organic":
      return `.card, .price-card { border-radius: 2rem 1rem 2.5rem 1.25rem; }`;
    case "apple":
      return `.card, .price-card { border: none; background: rgba(255,255,255,0.72); backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(0,0,0,0.08); }`;
    case "editorial":
      return `.card, .price-card { border-left: 4px solid var(--primary); }`;
    case "mono":
      return `body { filter: grayscale(0.15); }`;
    default:
      return `.card, .price-card { box-shadow: 0 4px 14px rgba(0,0,0,0.08); }`;
  }
}

function generateHtml(template: TemplateDef): string {
  const cfg = getTemplatePageConfig(template);
  const content = getRichDemoContent(template);
  const img = getTemplateImages(template);
  const flags = categoryFlags(template.categoryId);
  const brand = content.brand;

  const hero = cfg.hero === "split" || cfg.hero === "split-reverse" ? `
  <section class="hero-split">
    ${cfg.hero === "split" ? `<div class="copy"><p class="section-label">${esc(template.categoryTitle)}</p><h1>${esc(content.headline)}</h1><p style="margin-top:1rem;color:var(--muted)">${esc(content.intro)}</p><p style="margin-top:1.5rem"><button class="btn">${esc(content.cta)}</button></p></div><img src="${img.dashboard}" alt="Preview" />` : `<img src="${img.dashboard}" alt="Preview" /><div class="copy"><p class="section-label">${esc(template.categoryTitle)}</p><h1>${esc(content.headline)}</h1><p style="margin-top:1rem;color:var(--muted)">${esc(content.intro)}</p><button class="btn" style="margin-top:1.5rem">${esc(content.cta)}</button></div>`}
  </section>` : cfg.hero === "minimal" ? `
  <section class="section"><p class="section-label">${esc(content.tagline)}</p><h1 style="font-family:var(--font-heading);font-size:2.5rem;margin-top:0.75rem">${esc(content.headline)}</h1><p style="margin-top:1rem;max-width:36rem;color:var(--muted)">${esc(content.intro)}</p><p style="margin-top:1.5rem"><button class="btn">${esc(content.cta)}</button></p></section>` : `
  <section class="hero">
    <img src="${img.hero}" alt="" />
    <div class="overlay"></div>
    <div class="content"><p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:0.75rem">${esc(brand)}</p><h1>${esc(content.headline)}</h1><p style="margin-top:1rem;opacity:0.9">${esc(content.tagline)}</p><button class="btn" style="margin-top:1.5rem">${esc(content.cta)}</button></div>
  </section>`;

  const services = `
  <section class="section"><div class="container"><h2>Services</h2><p style="color:var(--muted);margin-bottom:2rem">What we offer clients and partners.</p><div class="grid-3">
    ${content.services.map((s, i) => `<article class="card"><img src="${img.projects[i % img.projects.length]}" alt="" /><div class="card-body"><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p>${s.price ? `<p style="margin-top:0.5rem;font-weight:600;color:var(--primary)">${esc(s.price)}</p>` : ""}</div></article>`).join("")}
  </div></div></section>`;

  const portfolio = flags.projects ? `
  <section class="section section--alt"><div class="container"><h2>Selected work</h2><div class="grid-2" style="margin-top:2rem">
    ${content.projects.map((p, i) => `<article><img src="${img.projects[i]}" alt="${esc(p.name)}" style="aspect-ratio:4/3;object-fit:cover;width:100%;border-radius:var(--radius)" /><p class="section-label" style="margin-top:1rem">${esc(p.tag)} · ${esc(p.year)}</p><h3>${esc(p.name)}</h3><p style="font-size:0.875rem;color:var(--muted)">${esc(p.desc)}</p></article>`).join("")}
  </div></div></section>` : "";

  const stats = `<div class="stats">${content.stats.map((s) => `<div><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></div>`).join("")}</div>`;

  const testimonial = `
  <section class="section"><div class="container testimonial"><blockquote>&ldquo;${esc(content.testimonials[0].quote)}&rdquo;</blockquote><div class="author"><img src="${img.avatars[0]}" alt="" /><div style="text-align:left;font-size:0.875rem"><strong>${esc(content.testimonials[0].author)}</strong><br><span style="color:var(--muted)">${esc(content.testimonials[0].role)}, ${esc(content.testimonials[0].company)}</span></div></div></div></section>`;

  const team = `
  <section class="section section--alt"><div class="container"><h2>Our team</h2><div class="team-grid" style="margin-top:2rem">
    ${content.team.map((m, i) => `<div><img src="${img.avatars[i]}" alt="${esc(m.name)}" /><p style="font-weight:600">${esc(m.name)}</p><p style="color:var(--primary);font-size:0.875rem">${esc(m.role)}</p><p style="font-size:0.75rem;color:var(--muted);margin-top:0.5rem">${esc(m.bio)}</p></div>`).join("")}
  </div></div></section>`;

  const pricing = flags.pricing ? `
  <section class="section"><div class="container"><h2 style="text-align:center">Pricing</h2><div class="pricing" style="margin-top:2rem">
    ${content.pricing.map((p) => `<div class="price-card${p.featured ? " featured" : ""}"><h3>${esc(p.name)}</h3><p style="font-size:2rem;font-weight:700;color:var(--primary);margin:0.5rem 0">${esc(p.price)}</p><p style="font-size:0.75rem;color:var(--muted)">${esc(p.period)}</p><ul style="margin-top:1rem;font-size:0.875rem;color:var(--muted);list-style:none">${p.features.map((f) => `<li style="margin-bottom:0.35rem">✓ ${esc(f)}</li>`).join("")}</ul></div>`).join("")}
  </div></div></section>` : "";

  const faq = `
  <section class="section section--alt"><div class="container" style="max-width:40rem"><h2>FAQ</h2><dl class="faq" style="margin-top:1.5rem">${content.faq.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("")}</dl></div></section>`;

  const blog = `
  <section class="section"><div class="container"><h2>From the journal</h2><div class="grid-3" style="margin-top:2rem">
    ${content.blogPosts.map((post, i) => `<article><img src="${img.projects[i]}" alt="" style="aspect-ratio:16/10;object-fit:cover;width:100%;border-radius:var(--radius);margin-bottom:1rem" /><p style="font-size:0.75rem;color:var(--muted)">${esc(post.date)}</p><h3 style="font-size:1rem;margin-top:0.25rem">${esc(post.title)}</h3><p style="font-size:0.875rem;color:var(--muted);margin-top:0.35rem">${esc(post.excerpt)}</p></article>`).join("")}
  </div></div></section>`;

  const cta = `<section class="cta-band"><h2>${esc(content.ctaBand.title)}</h2><p style="margin-top:0.75rem;opacity:0.9">${esc(content.ctaBand.subtitle)}</p><button class="btn" style="margin-top:1.5rem;background:#fff;color:var(--primary-dark)">${esc(content.cta)}</button></section>`;

  const intro = `
  <section class="section section--alt"><div class="container"><p class="section-label">Overview</p><h2 style="margin-top:0.5rem">${esc(content.aboutTitle)}</h2><p style="margin-top:1rem;max-width:48rem;color:var(--muted);font-size:1.0625rem">${esc(content.aboutBody)}</p></div></section>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(template.title)} — ${esc(brand)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header container">
    <span class="logo">${esc(brand)}</span>
    <nav class="nav"><span>Services</span><span>Work</span><span>About</span></nav>
    <button type="button" class="btn">${esc(content.cta)}</button>
  </header>

  ${hero}
  ${intro}
  ${services}
  ${portfolio}
  ${stats}
  ${pricing}
  ${testimonial}
  ${team}
  ${faq}
  ${blog}
  ${cta}

  <footer class="site-footer">
    <div class="container footer-grid">
      <div><h4>${esc(brand)}</h4><p>${esc(content.tagline)}</p></div>
      <div><h4>Product</h4><ul><li>Features</li><li>Pricing</li></ul></div>
      <div><h4>Company</h4><ul><li>About</li><li>Contact</li></ul></div>
      <div><h4>Legal</h4><ul><li>Privacy</li><li>Terms</li></ul></div>
    </div>
    <p class="footer-copy">© ${new Date().getFullYear()} ${esc(brand)}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

function generateJsx(template: TemplateDef): string {
  const content = getRichDemoContent(template);
  const cfg = getTemplatePageConfig(template);
  const name = template.slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("").replace(/[^a-zA-Z0-9]/g, "") || "Page";
  return `import "./styles.css";

/** ${template.title} — ${cfg.label} */
export default function ${name}() {
  return (
    <div>
      <header className="site-header"><span className="logo">${esc(content.brand)}</span><button className="btn">${esc(content.cta)}</button></header>
      <section className="section"><h1>${esc(content.headline)}</h1><p>${esc(content.intro)}</p></section>
    </div>
  );
}
`;
}

export function getTemplateScreenshots(template: TemplateDef): string[] {
  return [template.previewImage];
}
