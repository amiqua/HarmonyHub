/**
 * Công dụng: Khởi tạo Express app, cấu hình middleware dùng chung (CORS, logging, rate limit, JSON),
 * mount routes (/health, /api/v1/...), và đăng ký notFound + errorHandler.
 */

import "express-async-errors";
import express from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Trust proxy (cần nếu deploy sau reverse proxy như Nginx/Render/Heroku…)
app.set("trust proxy", 1);

// Logging HTTP
app.use(
  pinoHttp({
    logger,
  })
);

// Basic middlewares
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.get("*", (req, res) => {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  }); // CORS
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
}
// Rate limit (giảm spam)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 120, // 120 requests / phút / IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use(routes);

// 404 + Error handler
app.use(notFound);
app.use(errorHandler);

export default app;
