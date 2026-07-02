import "./load-env";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import aiRouter from "./routes/ai";
import { lazySession } from "./lib/session-middleware";

const app: Express = express();

app.set("trust proxy", 1);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(lazySession());
app.use("/api", aiRouter);

export default app;
