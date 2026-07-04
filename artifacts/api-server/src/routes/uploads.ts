import { Router } from "express";
import { requireAuth } from "../middleware/require-auth";
import { uploadBlogImage } from "../../../../api-lib/image-upload.js";

const router = Router();

router.post("/uploads/image", requireAuth, async (req, res) => {
  try {
    const result = await uploadBlogImage(req.body as { filename?: string; contentType?: string; data?: string });
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }
    return res.json({ url: result.url });
  } catch (err) {
    req.log.error({ err }, "Failed to upload image");
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
