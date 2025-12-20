/**
 * Công dụng: Khai báo các route liên quan tới xác thực (đăng ký/đăng nhập/refresh/me).
 * - Chỉ định middleware validate dữ liệu đầu vào
 * - Gọi controller tương ứng để xử lý
 */

import { Router } from "express";

import { validate } from "../../middlewares/validate.js";
import { auth } from "../../middlewares/auth.js";

import * as authController from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation.js";

const router = Router();

/**
 * Đăng ký tài khoản
 * POST /api/v1/auth/register
 */
router.post("/register", validate({ body: registerSchema }), authController.register);

/**
 * Đăng nhập
 * POST /api/v1/auth/login
 */
router.post("/login", validate({ body: loginSchema }), authController.login);

/**
 * Refresh access token (tuỳ chọn dùng, nếu bạn triển khai refresh token)
 * POST /api/v1/auth/refresh
 */
router.post("/refresh", validate({ body: refreshSchema }), authController.refresh);

/**
 * Lấy thông tin user hiện tại theo access token
 * GET /api/v1/auth/me
 */
router.get("/me", auth(), authController.me);

export default router;
