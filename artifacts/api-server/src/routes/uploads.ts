import { Router } from "express";
import { randomBytes } from "node:crypto";
import { requireAuth } from "../middleware/require-auth";

const router = Router();

router.post("/uploads/image", requireAuth, async (req, res) => {
  try {
    const { filename, contentType, data } = req.body as {
      filename?: string;
      contentType?: string;
      data?: string;
    };

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return res.status(503).json({
        error: "Image upload not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or use an image URL.",
      });
    }

    if (!filename || !contentType || !data) {
      return res.status(400).json({ error: "filename, contentType, and data (base64) are required" });
    }

    const ext = filename.split(".").pop() || "jpg";
    const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const buffer = Buffer.from(data, "base64");
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "blog-images";

    const uploadRes = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${safeName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: buffer,
      },
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      req.log.error({ err }, "Supabase upload failed");
      return res.status(500).json({
        error: "Upload failed. Ensure the 'blog-images' bucket exists in Supabase Storage.",
      });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${safeName}`;
    return res.json({ url: publicUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to upload image");
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
