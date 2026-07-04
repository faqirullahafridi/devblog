import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AiInstructionsModule = {
  buildSystemPrompt: (mode: string, modeHint?: string) => string;
  isStaticSiteRequest: (mode: string, userMessage: string) => boolean;
  MODE_HINTS: Record<string, string>;
  CORE_IDENTITY: string;
  REASONING_PROTOCOL: string;
  OUTPUT_PROTOCOL: string;
  CODE_EXCELLENCE: string;
  ARCHITECTURE_PLAYBOOK: string;
  INTENT_ROUTING: string;
  UX_COPY_PLAYBOOK: string;
  DESIGN_SYSTEM_PLAYBOOK: string;
  STATIC_SITE_PLAYBOOK: string;
  STATIC_SITE_BAD_EXAMPLE: string;
  STATIC_SITE_USER_ENFORCEMENT: string;
  REACT_PLAYBOOK: string;
  WEBSITE_PLAYBOOK: string;
  PERFORMANCE_PLAYBOOK: string;
  SECURITY_PLAYBOOK: string;
  ANTI_PATTERNS: string;
  ENGAGEMENT_PLAYBOOK: string;
  QUALITY_GATES: string;
};

const require = createRequire(import.meta.url);

const instructionCandidates = [
  path.resolve(process.cwd(), "../../api-lib/ai-instructions.js"),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../api-lib/ai-instructions.js"),
];

const instructionsPath =
  instructionCandidates.find((p) => existsSync(p)) ?? instructionCandidates[0]!;

const instructions = require(instructionsPath) as AiInstructionsModule;

export default instructions;
