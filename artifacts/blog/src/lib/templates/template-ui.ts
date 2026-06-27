import type { CSSProperties } from "react";
import type { PagePalette, TemplatePageConfig } from "./page-config";
import type { UiStyleId } from "./ui-styles";
import { getUiStyleLabel } from "./ui-styles";

type BtnProps = { className: string; style: CSSProperties };
type CardProps = { className: string; style: CSSProperties };

function radiusClass(r: TemplatePageConfig["radius"]) {
  return r === "none" ? "rounded-none" : r === "lg" ? "rounded-xl" : "rounded-md";
}

type Preset =
  | "minimal"
  | "brutal"
  | "glass"
  | "soft"
  | "material"
  | "flat"
  | "skeuo"
  | "editorial"
  | "dark"
  | "mono"
  | "clay"
  | "3d"
  | "cyber"
  | "gradient"
  | "retro"
  | "memphis"
  | "bauhaus"
  | "corporate"
  | "apple"
  | "terminal"
  | "organic";

function presetFor(id: UiStyleId): Preset {
  if (["brutalism", "modern-brutalism", "bauhaus-style"].includes(id)) return "brutal";
  if (["glassmorphism", "aurora-ui", "fluent-design"].includes(id)) return "glass";
  if (["neumorphism", "claymorphism"].includes(id)) return "soft";
  if (["material-design", "card-based-ui", "dashboard-ui", "enterprise-dashboard-ui"].includes(id)) return "material";
  if (["flat-design", "swiss-style", "minimalism", "light-mode-ui", "mobile-first-ui"].includes(id)) return "minimal";
  if (["skeuomorphism"].includes(id)) return "skeuo";
  if (["editorial-ui", "magazine-ui", "bold-typography-ui", "portfolio-ui"].includes(id)) return "editorial";
  if (["dark-mode-ui", "cyberpunk-ui", "hacker-ui", "gaming-ui", "futuristic-ui", "ai-saas-ui"].includes(id)) return "cyber";
  if (["monochrome-ui"].includes(id)) return "mono";
  if (["3d-ui", "isometric-ui"].includes(id)) return "3d";
  if (["gradient-ui", "y2k-ui", "retro-ui", "memphis-design"].includes(id)) return "retro";
  if (["corporate-ui", "ecommerce-ui", "landing-page-ui", "one-page-ui"].includes(id)) return "corporate";
  if (["apple-inspired-ui"].includes(id)) return "apple";
  if (["terminal-cli-ui"].includes(id)) return "terminal";
  if (["organic-ui", "illustration-based-ui"].includes(id)) return "organic";
  if (["split-screen-ui", "asymmetrical-ui", "grid-based-ui", "scroll-based-ui", "interactive-storytelling-ui", "social-media-ui"].includes(id)) return "flat";
  return "material";
}

export type TemplateUi = {
  styleId: UiStyleId;
  styleLabel: string;
  preset: Preset;
  pageClassName: string;
  pageStyle: CSSProperties;
  heading: (fontFamily: string) => CSSProperties;
  sectionBg: (variant: "default" | "alt") => CSSProperties;
  card: (r: string) => CardProps;
  btnPrimary: (r: string) => BtnProps;
  btnSecondary: (r: string) => BtnProps;
  navWrap: CSSProperties;
  heroOverlay: (darkHero: boolean) => CSSProperties;
  ctaSection: CSSProperties;
};

