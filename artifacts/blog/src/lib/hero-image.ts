/** Responsive hero assets — WebP first, JPEG fallback. */
export const HERO_IMAGE = {
  lqip: "/hero-devblog-lqip.jpg",
  mobile: { webp: "/hero-devblog-480.webp", jpg: "/hero-devblog-480.jpg", width: 480, height: 320 },
  desktop: { webp: "/hero-devblog-768.webp", jpg: "/hero-devblog-768.jpg", width: 768, height: 512 },
  og: "/hero-devblog-768.jpg",
} as const;
