import { db, adminCredentialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./password";

function getEnvCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
  };
}

async function getStoredCredentials() {
  const [row] = await db.select().from(adminCredentialsTable).limit(1);
  return row ?? null;
}

export async function ensureAdminCredentials() {
  const existing = await getStoredCredentials();
  if (existing) return existing;

  const { username, password } = getEnvCredentials();
  const [created] = await db
    .insert(adminCredentialsTable)
    .values({ username, passwordHash: hashPassword(password) })
    .returning();
  return created;
}

export async function verifyCurrentPassword(password: string): Promise<boolean> {
  const env = getEnvCredentials();

  try {
    const creds = await ensureAdminCredentials();
    return verifyPassword(password, creds.passwordHash);
  } catch {
    return password === env.password;
  }
}

export async function verifyAdminLogin(
  username: string,
  password: string,
): Promise<{ ok: true; username: string } | { ok: false }> {
  const env = getEnvCredentials();

  let creds;
  try {
    creds = await ensureAdminCredentials();
  } catch {
    if (username === env.username && password === env.password) {
      return { ok: true, username: env.username };
    }
    return { ok: false };
  }

  if (username !== creds.username) {
    return { ok: false };
  }

  if (!verifyPassword(password, creds.passwordHash)) {
    return { ok: false };
  }

  return { ok: true, username: creds.username };
}

export async function getAdminUsername() {
  const creds = await ensureAdminCredentials();
  return creds.username;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  if (!(await verifyCurrentPassword(currentPassword))) {
    return { ok: false as const, error: "Current password is incorrect" };
  }

  const creds = await ensureAdminCredentials();
  await db
    .update(adminCredentialsTable)
    .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(adminCredentialsTable.id, creds.id));
  return { ok: true as const };
}

export async function changeAdminUsername(currentPassword: string, newUsername: string) {
  if (!(await verifyCurrentPassword(currentPassword))) {
    return { ok: false as const, error: "Current password is incorrect" };
  }

  const trimmed = newUsername.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Username cannot be empty" };
  }

  const creds = await ensureAdminCredentials();
  await db
    .update(adminCredentialsTable)
    .set({ username: trimmed, updatedAt: new Date() })
    .where(eq(adminCredentialsTable.id, creds.id));
  return { ok: true as const, username: trimmed };
}

export async function resetAdminPassword(username: string, recoveryToken: string, newPassword: string) {
  const creds = await ensureAdminCredentials();

  if (username !== creds.username) {
    return { ok: false as const, error: "Invalid credentials" };
  }

  const expectedToken = process.env.ADMIN_RECOVERY_TOKEN;
  if (!expectedToken || recoveryToken !== expectedToken) {
    return { ok: false as const, error: "Invalid recovery token" };
  }

  await db
    .update(adminCredentialsTable)
    .set({ passwordHash: hashPassword(newPassword), updatedAt: new Date() })
    .where(eq(adminCredentialsTable.id, creds.id));
  return { ok: true as const };
}
