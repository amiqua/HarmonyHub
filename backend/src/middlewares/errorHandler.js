/**
 * Công dụng: Middleware bắt lỗi tập trung cho toàn bộ API.
 * - Chuẩn hoá format lỗi trả về cho client.
 * - Không để lộ stack trace trong production.
 * - Sanitize constraint names để không lộ schema
 * - Hỗ trợ ApiError (lỗi chủ động) và lỗi ngoài ý muốn (500).
 */

import { ApiError } from "../errors/ApiError.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function sanitizeMessage(message) {
  if (!message) return message;

  // Hide PostgreSQL constraint names
  message = message.replace(/UNIQUE constraint "(.*?)"/g, "Dữ liệu bị trùng");
  message = message.replace(/Foreign key violation on (.*?)\./g, "Dữ liệu không hợp lệ");
  message = message.replace(/violates foreign key constraint "(.*?)"/g, "Dữ liệu không tồn tại");
  
  return message;
}

export function errorHandler(err, _req, res, _next) {
  const isApiError = err instanceof ApiError;

  let statusCode = isApiError ? err.statusCode : (err.statusCode || 500);
  let message = isApiError ? err.message : "Lỗi hệ thống, vui lòng thử lại sau.";
  let payload = isApiError ? err.payload : undefined;

  // Sanitize database errors
  if (!isApiError && err.code) {
    message = "Lỗi xử lý dữ liệu, vui lòng thử lại sau.";
    payload = undefined;
  }

  // Sanitize message to hide sensitive info
  message = sanitizeMessage(message);

  // Log lỗi (luôn log server-side với thông tin đầy đủ)
  logger.error(
    {
      statusCode,
      err: {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      },
      payload,
    },
    "Request error"
  );

  // Response lỗi cho client
  const response = {
    success: false,
    message,
    ...(payload ? { payload } : {}),
  };

  // Nếu không phải production, có thể trả thêm stack để debug
  if (process.env.NODE_ENV !== "production") {
    response.debug = {
      name: err?.name,
      stack: err?.stack,
    };
  }

  res.status(statusCode).json(response);
}
