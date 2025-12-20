/**
 * Công dụng: Xử lý nghiệp vụ xác thực (đăng ký/đăng nhập/refresh/me).
 * - Làm việc với database (bảng users, favorite_lists)
 * - Hash mật khẩu, kiểm tra mật khẩu
 * - Tạo/verify JWT (access/refresh)
 *
 * Lưu ý quan trọng:
 * - Schema hiện tại CHƯA có cột role trong bảng users, nên tạm thời mọi user sẽ có role = "USER"
 * - Muốn phân quyền ADMIN thật sự: bạn nên thêm cột role vào users hoặc làm bảng roles riêng.
 * - Muốn dùng auth: cần thêm JWT_ACCESS_SECRET (và nếu dùng refresh thì thêm JWT_REFRESH_SECRET) vào .env
 */

import { db } from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../errors/ApiError.js";
import { ROLES } from "../../constants/roles.js";
import { pick } from "../../utils/pick.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

function safeUser(userRow) {
  return pick(userRow, ["id", "username", "email", "created_at"]);
}

function ensureJwtAccessConfigured() {
  if (!env.JWT_ACCESS_SECRET) {
    throw new ApiError(
      500,
      "Chưa cấu hình JWT_ACCESS_SECRET trong .env (không thể tạo access token)."
    );
  }
}

function canUseRefreshToken() {
  return Boolean(env.JWT_REFRESH_SECRET);
}

function normalizePgUniqueError(err) {
  // PostgreSQL unique violation
  // err.code === "23505"
  if (err?.code !== "23505") return null;

  const constraint = err?.constraint || "";
  if (constraint.includes("users_username_key")) {
    return new ApiError(409, "Username đã tồn tại.");
  }
  if (constraint.includes("users_email_key")) {
    return new ApiError(409, "Email đã tồn tại.");
  }
  if (constraint.includes("favorite_lists_user_id_key")) {
    return new ApiError(409, "User đã có danh sách yêu thích.");
  }

  return new ApiError(409, "Dữ liệu bị trùng (unique constraint).");
}

/**
 * Đăng ký:
 * - Check trùng email/username
 * - Tạo user + tạo favorite_list cho user
 * - Trả về user + tokens
 */
export async function register({ username, email, password }) {
  ensureJwtAccessConfigured();

  const password_hash = await hashPassword(password);

  await db.query("BEGIN");
  try {
    const userInsert = await db.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at;
      `,
      [username, email, password_hash]
    );

    const user = userInsert.rows[0];

    // Tạo favorite_list 1-1 cho user
    await db.query(
      `
      INSERT INTO favorite_lists (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING;
      `,
      [user.id]
    );

    // Token payload (tạm thời role luôn USER)
    const payload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: ROLES.USER,
    };

    const accessToken = signAccessToken(payload);
    const tokens = { accessToken };

    // Nếu bạn cấu hình refresh secret thì trả thêm refreshToken
    if (canUseRefreshToken()) {
      tokens.refreshToken = signRefreshToken(payload);
    }

    await db.query("COMMIT");
    return { user: safeUser(user), tokens };
  } catch (err) {
    await db.query("ROLLBACK");

    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;

    throw err;
  }
}

/**
 * Đăng nhập:
 * - Tìm user theo email
 * - So sánh mật khẩu
 * - Trả về user + tokens
 */
export async function login({ email, password }) {
  ensureJwtAccessConfigured();

  const result = await db.query(
    `
    SELECT id, username, email, password_hash, created_at
    FROM users
    WHERE email = $1
    LIMIT 1;
    `,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng.");
  }

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng.");
  }

  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: ROLES.USER,
  };

  const accessToken = signAccessToken(payload);
  const tokens = { accessToken };

  if (canUseRefreshToken()) {
    tokens.refreshToken = signRefreshToken(payload);
  }

  return { user: safeUser(user), tokens };
}

/**
 * Refresh token:
 * - Verify refresh token
 * - Tạo access token mới
 *
 * Lưu ý: Chỉ dùng được nếu có JWT_REFRESH_SECRET trong .env
 */
export async function refresh({ refreshToken }) {
  if (!canUseRefreshToken()) {
    throw new ApiError(
      501,
      "Chức năng refresh token chưa được bật. Hãy thêm JWT_REFRESH_SECRET vào .env nếu muốn dùng."
    );
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_err) {
    throw new ApiError(401, "Refresh token không hợp lệ hoặc đã hết hạn.");
  }

  // Có thể kiểm tra user còn tồn tại không (để chắc chắn)
  const userId = payload?.userId;
  if (!userId) {
    throw new ApiError(401, "Refresh token không hợp lệ.");
  }

  const userRes = await db.query(
    `SELECT id, username, email, created_at FROM users WHERE id = $1 LIMIT 1;`,
    [userId]
  );

  const user = userRes.rows[0];
  if (!user) {
    throw new ApiError(401, "Tài khoản không tồn tại.");
  }

  ensureJwtAccessConfigured();
  const newAccessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    username: user.username,
    role: ROLES.USER,
  });

  return { accessToken: newAccessToken };
}

/**
 * Lấy thông tin user hiện tại:
 * - Dựa vào req.user (payload token)
 * - Query DB để trả thông tin mới nhất
 */
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
