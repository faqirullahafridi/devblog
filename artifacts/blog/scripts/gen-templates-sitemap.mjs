/**
 * Generate templates sitemap routes for api-server.
 * Run: pnpm --filter @workspace/blog exec tsx scripts/gen-templates-sitemap.mjs
 */
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { TEMPLATE_ROUTES } from "../src/lib/templates-config.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "../../api-server/src/lib/templates-sitemap-routes.json");
writeFileSync(out, JSON.stringify(TEMPLATE_ROUTES, null, 2));
console.log("Wrote", TEMPLATE_ROUTES.length, "routes to", out);