export function buildTemplateUi(cfg: TemplatePageConfig): TemplateUi {
  const p = cfg.palette;
  const preset = presetFor(cfg.uiStyle);
  const styleLabel = getUiStyleLabel(cfg.uiStyle);
  const r = radiusClass(cfg.radius);

  const pageStyle: CSSProperties = {};
  const pageClassName = `tpl-ui tpl-ui--${cfg.uiStyle}`;

  if (preset === "glass" || cfg.uiStyle === "aurora-ui") {
    pageStyle.background = `linear-gradient(135deg, ${p.bg} 0%, ${p.bgAlt} 45%, ${p.primary}18 100%)`;
  } else if (preset === "cyber" || p.dark) {
    pageStyle.background = p.bg;
  } else if (preset === "retro" || cfg.uiStyle === "gradient-ui") {
    pageStyle.background = `linear-gradient(180deg, ${p.bgAlt} 0%, ${p.bg} 40%, ${p.primary}12 100%)`;
  } else if (preset === "memphis" || cfg.uiStyle === "memphis-design") {
    pageStyle.background = `repeating-linear-gradient(-12deg, ${p.bg}, ${p.bg} 24px, ${p.bgAlt} 24px, ${p.bgAlt} 48px)`;
  } else {
    pageStyle.background = p.bg;
  }

  if (preset === "terminal") {
    pageStyle.fontFamily = '"Geist Mono", "Courier New", monospace';
  }

  const card = (radius: string): CardProps => {
    switch (preset) {
      case "brutal":
        return {
          className: `${radius} border-[3px]`,
          style: {
            borderColor: p.text,
            background: p.bg,
            boxShadow: `4px 4px 0 0 ${p.text}`,
          },
        };
      case "glass":
        return {
          className: `${radius} border backdrop-blur-md`,
          style: {
            borderColor: `${p.primary}33`,
            background: p.dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)",
            boxShadow: `0 8px 32px ${p.primary}18`,
          },
        };
      case "soft":
        return {
          className: radius,
          style: {
            background: p.bg,
            boxShadow: `8px 8px 16px ${p.border}, -8px -8px 16px ${p.bgAlt}`,
            border: "none",
          },
        };
      case "3d":
        return {
          className: `${radius} border`,
          style: {
            borderColor: p.border,
            background: p.bg,
            transform: "perspective(800px) rotateX(2deg)",
            boxShadow: `0 20px 40px ${p.primary}22, 0 4px 0 ${p.primaryDark}`,
          },
        };
      case "cyber":
        return {
          className: `${radius} border`,
          style: {
            borderColor: p.primary,
            background: p.bgAlt,
            boxShadow: `0 0 20px ${p.primary}44, inset 0 0 20px ${p.primary}11`,
          },
        };
      case "organic":
        return {
          className: "border",
          style: {
            borderRadius: "2rem 1rem 2.5rem 1.25rem",
            borderColor: p.border,
            background: p.bgAlt,
          },
        };
      case "skeuo":
        return {
          className: `${radius} border`,
          style: {
            borderColor: p.border,
            background: `linear-gradient(180deg, ${p.bg} 0%, ${p.bgAlt} 100%)`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.12)",
          },
        };
      case "editorial":
        return {
          className: `${radius} border-l-4`,
          style: { borderLeftColor: p.primary, borderColor: p.border, background: p.bg },
        };
      case "mono":
        return {
          className: `${radius} border`,
          style: { borderColor: p.text, background: p.bg, filter: "grayscale(0.15)" },
        };
      case "apple":
        return {
          className: `${radius} border-0`,
          style: {
            background: p.dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          },
        };
      case "minimal":
      case "flat":
        return {
          className: `${radius} border`,
          style: { borderColor: p.border, background: p.bg },
        };
      case "corporate":
        return {
          className: `${radius} border`,
          style: { borderColor: p.border, background: p.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
        };
      case "retro":
        return {
          className: `${radius} border-2`,
          style: {
            borderColor: p.primary,
            background: `linear-gradient(135deg, ${p.bg} 0%, ${p.bgAlt} 100%)`,
          },
        };
      default:
        return {
          className: `${radius} border`,
          style: {
            borderColor: p.border,
            background: p.bg,
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          },
        };
    }
  };

  const btnPrimary = (radius: string): BtnProps => {
    if (preset === "brutal") {
      return {
        className: `${radius} border-[3px] border-current font-black uppercase tracking-wide text-sm`,
        style: { background: p.primary, color: "#fff", boxShadow: `3px 3px 0 0 ${p.text}` },
      };
    }
    if (preset === "glass" || preset === "apple") {
      return {
        className: `${radius} font-semibold text-sm backdrop-blur-sm`,
        style: {
          background: `linear-gradient(135deg, ${p.primary}, ${p.primaryDark})`,
          color: "#fff",
          boxShadow: `0 8px 24px ${p.primary}44`,
        },
      };
    }
    if (preset === "cyber") {
      return {
        className: `${radius} font-semibold text-sm uppercase tracking-wider`,
        style: {
          background: "transparent",
          color: p.primary,
          border: `2px solid ${p.primary}`,
          boxShadow: `0 0 16px ${p.primary}66`,
        },
      };
    }
    if (preset === "soft") {
      return {
        className: `${radius} font-semibold text-sm`,
        style: {
          background: p.primary,
          color: "#fff",
          boxShadow: `6px 6px 12px ${p.border}, -4px -4px 10px ${p.bgAlt}`,
        },
      };
    }
    if (preset === "terminal") {
      return {
        className: "rounded-none font-mono text-sm",
        style: { background: p.primary, color: p.bg, border: `1px solid ${p.primary}` },
      };
    }
    return {
      className: `${radius} font-semibold text-sm`,
      style: { background: p.primary, color: "#fff" },
    };
  };

  const btnSecondary = (radius: string): BtnProps => {
    if (preset === "brutal") {
      return {
        className: `${radius} border-[3px] font-bold text-sm`,
        style: { borderColor: p.text, color: p.text, background: p.bg, boxShadow: `3px 3px 0 0 ${p.text}` },
      };
    }
    if (preset === "glass") {
      return {
        className: `${radius} border font-semibold text-sm backdrop-blur-sm`,
        style: { borderColor: `${p.primary}44`, color: p.text, background: "rgba(255,255,255,0.2)" },
      };
    }
    return {
      className: `${radius} border font-semibold text-sm`,
      style: { borderColor: p.border, color: p.text, background: "transparent" },
    };
  };

  return {
    styleId: cfg.uiStyle,
    styleLabel,
    preset,
    pageClassName,
    pageStyle,
    heading: (fontFamily) => ({
      fontFamily,
      ...(preset === "editorial" || preset === "brutal"
        ? { letterSpacing: preset === "brutal" ? "-0.02em" : "-0.01em", fontWeight: 800 }
        : {}),
      ...(preset === "terminal" ? { fontFamily: "Geist Mono, monospace" } : {}),
    }),
    sectionBg: (variant) => ({
      background:
        variant === "alt"
          ? cfg.uiStyle === "gradient-ui" || preset === "retro"
            ? `linear-gradient(180deg, ${p.bgAlt}, ${p.bg})`
            : p.bgAlt
          : p.bg,
    }),
    card,
    btnPrimary,
    btnSecondary,
    navWrap: {
      background:
        preset === "glass" ? (p.dark ? "rgba(15,15,20,0.6)" : "rgba(255,255,255,0.7)") : p.bg,
      backdropFilter: preset === "glass" || preset === "apple" ? "blur(12px)" : undefined,
      borderBottom: preset === "brutal" ? `3px solid ${p.text}` : `1px solid ${p.border}`,
    },
    heroOverlay: (darkHero) => {
      if (preset === "cyber") {
        return {
          background: `linear-gradient(to top, ${p.bg}ee, ${p.primary}33)`,
        };
      }
      if (cfg.uiStyle === "gradient-ui" || preset === "retro") {
        return {
          background: `linear-gradient(135deg, ${p.primaryDark}cc, ${p.primary}88)`,
        };
      }
      return {
        background: darkHero
          ? "linear-gradient(to top, rgba(0,0,0,.88), rgba(0,0,0,.35))"
          : "linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.2))",
      };
    },
    ctaSection: {
      background:
        cfg.uiStyle === "gradient-ui" || preset === "retro"
          ? `linear-gradient(135deg, ${p.primary}, ${p.primaryDark})`
          : p.primary,
      color: "#fff",
      ...(preset === "brutal" ? { borderTop: `3px solid ${p.text}` } : {}),
    },
  };
}

export function getUiStyleCssComment(cfg: TemplatePageConfig): string {
  return `UI style: ${getUiStyleLabel(cfg.uiStyle)} (${cfg.uiStyle})`;
}
