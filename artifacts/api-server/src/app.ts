import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { lazySession } from "./lib/session-middleware";
import { isServerlessRuntime } from "./lib/runtime";

const app: Express = express();

app.set("trust proxy", 1);

if (isServerlessRuntime()) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      console.log(
        JSON.stringify({
          method: req.method,
          url: req.url?.split("?")[0],
          status: res.statusCode,
          ms: Date.now() - start,
        }),
      );
    });
    next();
  });
} else {
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url?.split("?")[0],
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
}

app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(lazySession());
app.use("/api", router);

export default app;
