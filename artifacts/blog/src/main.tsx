import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl?.trim()) {
  setBaseUrl(apiUrl.trim().replace(/\/$/, ""));
}

const rootEl = document.getElementById("root");
if (rootEl) {
  rootEl.querySelector("#seo-static-content")?.remove();
  createRoot(rootEl).render(<App />);
}
