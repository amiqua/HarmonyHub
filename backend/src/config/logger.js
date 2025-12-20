/**
 * Công dụng: Tạo logger dùng chung cho toàn dự án (ghi log theo chuẩn).
 * - Dùng pino (nhẹ, nhanh)
 * - Điều chỉnh mức log qua biến môi trường LOG_LEVEL (info, debug, error...)
 * - Import `logger` ở mọi nơi cần log: logger.info(...), logger.error(...)
 */

import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.LOG_LEVEL || "info",
  base: undefined, // bỏ pid/hostname cho gọn (tuỳ thích)
  timestamp: pino.stdTimeFunctions.isoTime,
});
