/**
 * Công dụng: Xử lý nghiệp vụ cho User (profile).
 * - getMe: lấy thông tin user hiện tại
 * - updateMe: cập nhật username/email (có kiểm tra trùng UNIQUE)
 * - changePassword: đổi mật khẩu (bắt buộc đúng mật khẩu cũ)
 *
 * Lưu ý:
 * - Bảng users hiện tại chỉ có: id, username, email, password_hash, created_at
 * - Không có cột role nên role đang lấy từ token (tạm thời).
 */

import { db } from "../../config/db.js";
import { ApiError } from "../../errors/ApiError.js";
import { pick } from "../../utils/pick.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";

function safeUser(userRow) {
  return pick(userRow, ["id", "username", "email", "created_at"]);
}

function normalizePgUniqueError(err) {
  if (err?.code !== "23505") return null;

  const constraint = err?.constraint || "";
  if (constraint.includes("users_username_key")) {
    return new ApiError(409, "Username đã tồn tại.");
  }
  if (constraint.includes("users_email_key")) {
    return new ApiError(409, "Email đã tồn tại.");
  }

  return new ApiError(409, "Dữ liệu bị trùng (unique constraint).");
}

export async function getMe(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Token không hợp lệ.");

  const result = await db.query(
    `SELECT id, username, email, created_at FROM users WHERE id = $1 LIMIT 1;`,
    [userId]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, "Không tìm thấy user.");

  return { user: safeUser(user) };
}

export async function updateMe(userPayload, data) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Token không hợp lệ.");

  const { username, email } = data;

  // Lấy user hiện tại để so sánh / đảm bảo tồn tại
  const currentRes = await db.query(
    `SELECT id, username, email, created_at FROM users WHERE id = $1 LIMIT 1;`,
    [userId]
  );
  const current = currentRes.rows[0];
  if (!current) throw new ApiError(404, "Không tìm thấy user.");

  // Nếu không có thay đổi thực sự
  if (
    (username === undefined || username === current.username) &&
    (email === undefined || email === current.email)
  ) {
    return { user: safeUser(current) };
  }

  try {
    const updatedRes = await db.query(
      `
      UPDATE users
      SET
        username = COALESCE($1, username),
        email = COALESCE($2, email)
      WHERE id = $3
      RETURNING id, username, email, created_at;
      `,
      [username ?? null, email ?? null, userId]
    );

    const updated = updatedRes.rows[0];
    return { user: safeUser(updated) };
  } catch (err) {
    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function changePassword(userPayload, { oldPassword, newPassword }) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Token không hợp lệ.");

  const result = await db.query(
    `
    SELECT id, username, email, password_hash, created_at
    FROM users
    WHERE id = $1
    LIMIT 1;
    `,
    [userId]
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(404, "Không tìm thấy user.");

  const ok = await comparePassword(oldPassword, user.password_hash);
  if (!ok) throw new ApiError(400, "Mật khẩu cũ không đúng.");

  const newHash = await hashPassword(newPassword);

  await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2;`, [newHash, userId]);

  return { message: "Đổi mật khẩu thành công." };
}
