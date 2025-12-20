/**
 * Công dụng: Middleware xác thực đăng nhập bằng JWT.
 * - Đọc token từ header: Authorization: Bearer <token>
 * - Nếu hợp lệ: gắn thông tin vào `req.user`
 * - Nếu không hợp lệ/thiếu token: trả lỗi 401
 *
 * Hỗ trợ 2 chế độ:
 * - auth()            : bắt buộc phải có token
 * - auth({ optional:true }) : không bắt buộc; nếu có token thì xác thực, không có thì cho qua
 */

import { ApiError } from "../errors/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function auth(options = {}) {
  const { optional = false } = options;

  return (req, _res, next) => {
    const header = req.headers.authorization;

    if (!header) {
      if (optional) return next();
      throw new ApiError(401, "Bạn cần đăng nhập (thiếu Authorization).");
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      if (optional) return next();
      throw new ApiError(401, "Authorization không đúng định dạng Bearer token.");
    }

    try {
      const payload = verifyAccessToken(token);
      req.user = payload; // vd: { userId, email, role, iat, exp }
      return next();
    } catch (_err) {
      if (optional) return next();
      throw new ApiError(401, "Token không hợp lệ hoặc đã hết hạn.");
    }
  };
}
