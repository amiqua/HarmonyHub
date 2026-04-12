import { ApiError } from "../errors/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { isBlacklisted } from "../modules/auth/tokenBlacklist.service.js";

export function auth(options = {}) {
  const { optional = false } = options;

  return async (req, _res, next) => {
    const header = req.headers.authorization;

    console.log("[auth] Checking Authorization header:", {
      hasHeader: !!header,
      headerValue: header ? header.substring(0, 50) + "..." : "MISSING",
      optional,
    });

    if (!header) {
      console.log("[auth] Missing Authorization header");
      if (optional) return next();
      throw new ApiError(401, "Bạn cần đăng nhập (thiếu Authorization).");
    }

    const parts = header.trim().split(/\s+/);
    const type = parts[0];
    const token = parts.slice(1).join(" ");

    console.log("[auth] Parsed Authorization header:", {
      type,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 30) + "..." : "NO_TOKEN",
      partsCount: parts.length,
    });

    if (type !== "Bearer" || !token) {
      console.log("[auth] Invalid Bearer format", { type, hasToken: !!token });
      if (optional) return next();
      throw new ApiError(401, "Authorization không đúng định dạng Bearer token.");
    }

    try {
      // Check if token is blacklisted
      const blacklisted = await isBlacklisted(token);
      if (blacklisted) {
        console.log("[auth] Token is blacklisted");
        throw new ApiError(401, "Token đã bị thu hồi. Vui lòng đăng nhập lại.");
      }

      const payload = verifyAccessToken(token);
      console.log("[auth] Token verified successfully:", {
        userId: payload.userId,
        email: payload.email,
        exp: new Date(payload.exp * 1000).toISOString(),
      });
      req.user = payload; // vd: { userId, email, role, iat, exp }
      req.token = token; // Store token for logout
      return next();
    } catch (err) {
      console.error("[auth] Token verification failed:", {
        errorMessage: err.message,
        errorName: err.name,
        tokenLength: token?.length || 0,
        errorStack: err.stack,
      });
      if (err instanceof ApiError) throw err;
      if (optional) return next();
      throw new ApiError(401, "Token không hợp lệ hoặc đã hết hạn.");
    }
  };
}

