/**
 * Công dụng: (Tuỳ chọn) Tập hợp các mã lỗi chuẩn để dùng thống nhất trong toàn dự án.
 * - Nếu bạn muốn trả về cả "code" cho frontend dễ xử lý, có thể dùng file này.
 * - Hiện tại project đang dùng message trực tiếp, nhưng file này vẫn hữu ích để mở rộng.
 */

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};
