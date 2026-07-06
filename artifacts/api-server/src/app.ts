import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Expo web build lives at artifacts/checkee-fnb/dist.
// __dirname at runtime = artifacts/api-server/dist/
// Two levels up (.., ..) reaches artifacts/, then into checkee-fnb/dist.
const WEB_DIST = path.resolve(__dirname, "..", "..", "checkee-fnb", "dist");
const hasWebBuild = fs.existsSync(path.join(WEB_DIST, "index.html"));

const app: Express = express();

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the Expo web build for all non-API routes (SPA fallback)
if (hasWebBuild) {
  app.use(express.static(WEB_DIST));
  app.get("/{*path}", (_req: Request, res: Response) => {
    res.sendFile(path.join(WEB_DIST, "index.html"));
  });
}

export default app;
