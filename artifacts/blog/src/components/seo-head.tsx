import { useEffect } from "react";
import { useLocation } from "wouter";

import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site-config";

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

  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", pageUrl, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (image) {
      setMeta("og:image", image, true);
      setMeta("twitter:image", image);
    }
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
  }, [title, description, image, pageUrl, type, jsonLd]);

  return null;
}
