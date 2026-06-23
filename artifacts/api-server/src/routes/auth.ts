import { Router } from "express";
import type { Request } from "express";

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
    adminUsername?: string;
  }
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const router = Router();

router.post("/auth/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.adminAuthenticated = true;
    req.session.adminUsername = username;
    res.json({ authenticated: true, username });
  } else {
    res.status(401).json({ authenticated: false, username: null });
  }
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ authenticated: false, username: null });
  });
});

router.get("/auth/me", (req, res) => {
  if (req.session.adminAuthenticated) {
    res.json({ authenticated: true, username: req.session.adminUsername ?? null });
  } else {
    res.json({ authenticated: false, username: null });
  }
});

export default router;
