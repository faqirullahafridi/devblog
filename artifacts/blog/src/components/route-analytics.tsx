import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "@/lib/analytics";

/** Tracks SPA route changes for GA4 and Plausible */
export function RouteAnalytics() {
  const [location] = useLocation();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (location === prev.current) return;
    prev.current = location;
    trackPageView(location);
  }, [location]);

  return null;
}
