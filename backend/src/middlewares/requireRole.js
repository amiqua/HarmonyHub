/**
 * Công dụng: Middleware kiểm tra phân quyền theo role.
 * - Dùng sau middleware `auth()` để đảm bảo req.user đã có.
 * - Ví dụ: app chỉ cho admin tạo/xoá bài hát.
 *
 * Cách dùng:
 *   router.post("/songs", auth(), requireRole("ADMIN"), ...)
 *   router.post("/songs", auth(), requireRole(["ADMIN","MOD"]), ...)
 */

import { ApiError } from "../errors/ApiError.js";

export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Bạn cần đăng nhập để thực hiện thao tác này.");
    }

    const role = req.user.role;

    if (!role || !allowed.includes(role)) {
      throw new ApiError(403, "Bạn không có quyền thực hiện thao tác này.");
    }

    return next();
  };
}
