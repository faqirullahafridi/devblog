import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";
import { loaders } from "./lib/lazy-pages";

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl?.trim()) {
  setBaseUrl(apiUrl.trim().replace(/\/$/, ""));
}

/** Warm likely next routes after first paint. */
function preloadLikelyRoutes() {
  void loaders.search();
}

if (typeof window !== "undefined") {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(preloadLikelyRoutes, { timeout: 3000 });
  } else {
    setTimeout(preloadLikelyRoutes, 1500);
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  rootEl.querySelector("#seo-static-content")?.remove();
  createRoot(rootEl).render(<App />);
}
