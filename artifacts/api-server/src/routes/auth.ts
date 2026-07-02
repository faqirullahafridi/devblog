import { Router } from "express";
import type { Request, Response } from "express";
import {
  verifyAdminLogin,
  changeAdminPassword,
  changeAdminUsername,
  resetAdminPassword,
  resetAdminPasswordWithOtp,
  getAdminUsername,
} from "../lib/admin-credentials";
import { requireAuth } from "../middleware/require-auth";
import {
  getSiteUrl,
  sendAdminLoginOtpEmail,
  sendAdminPasswordResetOtpEmail,
} from "../lib/resend";
import { issueOtp, verifyOtp } from "../lib/admin-otp";
import {
  adminSessionExpiresAt,
  clearAdminSession,
  isAdminSessionValid,
  touchAdminSession,
} from "../lib/admin-session";
import { rateLimit } from "../lib/rate-limit";

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
    adminUsername?: string;
    adminLoginAt?: number;
    githubId?: string;
    githubLogin?: string;
    githubName?: string;
    githubAvatar?: string;
    githubOAuthState?: string;
  }
}

const router = Router();

const noCache = (_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
  (res as Response).setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  (res as Response).setHeader("Pragma", "no-cache");
  next();
};

const otpRequestLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 8,
  keyPrefix: "admin-otp-request",
});

const otpVerifyLimit = rateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  keyPrefix: "admin-otp-verify",
});

function authPayload(req: Request) {
  const valid = isAdminSessionValid(req.session);
  if (!valid && req.session.adminAuthenticated) {
    clearAdminSession(req.session);
  }

  return {
    authenticated: valid,
    username: valid ? (req.session.adminUsername ?? null) : null,
    expiresAt: valid ? adminSessionExpiresAt(req.session) : null,
  };
}

router.post("/auth/login", noCache as any, otpRequestLimit, async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(401).json({ authenticated: false, username: null, otpRequired: false });
  }

  const result = await verifyAdminLogin(username, password);
  if (!result.ok) {
    return res.status(401).json({ authenticated: false, username: null, otpRequired: false });
  }

  try {
    const code = await issueOtp("login", result.username);
    const sent = await sendAdminLoginOtpEmail(result.username, code);
    if (!sent.ok) {
      if (process.env.NODE_ENV === "development") {
        req.log.warn({ username: result.username, code }, "Admin login OTP (email failed — dev console fallback)");
        return res.json({
          authenticated: false,
          username: result.username,
          otpRequired: true,
          message: "Email could not be sent locally. Check the API server terminal for your 6-digit code.",
        });
      }
      return res.status(503).json({
        authenticated: false,
        username: null,
        otpRequired: false,
        error: "Could not send verification email. Check RESEND_API_KEY and ADMIN_EMAIL.",
      });
    }

    return res.json({
      authenticated: false,
      username: result.username,
      otpRequired: true,
      message: "Verification code sent to your admin email.",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to issue admin login OTP");
    return res.status(500).json({
      authenticated: false,
      username: null,
      otpRequired: false,
      error: "Failed to start sign-in. Ensure the database is migrated.",
    });
  }
});

router.post("/auth/verify-otp", noCache as any, otpVerifyLimit, async (req, res) => {
  const { username, otp } = req.body as { username?: string; otp?: string };
  if (!username || !otp) {
    return res.status(400).json({ authenticated: false, username: null, error: "Username and code are required" });
  }

  try {
    const verified = await verifyOtp("login", username.trim(), otp);
    if (!verified.ok) {
      return res.status(401).json({ authenticated: false, username: null, error: verified.error });
    }

    touchAdminSession(req.session);
    req.session.adminUsername = username.trim();

    return req.session.save((err) => {
      if (err) {
        req.log.error({ err }, "Failed to persist session after OTP");
        return res.status(500).json({ authenticated: false, username: null, error: "Failed to create session" });
      }
      return res.json({
        authenticated: true,
        username: req.session.adminUsername,
        expiresAt: adminSessionExpiresAt(req.session),
      });
    });
  } catch (err) {
    req.log.error({ err }, "Failed to verify admin login OTP");
    return res.status(500).json({
      authenticated: false,
      username: null,
      error: "Verification failed. Ensure admin_otp_codes table exists (run db push).",
    });
  }
});

router.post("/auth/logout", noCache as any, (req, res) => {
  req.session.destroy(() => {
    res.json({ authenticated: false, username: null, expiresAt: null });
  });
});

router.get("/auth/me", noCache as any, (req, res) => {
  const payload = authPayload(req);
  if (!payload.authenticated && req.session.adminAuthenticated) {
    return req.session.destroy(() => {
      res.json({ authenticated: false, username: null, expiresAt: null });
    });
  }
  res.json(payload);
});

router.post("/auth/change-password", noCache as any, requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }
    const result = await changeAdminPassword(currentPassword, newPassword);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to change password");
    return res.status(500).json({ error: "Failed to change password. Ensure the database is migrated." });
  }
});

router.post("/auth/change-username", noCache as any, requireAuth, async (req, res) => {
  try {
    const { currentPassword, newUsername } = req.body as {
      currentPassword?: string;
      newUsername?: string;
    };
    if (!currentPassword || !newUsername) {
      return res.status(400).json({ error: "Current password and new username are required" });
    }
    const result = await changeAdminUsername(currentPassword, newUsername);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }
    req.session.adminUsername = result.username;
    return res.json({ success: true, username: result.username });
  } catch (err) {
    req.log.error({ err }, "Failed to change username");
    return res.status(500).json({ error: "Failed to change username. Ensure the database is migrated." });
  }
});

