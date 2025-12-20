/**
 * Công dụng: Khai báo danh sách role (quyền) dùng thống nhất trong toàn dự án.
 * - Tránh viết “rải rác” chuỗi role ở nhiều nơi gây sai chính tả.
 * - Dùng chung cho auth, requireRole, và các kiểm tra phân quyền khác.
 */

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
};
