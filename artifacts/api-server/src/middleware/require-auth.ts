import type { Request, Response, NextFunction } from "express";
import { isAdminSessionValid, clearAdminSession } from "../lib/admin-session";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAdminSessionValid(req.session)) {
    if (req.session.adminAuthenticated) {
      clearAdminSession(req.session);
      req.session.destroy(() => {
        res.status(401).json({ error: "Session expired" });
      });
      return;
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
