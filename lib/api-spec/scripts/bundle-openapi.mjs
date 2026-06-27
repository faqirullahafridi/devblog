/**
 * Merges openapi.yaml + platform.openapi.yaml into openapi.bundle.yaml for Orval codegen.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const base = yaml.parse(fs.readFileSync(path.join(root, "openapi.yaml"), "utf8"));
const platform = yaml.parse(fs.readFileSync(path.join(root, "platform.openapi.yaml"), "utf8"));

base.tags = [...(base.tags ?? []), ...(platform.tags ?? [])];
base.paths = { ...(base.paths ?? {}), ...(platform.paths ?? {}) };
base.components ??= {};
base.components.schemas = {
  ...(base.components.schemas ?? {}),
  ...(platform.components?.schemas ?? {}),
};

const out = path.join(root, "openapi.bundle.yaml");
fs.writeFileSync(out, yaml.stringify(base, { lineWidth: 0 }));
console.log(`Bundled OpenAPI → ${out}`);
