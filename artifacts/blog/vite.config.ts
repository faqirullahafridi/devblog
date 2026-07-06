import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

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

function shouldProxyToApi(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

const apiProxy = {
  target: "http://localhost:8080",
  changeOrigin: true,
  bypass(req) {
    const pathname = req.url?.split("?")[0] ?? "";
    if (shouldProxyToApi(pathname)) return null;
    return pathname;
  },
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
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            if (id.includes("/lib/content/learn-chapters/")) return "content-learn";
            if (id.includes("/lib/content/ref-guides")) return "content-refs";
            if (id.includes("/lib/content/interview")) return "content-interview";
            return undefined;
          }
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("/node_modules/react-dom/") || id.includes("/node_modules/react/")) {
            return "vendor-react";
          }
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("date-fns")) return "vendor-date";
          if (
            id.includes("react-syntax-highlighter") ||
            id.includes("refractor") ||
            id.includes("prismjs")
          ) {
            return "vendor-syntax";
          }
          if (
            id.includes("react-markdown") ||
            id.includes("remark-gfm") ||
            id.includes("micromark")
          ) {
            return "vendor-markdown";
          }
          if (id.includes("sql.js") || id.includes("sql-wasm")) return "vendor-sql";
          return undefined;
        },
      },
    },
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