router.post("/auth/forgot-password", noCache as any, otpRequestLimit, async (req, res) => {
  const { username } = req.body as { username?: string };
  if (!username?.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const adminUsername = await getAdminUsername();
    if (username.trim() !== adminUsername) {
      return res.json({
        success: true,
        message: "If that account exists, a reset code was sent to the admin email.",
      });
    }

    const code = await issueOtp("password_reset", adminUsername);
    const sent = await sendAdminPasswordResetOtpEmail(adminUsername, code);
    if (!sent.ok) {
      if (process.env.NODE_ENV === "development") {
        req.log.warn({ username: adminUsername, code }, "Password reset OTP (email failed — dev console fallback)");
        return res.json({
          success: true,
          message: "Email could not be sent locally. Check the API server terminal for your reset code.",
          otpRequired: true,
        });
      }
      return res.status(503).json({
        error: "Could not send reset email. Check RESEND_API_KEY and ADMIN_EMAIL.",
      });
    }

    return res.json({
      success: true,
      message: "If that account exists, a reset code was sent to the admin email.",
      otpRequired: true,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to send password reset OTP");
    return res.status(500).json({ error: "Failed to request password reset." });
  }
});

router.post("/auth/reset-password", noCache as any, otpVerifyLimit, async (req, res) => {
  const { username, otp, newPassword } = req.body as {
    username?: string;
    otp?: string;
    newPassword?: string;
  };

  if (!username || !otp || !newPassword) {
    return res.status(400).json({ error: "Username, code, and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  try {
    const verified = await verifyOtp("password_reset", username.trim(), otp);
    if (!verified.ok) {
      return res.status(400).json({ error: verified.error });
    }

    const adminUsername = await getAdminUsername();
    if (username.trim() !== adminUsername) {
      return res.status(400).json({ error: "Invalid account" });
    }

    await resetAdminPasswordWithOtp(newPassword);
    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to reset password with OTP");
    return res.status(500).json({ error: "Failed to reset password." });
  }
});

/** Legacy recovery-token reset (kept for env-based recovery). */
router.post("/auth/forgot-password/legacy", noCache as any, async (req, res) => {
  const { username, recoveryToken, newPassword } = req.body as {
    username?: string;
    recoveryToken?: string;
    newPassword?: string;
  };
  if (!username || !recoveryToken || !newPassword) {
    return res.status(400).json({ error: "Username, recovery token, and new password are required" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }
  const result = await resetAdminPassword(username, recoveryToken, newPassword);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }
  return res.json({ success: true });
});

function githubConfigured(): boolean {
  return Boolean(process.env.GITHUB_CLIENT_ID?.trim() && process.env.GITHUB_CLIENT_SECRET?.trim());
}

router.get("/auth/github", noCache as any, (req, res) => {
  if (!githubConfigured()) {
    return res.status(503).json({ error: "GitHub OAuth not configured" });
  }

  const state = Buffer.from(`${Date.now()}:${Math.random()}`).toString("base64url");
  req.session.githubOAuthState = state;

  const redirectUri = `${getSiteUrl()}/api/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!.trim(),
    redirect_uri: redirectUri,
    scope: "read:user",
    state,
  });

  req.session.save((err) => {
    if (err) return res.status(500).json({ error: "Failed to start GitHub login" });
    res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  });
});

router.get("/auth/github/callback", noCache as any, async (req, res) => {
  if (!githubConfigured()) {
    return res.redirect("/community?auth=unconfigured");
  }

  const { code, state } = req.query as { code?: string; state?: string };
  if (!code || !state || state !== req.session.githubOAuthState) {
    return res.redirect("/community?auth=failed");
  }

  delete req.session.githubOAuthState;

  try {
    const redirectUri = `${getSiteUrl()}/api/auth/github/callback`;
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!.trim(),
        client_secret: process.env.GITHUB_CLIENT_SECRET!.trim(),
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      return res.redirect("/community?auth=failed");
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "devblog-platform",
      },
    });

    const user = (await userRes.json()) as {
      id?: number;
      login?: string;
      name?: string;
      avatar_url?: string;
    };

    if (!user.id || !user.login) {
      return res.redirect("/community?auth=failed");
    }

    req.session.githubId = String(user.id);
    req.session.githubLogin = user.login;
    req.session.githubName = user.name ?? user.login;
    req.session.githubAvatar = user.avatar_url ?? undefined;

    req.session.save((err) => {
      if (err) return res.redirect("/community?auth=failed");
      res.redirect("/community?auth=success");
    });
  } catch (err) {
    req.log.error({ err }, "GitHub OAuth callback failed");
    res.redirect("/community?auth=failed");
  }
});

router.get("/auth/github/me", noCache as any, (req, res) => {
  if (!req.session.githubLogin) {
    return res.json({ authenticated: false, user: null });
  }

  res.json({
    authenticated: true,
    user: {
      id: req.session.githubId,
      login: req.session.githubLogin,
      name: req.session.githubName,
      avatar: req.session.githubAvatar,
    },
  });
});

router.post("/auth/github/logout", noCache as any, (req, res) => {
  delete req.session.githubId;
  delete req.session.githubLogin;
  delete req.session.githubName;
  delete req.session.githubAvatar;
  req.session.save((err) => {
    if (err) return res.status(500).json({ error: "Failed to log out" });
    res.json({ authenticated: false, user: null });
  });
});

export default router;
