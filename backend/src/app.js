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

// Different limits for different endpoints
app.use((req, res, next) => {
  if (req.path.startsWith("/api/v1/uploads")) {
    express.json({ limit: "100mb" })(req, res, next);
  } else {
    express.json({ limit: "2mb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// CORS (nên để ngoài if để prod cũng dùng được)
const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Rate limiting with granular control
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: "Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Rate limit by IP + email combination for login
    return `${req.ip}-${req.body?.email || ""}`;
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: "Quá nhiều đăng ký, vui lòng thử lại sau 1 giờ",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 120, // 120 requests / phút / IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Export limiters for use in routes
export { loginLimiter, registerLimiter, apiLimiter };

// Cache control middleware
app.use((req, res, next) => {
  // Don't cache auth endpoints
  if (req.path.includes("/auth")) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return next();
  }

  // Cache GET requests (5 minutes)
  if (req.method === "GET") {
    res.set("Cache-Control", "public, max-age=300");
    return next();
  }

  // No cache for mutations
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  next();
});

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
