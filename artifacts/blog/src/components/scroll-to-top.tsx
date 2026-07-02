import { useEffect } from "react";
import { useLocation } from "wouter";

function scrollWindowToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function scrollToHashId(hash: string): boolean {
  if (!hash || hash === "#") return false;
  const id = decodeURIComponent(hash.slice(1));
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ block: "start" });
  return true;
}

/** Reset scroll on every client-side route change (wouter does not do this by default). */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.length > 1) {
      if (scrollToHashId(hash)) return;

      const t1 = requestAnimationFrame(() => scrollToHashId(hash));
      const t2 = window.setTimeout(() => scrollToHashId(hash), 150);
      return () => {
        cancelAnimationFrame(t1);
        window.clearTimeout(t2);
      };
    }

    scrollWindowToTop();
  }, [location]);

  return null;
}
