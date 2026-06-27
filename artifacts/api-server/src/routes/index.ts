import { Router, type IRouter } from "express";
import { rateLimit } from "../lib/rate-limit";
import healthRouter from "./health";
import postsRouter from "./posts";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import statsRouter from "./stats";
import commentsRouter from "./comments";
import newsletterRouter from "./newsletter";
import profileRouter from "./profile";
import contactRouter from "./contact";
import seoRouter from "./seo";
import uploadsRouter from "./uploads";
import sitemapRouter from "./sitemap";
import aiRouter from "./ai";
import playgroundRouter from "./playground";
import roadmapsRouter from "./roadmaps";
import challengesRouter from "./challenges";
import jobsRouter from "./jobs";
import communityRouter from "./community";

const router: IRouter = Router();

const uncachedPaths = new Set(["/healthz", "/robots.txt", "/sitemap.xml", "/feed.xml"]);

router.use(
  rateLimit({
    windowMs: 60_000,
    max: Number(process.env.API_RATE_LIMIT_PER_MIN ?? 300),
    keyPrefix: "api",
    skip: (req) => uncachedPaths.has(req.path) || req.path === "/jobs/sync/cron",
  }),
);

router.use(healthRouter);
router.use(postsRouter);
router.use(categoriesRouter);
router.use(authRouter);
router.use(statsRouter);
router.use(commentsRouter);
router.use(newsletterRouter);
router.use(profileRouter);
router.use(contactRouter);
router.use(seoRouter);
router.use(uploadsRouter);
router.use(sitemapRouter);
router.use(aiRouter);
router.use(playgroundRouter);
router.use(roadmapsRouter);
router.use(challengesRouter);
router.use(jobsRouter);
router.use(communityRouter);

export default router;
