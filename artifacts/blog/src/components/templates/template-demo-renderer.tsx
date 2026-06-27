import type { TemplateDef } from "@/lib/templates-config";
import { ClassyTemplatePage } from "./demos/classy-page";

export function TemplateDemoRenderer({ template }: { template: TemplateDef }) {
  return <ClassyTemplatePage template={template} />;
}

export function hasLiveDemo(_template: TemplateDef) {
  return true;
}
