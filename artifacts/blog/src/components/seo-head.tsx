import { useEffect } from "react";
import { useLocation } from "wouter";

import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_OG_IMAGE_ALT, siteUrl } from "@/lib/site-config";

export { siteUrl };

type SeoHeadProps = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function resolvePageUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return siteUrl(path);
}

function setMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SeoHead({
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
  image,
  url,
  type = "website",
  jsonLd,
}: SeoHeadProps) {
  const [location] = useLocation();
  const pageUrl = resolvePageUrl(url ?? (location.split("?")[0] || "/"));
  const shareImage = image ?? SITE_OG_IMAGE;

  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", pageUrl, true);
    setMeta("og:image", shareImage, true);
    setMeta("og:image:width", "1200", true);
    setMeta("og:image:height", "630", true);
    setMeta("og:image:alt", SITE_OG_IMAGE_ALT, true);
    setMeta("og:site_name", SITE_NAME, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", shareImage);
    setMeta("twitter:image:alt", SITE_OG_IMAGE_ALT);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;

    const scriptId = "json-ld-seo";
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, shareImage, pageUrl, type, jsonLd]);

  return null;
}
