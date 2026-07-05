import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import { loaders } from "./lib/lazy-pages";
import { queryClient } from "./lib/query-client";
import { getHomeFeed } from "./lib/api-extra";

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl?.trim()) {
  setBaseUrl(apiUrl.trim().replace(/\/$/, ""));
}

/** Warm high-traffic route chunks after first paint. */
function preloadLikelyRoutes() {
  void loaders.search();
  void loaders.tools();
  void loaders.templates();
  void loaders.ai();
}

function prefetchHomeFeed() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path !== "/") return;
  void queryClient.prefetchQuery({
    queryKey: ["posts", "home-feed"],
    queryFn: getHomeFeed,
    staleTime: 5 * 60_000,
  });
}

if (typeof window !== "undefined") {
  const run = () => {
    preloadLikelyRoutes();
    prefetchHomeFeed();
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(run, { timeout: 2000 });
  } else {
    setTimeout(run, 800);
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  rootEl.querySelector("#seo-static-content")?.remove();
  createRoot(rootEl).render(<App />);
}
