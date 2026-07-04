/**
 * Typed re-exports for TechVentry AI instructions.
 * Runtime source: api-lib/ai-instructions.js (synced from repo /api-lib/ai-instructions.js).
 */
import instructions from "./ai-instructions-bindings";

export const MODE_HINTS = instructions.MODE_HINTS;

export const {
  STATIC_SITE_PLAYBOOK,
  STATIC_SITE_BAD_EXAMPLE,
  STATIC_SITE_USER_ENFORCEMENT,
  isStaticSiteRequest,
  CORE_IDENTITY,
  REASONING_PROTOCOL,
  OUTPUT_PROTOCOL,
  CODE_EXCELLENCE,
  REACT_PLAYBOOK,
  ARCHITECTURE_PLAYBOOK,
  INTENT_ROUTING,
  UX_COPY_PLAYBOOK,
  DESIGN_SYSTEM_PLAYBOOK,
  WEBSITE_PLAYBOOK,
  PERFORMANCE_PLAYBOOK,
  SECURITY_PLAYBOOK,
  ANTI_PATTERNS,
  ENGAGEMENT_PLAYBOOK,
  QUALITY_GATES,
} = instructions;

/** ai-service passes (hint, mode); api-lib uses (mode, hint). */
export function buildSystemPrompt(modeHint: string, mode = "chat"): string {
  return instructions.buildSystemPrompt(mode, modeHint);
}
