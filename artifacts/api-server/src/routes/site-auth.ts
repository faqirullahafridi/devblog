import { Router } from "express";
import type { Request, Response } from "express";
import { db, siteUsersTable, communityUsersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { getVisitorId } from "../lib/visitor-session";
import { hashPassword, verifyPassword } from "../lib/password";
import { rateLimit } from "../lib/rate-limit";

declare module "express-session" {
  interface SessionData {
    siteUserId?: number;
    siteUsername?: string;
    siteDisplayName?: string;
    siteUserEmail?: string;
  }
}

const router = Router();

const noCache = (_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
  (res as Response).setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  (res as Response).setHeader("Pragma", "no-cache");
  next();
};

const signupLimit = rateLimit({ windowMs: 15 * 60_000, max: 5, keyPrefix: "site-signup" });
const loginLimit = rateLimit({ windowMs: 15 * 60_000, max: 20, keyPrefix: "site-login" });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function userPayload(req: Request) {
  if (!req.session.siteUserId) {
    return { authenticated: false as const, user: null };
  }
  return {
    authenticated: true as const,
    user: {
      id: req.session.siteUserId,
      username: req.session.siteUsername ?? "",
      displayName: req.session.siteDisplayName ?? "",
      email: req.session.siteUserEmail ?? "",
    },
  };
}

function setSiteSession(
  req: Request,
  user: { id: number; username: string; displayName: string; email: string },
) {
  req.session.siteUserId = user.id;
  req.session.siteUsername = user.username;
  req.session.siteDisplayName = user.displayName;
  req.session.siteUserEmail = user.email;
}

async function linkCommunityProfile(req: Request, res: Response, username: string) {
  const visitorId = getVisitorId(req, res);
  const [existing] = await db
    .select()
    .from(communityUsersTable)
    .where(eq(communityUsersTable.visitorId, visitorId))
    .limit(1);
  if (existing) {
    await db
      .update(communityUsersTable)
      .set({ username })
      .where(eq(communityUsersTable.id, existing.id));
    return;
  }
  await db.insert(communityUsersTable).values({ visitorId, username });
}

router.get("/auth/user/me", noCache as any, (req, res) => {
  res.json(userPayload(req));
});

router.post("/auth/signup", noCache as any, signupLimit, async (req, res) => {
  try {
    const { email, username, password, displayName } = req.body as {
      email?: string;
      username?: string;
      password?: string;
      displayName?: string;
    };

    if (!email?.trim() || !username?.trim() || !password) {
      return res.status(400).json({ error: "Email, username, and password are required" });
    }
    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: "Enter a valid email address" });
    }
    const uname = normalizeUsername(username);
    if (!USERNAME_RE.test(uname)) {
      return res.status(400).json({ error: "Username must be 3–32 characters (letters, numbers, underscore)" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const emailNorm = normalizeEmail(email);
    const name = displayName?.trim() || username.trim();

    const [existing] = await db
      .select({ id: siteUsersTable.id })
      .from(siteUsersTable)
      .where(or(eq(siteUsersTable.email, emailNorm), eq(siteUsersTable.username, uname)))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Email or username is already taken" });
    }

    const [created] = await db
      .insert(siteUsersTable)
      .values({
        email: emailNorm,
        username: uname,
        displayName: name,
        passwordHash: hashPassword(password),
      })
      .returning();

    setSiteSession(req, {
      id: created.id,
      username: created.username,
      displayName: created.displayName,
      email: created.email,
    });

    await linkCommunityProfile(req, res, created.username);

    return req.session.save((err) => {
      if (err) {
        req.log.error({ err }, "Failed to persist site user session after signup");
        return res.status(500).json({ error: "Account created but sign-in failed. Try logging in." });
      }
      return res.status(201).json(userPayload(req));
    });
  } catch (err) {
    req.log.error({ err }, "Site signup failed");
    return res.status(500).json({ error: "Could not create account" });
  }
});

router.post("/auth/user/login", noCache as any, loginLimit, async (req, res) => {
  try {
    const { login, password } = req.body as { login?: string; password?: string };
    if (!login?.trim() || !password) {
      return res.status(400).json({ error: "Email/username and password are required" });
    }

    const key = login.includes("@") ? normalizeEmail(login) : normalizeUsername(login);
    const [user] = await db
      .select()
      .from(siteUsersTable)
      .where(
        login.includes("@")
          ? eq(siteUsersTable.email, key)
          : eq(siteUsersTable.username, key),
      )
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid email/username or password" });
    }

    setSiteSession(req, {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
    });

    await linkCommunityProfile(req, res, user.username);

    return req.session.save((err) => {
      if (err) {
        req.log.error({ err }, "Failed to persist site user session");
        return res.status(500).json({ error: "Sign-in failed" });
      }
      return res.json(userPayload(req));
    });
  } catch (err) {
    req.log.error({ err }, "Site login failed");
    return res.status(500).json({ error: "Sign-in failed" });
  }
});

router.post("/auth/user/logout", noCache as any, (req, res) => {
  delete req.session.siteUserId;
  delete req.session.siteUsername;
  delete req.session.siteDisplayName;
  delete req.session.siteUserEmail;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: "Sign-out failed" });
    res.json({ authenticated: false, user: null });
  });
});

export default router;
