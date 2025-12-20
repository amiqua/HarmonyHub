/**
 * Công dụng: Middleware xử lý 404 (route không tồn tại).
 * - Đặt sau cùng, trước errorHandler.
 */

import { ApiError } from "../errors/ApiError.js";

export function notFound(req, _res, next) {
  next(new ApiError(404, `Không tìm thấy API: ${req.method} ${req.originalUrl}`));
}
