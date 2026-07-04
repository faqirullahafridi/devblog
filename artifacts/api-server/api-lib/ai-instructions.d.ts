export function buildSystemPrompt(mode: string, modeHint?: string): string;

export function isStaticSiteRequest(mode: string, userMessage: string): boolean;

export const MODE_HINTS: Record<string, string>;

export const CORE_IDENTITY: string;
export const REASONING_PROTOCOL: string;
export const OUTPUT_PROTOCOL: string;
export const CODE_EXCELLENCE: string;
export const ARCHITECTURE_PLAYBOOK: string;
export const INTENT_ROUTING: string;
export const UX_COPY_PLAYBOOK: string;
export const DESIGN_SYSTEM_PLAYBOOK: string;
export const STATIC_SITE_PLAYBOOK: string;
export const STATIC_SITE_BAD_EXAMPLE: string;
export const STATIC_SITE_USER_ENFORCEMENT: string;
export const REACT_PLAYBOOK: string;
export const WEBSITE_PLAYBOOK: string;
export const PERFORMANCE_PLAYBOOK: string;
export const SECURITY_PLAYBOOK: string;
export const ANTI_PATTERNS: string;
export const ENGAGEMENT_PLAYBOOK: string;
export const QUALITY_GATES: string;
