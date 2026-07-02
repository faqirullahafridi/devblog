import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { db, adminOtpTable } from "@workspace/db";
import { and, eq, gt, lt } from "drizzle-orm";

export type OtpPurpose = "login" | "password_reset";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

function otpSecret(): string {
  return process.env.SESSION_SECRET?.trim() || "dev-blog-otp-secret";
}

function hashOtp(code: string): string {
  return createHmac("sha256", otpSecret()).update(code).digest("hex");
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
}

async function purgeExpiredOtps(): Promise<void> {
  await db.delete(adminOtpTable).where(lt(adminOtpTable.expiresAt, new Date()));
}

export async function issueOtp(purpose: OtpPurpose, username: string): Promise<string> {
  await purgeExpiredOtps();

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.delete(adminOtpTable).where(and(eq(adminOtpTable.purpose, purpose), eq(adminOtpTable.username, username)));

  await db.insert(adminOtpTable).values({
    purpose,
    username,
    codeHash: hashOtp(code),
    attempts: 0,
    expiresAt,
  });

  return code;
}

export async function verifyOtp(
  purpose: OtpPurpose,
  username: string,
  code: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = code.replace(/\D/g, "").trim();
  if (normalized.length !== OTP_LENGTH) {
    return { ok: false, error: "Invalid verification code" };
  }

  const [row] = await db
    .select()
    .from(adminOtpTable)
    .where(
      and(
        eq(adminOtpTable.purpose, purpose),
        eq(adminOtpTable.username, username),
        gt(adminOtpTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    return { ok: false, error: "Code expired or not found. Request a new one." };
  }

  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    await db.delete(adminOtpTable).where(eq(adminOtpTable.id, row.id));
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  const expected = Buffer.from(row.codeHash, "hex");
  const actual = Buffer.from(hashOtp(normalized), "hex");
  const valid = expected.length === actual.length && timingSafeEqual(expected, actual);

  if (!valid) {
    await db
      .update(adminOtpTable)
      .set({ attempts: row.attempts + 1 })
      .where(eq(adminOtpTable.id, row.id));
    return { ok: false, error: "Invalid verification code" };
  }

  await db.delete(adminOtpTable).where(eq(adminOtpTable.id, row.id));
  return { ok: true };
}
