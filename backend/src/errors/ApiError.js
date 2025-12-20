/**
 * Công dụng: Định nghĩa class lỗi chuẩn cho API.
 * - Dùng để "chủ động" ném lỗi với statusCode + message + payload (chi tiết).
 * - errorHandler sẽ nhận ApiError và trả response đúng format.
 *
 * Ví dụ:
 *   throw new ApiError(401, "Bạn cần đăng nhập");
 *   throw new ApiError(400, "Dữ liệu không hợp lệ", { details: [...] });
 */

export class ApiError extends Error {
  constructor(statusCode, message, payload) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}
