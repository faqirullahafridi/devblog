import { Router } from "express";
import type { Request, Response } from "express";
import {
  verifyAdminLogin,
  changeAdminPassword,
  changeAdminUsername,
  resetAdminPassword,
} from "../lib/admin-credentials";
import { requireAuth } from "../middleware/require-auth";

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
    adminUsername?: string;
  }
}

const router = Router();

const noCache = (_req: unknown, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
  (res as Response).setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  (res as Response).setHeader("Pragma", "no-cache");
  next();
};

router.post("/auth/login", noCache as any, async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(401).json({ authenticated: false, username: null });
  }
  const result = await verifyAdminLogin(username, password);
  if (result.ok) {
    req.session.adminAuthenticated = true;
    req.session.adminUsername = result.username;
    return req.session.save((err) => {
      if (err) {
        req.log.error({ err }, "Failed to persist session after login");
        return res.status(500).json({ authenticated: false, username: null });
      }
      return res.json({ authenticated: true, username: result.username });
    });
  }
  return res.status(401).json({ authenticated: false, username: null });
});

router.post("/auth/logout", noCache as any, (req, res) => {
  req.session.destroy(() => {
    res.json({ authenticated: false, username: null });
  });
});

router.get("/auth/me", noCache as any, (req, res) => {
  if (req.session.adminAuthenticated) {
    res.json({ authenticated: true, username: req.session.adminUsername ?? null });
  } else {
    res.json({ authenticated: false, username: null });
  }
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

router.post("/auth/forgot-password", noCache as any, async (req, res) => {
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

export default router;
