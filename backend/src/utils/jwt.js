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
  const token = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
  console.log("[jwt] Access token signed successfully:", {
    userId: payload.userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    tokenLength: token.length,
    secretConfigured: !!env.JWT_ACCESS_SECRET,
  });
  return token;
}

export function signRefreshToken(payload) {
  ensureRefreshJwtConfigured();
  const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
  console.log("[jwt] Refresh token signed successfully:", {
    userId: payload.userId,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    secretConfigured: !!env.JWT_REFRESH_SECRET,
  });
  return token;
}

export function verifyAccessToken(token) {
  ensureAccessJwtConfigured();
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    console.log("[jwt] Access token verified successfully:", {
      userId: payload.userId,
      email: payload.email,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    return payload;
  } catch (err) {
    console.error("[jwt] Access token verification FAILED:", {
      errorName: err.name,
      errorMessage: err.message,
      tokenLength: token?.length || 0,
      secretConfigured: !!env.JWT_ACCESS_SECRET,
      secretLength: env.JWT_ACCESS_SECRET?.length || 0,
    });
    throw err;
  }
}

export function verifyRefreshToken(token) {
  ensureRefreshJwtConfigured();
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    console.log("[jwt] Refresh token verified successfully:", {
      userId: payload.userId,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    return payload;
  } catch (err) {
    console.error("[jwt] Refresh token verification FAILED:", {
      errorName: err.name,
      errorMessage: err.message,
      tokenLength: token?.length || 0,
      secretConfigured: !!env.JWT_REFRESH_SECRET,
      secretLength: env.JWT_REFRESH_SECRET?.length || 0,
    });
    throw err;
  }
}
