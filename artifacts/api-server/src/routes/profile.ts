import { Router } from "express";
import {
  getPublishedDeveloperProfile,
  getDeveloperProfileForAdmin,
  updateDeveloperProfile,
} from "../lib/developer-profile";
import { requireAuth } from "../middleware/require-auth";
import { cachePublic } from "../lib/cache";
import { cached, invalidateCache } from "../lib/memory-cache";

const router = Router();

router.get("/profile", cachePublic(300), async (req, res) => {
  try {
    const profile = await cached("profile:published", 5 * 60_000, getPublishedDeveloperProfile);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    return res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    return res.status(500).json({ error: "Failed to get profile" });
  }
});

router.get("/profile/manage", requireAuth, async (req, res) => {
  try {
    const profile = await getDeveloperProfileForAdmin();
    return res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile for admin");
    return res.status(500).json({ error: "Failed to get profile" });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const profile = await updateDeveloperProfile(req.body);
    invalidateCache("profile:");
    return res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
