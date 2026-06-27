import type { TemplateDef } from "../templates-config";
import { getRichDemoContent } from "./demo-content";

/** Curated Unsplash images — verified for template demos */
export const STOCK = {
  heroWorkspace: "https://images.unsplash.com/photo-1497215843000-56c8a027a2d0?w=1600&auto=format&fit=crop&q=80",
  heroTeam: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80",
  heroLaptop: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop&q=80",
  heroCode: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&auto=format&fit=crop&q=80",
  heroOffice: "https://images.unsplash.com/photo-1497366216548-3c4d0f55d0c8?w=1600&auto=format&fit=crop&q=80",
  heroCreative: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1600&auto=format&fit=crop&q=80",
  heroCity: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80",
  heroNature: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop&q=80",
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
  mobile: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
  project1: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=80",
  project2: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&auto=format&fit=crop&q=80",
  project3: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&auto=format&fit=crop&q=80",
  project4: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&auto=format&fit=crop&q=80",
  portrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
  portraitF: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
  meeting: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80",
  product: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&auto=format&fit=crop&q=80",
} as const;

const AVATARS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
];

function hash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function getTemplateImages(template: TemplateDef) {
  const h = hash(template.slug);
  const heroes = [STOCK.heroWorkspace, STOCK.heroTeam, STOCK.heroLaptop, STOCK.heroOffice, STOCK.heroCreative, STOCK.heroCity];
  const projects = [STOCK.project1, STOCK.project2, STOCK.project3, STOCK.project4];

  return {
    hero: heroes[h % heroes.length],
    side: STOCK.meeting,
    dashboard: STOCK.dashboard,
    mobile: STOCK.mobile,
    portrait: h % 2 === 0 ? STOCK.portrait : STOCK.portraitF,
    projects: projects.map((img, i) => projects[(i + h) % projects.length]),
    avatars: AVATARS.map((a, i) => AVATARS[(i + h) % AVATARS.length]),
  };
}

export function brandName(template: TemplateDef): string {
  return getRichDemoContent(template).brand;
}
