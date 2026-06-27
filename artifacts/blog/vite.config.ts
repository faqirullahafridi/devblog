import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(artifactDir, "../..");

function resolveDevPort(): number {
  if (process.env.BLOG_PORT) return Number(process.env.BLOG_PORT);
  if (process.env.SITE_URL) {
    try {
      const fromSite = new URL(process.env.SITE_URL).port;
      if (fromSite) return Number(fromSite);
    } catch {
      /* ignore invalid SITE_URL */
    }
  }
  const fallback = process.env.PORT ?? "3000";
  return Number(fallback);
}

const port = resolveDevPort();

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid dev port: ${port}`);
}

const basePath = process.env.BASE_PATH ?? "/";

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

const apiProxy = {
  target: "http://localhost:8080",
  changeOrigin: true,
} as const;

const seoProxy = (path: string) => ({
  target: process.env.API_PROXY_TARGET ?? "http://localhost:8080",
  changeOrigin: true,
  rewrite: (reqPath: string) => {
    const q = reqPath.includes("?") ? reqPath.slice(reqPath.indexOf("?")) : "";
    return `/api${path}${q}`;
  },
});

export default defineConfig({
  base: basePath,
  envDir: workspaceRoot,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  assetsInclude: ["**/*.wasm"],
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      "/api": apiProxy,
      "/feed.xml": seoProxy("/feed.xml"),
      "/sitemap.xml": seoProxy("/sitemap.xml"),
      "/robots.txt": seoProxy("/robots.txt"),
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": apiProxy,
      "/feed.xml": seoProxy("/feed.xml"),
      "/sitemap.xml": seoProxy("/sitemap.xml"),
      "/robots.txt": seoProxy("/robots.txt"),
    },
  },
});
