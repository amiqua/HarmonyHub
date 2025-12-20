/**
 * Công dụng: Middleware bắt lỗi tập trung cho toàn bộ API.
 * - Chuẩn hoá format lỗi trả về cho client.
 * - Không để lộ stack trace trong production.
 * - Hỗ trợ ApiError (lỗi chủ động) và lỗi ngoài ý muốn (500).
 */

import { ApiError } from "../errors/ApiError.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function errorHandler(err, _req, res, _next) {
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError ? err.statusCode : (err.statusCode || 500);
  const message = isApiError ? err.message : "Lỗi hệ thống, vui lòng thử lại sau.";
  const payload = isApiError ? err.payload : undefined;

  // Log lỗi (luôn log server-side)
  logger.error(
    {
      statusCode,
      err: {
        name: err?.name,
        message: err?.message,
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
