import { Router } from "express";
import { cachePublic } from "../lib/cache";
import { getDevHeadlines, getTechNews } from "../lib/integrations/feeds";
import { getCountries, getExchangeRates, getGeoForIp, getNpmPackage, getCryptoPrices } from "../lib/integrations/utils";
import { picsumPlaceholderUrl, searchStockImages, generateAiImage, getAiImageProviders } from "../lib/integrations/media";
import { getIntegrationsSummary } from "../lib/integrations/status";

const router = Router();

router.get("/integrations/status", cachePublic(300), (_req, res) => {
  res.json(getIntegrationsSummary());
});

router.get("/feeds/dev-headlines", cachePublic(600), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 10), 20);
    const items = await getDevHeadlines(limit);
    res.json({ items });
  } catch (err) {
    req.log.error({ err }, "Failed to load dev headlines");
    res.json({ items: [] });
  }
});

router.get("/feeds/tech-news", cachePublic(900), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 6), 12);
    const items = await getTechNews(limit);
    res.json({ items });
  } catch (err) {
    req.log.error({ err }, "Failed to load tech news");
    res.status(502).json({ error: "Failed to load tech news" });
  }
});

router.get("/utils/countries", cachePublic(86400), async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const items = await getCountries(q);
    res.json({ items });
  } catch (err) {
    req.log.error({ err }, "Failed to load countries");
    res.status(502).json({ error: "Failed to load countries" });
  }
});

router.get("/utils/exchange-rates", cachePublic(3600), async (req, res) => {
  try {
    const from = typeof req.query.from === "string" ? req.query.from : "USD";
    const to = typeof req.query.to === "string" ? req.query.to : undefined;
    const data = await getExchangeRates(from, to);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to load exchange rates");
    res.status(502).json({ error: "Failed to load exchange rates" });
  }
});

router.get("/utils/geo", cachePublic(3600), async (req, res) => {
  try {
    const ip =
      (typeof req.query.ip === "string" && req.query.ip) ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";
    const data = await getGeoForIp(ip);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to load geo data");
    res.status(502).json({ error: "Failed to load geo data" });
  }
});

router.get("/utils/npm/:name", cachePublic(1800), async (req, res) => {
  try {
    const data = await getNpmPackage(req.params.name);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to load npm package");
    res.status(502).json({ error: "Failed to load npm package" });
  }
});

router.get("/utils/crypto-prices", cachePublic(300), async (req, res) => {
  try {
    const ids = typeof req.query.ids === "string" ? req.query.ids : "bitcoin,ethereum";
    const data = await getCryptoPrices(ids);
    res.json({ prices: data });
  } catch (err) {
    req.log.error({ err }, "Failed to load crypto prices");
    res.status(502).json({ error: "Failed to load crypto prices" });
  }
});

router.get("/media/stock", cachePublic(1800), async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "technology";
    const limit = Math.min(Number(req.query.limit ?? 12), 24);
    const items = await searchStockImages(q, limit);
    res.json({ items });
  } catch (err) {
    req.log.error({ err }, "Failed to search stock images");
    res.status(502).json({ error: "Failed to search stock images" });
  }
});

router.get("/media/placeholder", (req, res) => {
  const width = Math.min(Math.max(Number(req.query.w ?? 800), 16), 2000);
  const height = Math.min(Math.max(Number(req.query.h ?? 600), 16), 2000);
  const seed = typeof req.query.seed === "string" ? req.query.seed : undefined;
  res.redirect(302, picsumPlaceholderUrl(width, height, seed));
});

router.get("/media/ai-image/providers", cachePublic(300), (_req, res) => {
  res.json(getAiImageProviders());
});

router.post("/media/ai-image/generate", async (req, res) => {
  try {
    const { prompt, model, size } = req.body as { prompt?: string; model?: string; size?: string };
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }
    const image = await generateAiImage({ prompt: prompt.trim(), model, size });
    res.json(image);
  } catch (err) {
    req.log.error({ err }, "AI image generation failed");
    const msg = err instanceof Error ? err.message : "Image generation failed";
    res.status(err instanceof Error && msg.includes("not configured") ? 503 : 502).json({ error: msg });
  }
});

export default router;
