/**
 * Công dụng: Entry point của backend. Tạo HTTP server, kiểm tra kết nối DB, lắng nghe PORT,
 * và xử lý graceful shutdown (SIGINT/SIGTERM) + các lỗi process-level.
 */

import http from "http";

import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { db } from "./config/db.js";
import path from "path";

const server = http.createServer(app);
const __dirname = path.resolve();

async function bootstrap() {
  // Kiểm tra DB connection sớm để fail-fast
  try {
    await db.query("SELECT 1 as ok;");
    logger.info("Database connected ✅");
  } catch (err) {
    logger.error({ err }, "Database connection failed ❌");
    process.exit(1);
  }

  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

function shutdown(signal) {
  logger.info({ signal }, "Shutting down...");

  server.close(async () => {
    try {
      await db.end();
      logger.info("Database pool closed ✅");
    } catch (err) {
      logger.error({ err }, "Error closing database pool");
    } finally {
      process.exit(0);
    }
  });

  // Nếu quá lâu vẫn không đóng được → force exit
  setTimeout(() => {
    logger.error("Force shutdown (timeout)");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
  process.exit(1);
});

bootstrap();
