/**
 * Công dụng: Lấy ra một số field nhất định từ object (tránh lộ dữ liệu thừa).
 * - Hữu ích khi trả response (ví dụ: không trả password_hash).
 *
 * Ví dụ:
 *   const safeUser = pick(user, ["id", "username", "email", "created_at"]);
 */

export function pick(obj, keys = []) {
  const out = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) {
      out[k] = obj[k];
    }
  }
  return out;
}
