/**
 * Công dụng: Tạo và xác thực JWT (access token / refresh token).
 * - signAccessToken(payload): tạo access token
 * - signRefreshToken(payload): tạo refresh token
 * - verifyAccessToken(token): kiểm tra access token, trả payload
 * - verifyRefreshToken(token): kiểm tra refresh token, trả payload
 *
 * Lưu ý:
 * - Muốn dùng auth đầy đủ, bạn cần khai báo các biến trong .env:
 *   JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function ensureAccessJwtConfigured() {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error("Thiếu JWT_ACCESS_SECRET trong .env (chưa cấu hình JWT access token).");
  }
}

function ensureRefreshJwtConfigured() {
  if (!env.JWT_REFRESH_SECRET) {
    throw new Error("Thiếu JWT_REFRESH_SECRET trong .env (chưa cấu hình JWT refresh token).");
  }
}

export function signAccessToken(payload) {
  ensureAccessJwtConfigured();
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN || "1d",
  });
}

export function signRefreshToken(payload) {
  ensureRefreshJwtConfigured();
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

export function verifyAccessToken(token) {
  ensureAccessJwtConfigured();
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  ensureRefreshJwtConfigured();
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
