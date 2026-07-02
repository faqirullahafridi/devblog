import type { AiModeId } from "@/components/platform/ai-config";

const STORAGE_PREFIX = "ai-chat-conv-";

function storageKey(mode: string) {
  return `${STORAGE_PREFIX}${mode}`;
}

export function getStoredConversationId(mode: AiModeId | string): number | undefined {
  try {
    const raw = localStorage.getItem(storageKey(mode));
    if (!raw) return undefined;
    const id = Number.parseInt(raw, 10);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}

export function setStoredConversationId(mode: AiModeId | string, id: number) {
  try {
    localStorage.setItem(storageKey(mode), String(id));
  } catch {
    /* ignore */
  }
}

export function clearStoredConversationId(mode: AiModeId | string) {
  try {
    localStorage.removeItem(storageKey(mode));
  } catch {
    /* ignore */
  }
}

const PENDING_CONV_KEY = "ai-chat-pending-conv";

/** Open this conversation after navigating to its mode (studio pages). */
export function setPendingConversationId(id: number) {
  try {
    sessionStorage.setItem(PENDING_CONV_KEY, String(id));
  } catch {
    /* ignore */
  }
}

export function consumePendingConversationId(): number | undefined {
  try {
    const raw = sessionStorage.getItem(PENDING_CONV_KEY);
    sessionStorage.removeItem(PENDING_CONV_KEY);
    if (!raw) return undefined;
    const id = Number.parseInt(raw, 10);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}
