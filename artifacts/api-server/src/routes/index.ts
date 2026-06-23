import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import categoriesRouter from "./categories";
import authRouter from "./auth";
import statsRouter from "./stats";
import commentsRouter from "./comments";
import newsletterRouter from "./newsletter";
import sitemapRouter from "./sitemap";

const router: IRouter = Router();

router.use(healthRouter);
router.use(postsRouter);
router.use(categoriesRouter);
router.use(authRouter);
router.use(statsRouter);
router.use(commentsRouter);
router.use(newsletterRouter);
router.use(sitemapRouter);

export default router;
