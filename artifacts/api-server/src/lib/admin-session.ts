import type { SessionData } from "express-session";

export const ADMIN_SESSION_TTL_MS = 6 * 60 * 60 * 1000;

export function touchAdminSession(session: SessionData): void {
  session.adminAuthenticated = true;
  session.adminLoginAt = Date.now();
}

export function clearAdminSession(session: SessionData): void {
  delete session.adminAuthenticated;
  delete session.adminUsername;
  delete session.adminLoginAt;
}

export function isAdminSessionValid(session: SessionData): boolean {
  if (!session.adminAuthenticated || !session.adminLoginAt) return false;
  return Date.now() - session.adminLoginAt < ADMIN_SESSION_TTL_MS;
}

export function adminSessionExpiresAt(session: SessionData): number | null {
  if (!session.adminLoginAt) return null;
  return session.adminLoginAt + ADMIN_SESSION_TTL_MS;
}
