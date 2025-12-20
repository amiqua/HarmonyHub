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
import path from "path";
import { fileURLToPath } from "url";

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

// CORS (nên để ngoài if để prod cũng dùng được)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Rate limit (giảm spam)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 120, // 120 requests / phút / IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes API
app.use(routes);

/**
 * Serve frontend build (Vite) ở production:
 * - Trả file tĩnh trong frontend/dist
 * - Với mọi route KHÔNG phải /api thì trả index.html (để React Router xử lý)
 */
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // backend/src/app.js -> ../../frontend/dist (repo root/frontend/dist)
  const distPath = path.resolve(__dirname, "../../frontend/dist");

  app.use(express.static(distPath));

  // Fallback cho SPA routes (không đụng vào /api)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// 404 + Error handler (để sau cùng)
app.use(notFound);
app.use(errorHandler);

export default app;
