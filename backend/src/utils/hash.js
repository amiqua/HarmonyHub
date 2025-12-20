/**
 * Công dụng: Mã hoá và so sánh mật khẩu bằng bcrypt.
 * - hashPassword: nhận mật khẩu thô -> trả về password_hash để lưu DB
 * - comparePassword: so sánh mật khẩu thô với hash trong DB
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}
