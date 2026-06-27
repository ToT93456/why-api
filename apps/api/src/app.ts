import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { adminRouter } from "./api/admin.routes.js";
import { authRouter } from "./api/auth.routes.js";
import { healthRouter } from "./api/health.routes.js";
import { scriptsRouter } from "./api/scripts.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { rateLimiter } from "./middleware/rate-limit.js";

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL?.split(",") ?? ["http://localhost:3000"],
      credentials: true,
    }),
  );
  app.use(helmet());
  app.use(rateLimiter);
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.use("/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/scripts", scriptsRouter);
  app.use("/api/v1/admin", adminRouter);

  app.use(errorHandler);

  return app;
};
