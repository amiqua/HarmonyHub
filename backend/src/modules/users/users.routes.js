/**
 * Công dụng: Khai báo các route liên quan đến User (thông tin cá nhân).
 * - Lấy profile của user hiện tại
 * - Cập nhật username/email
 * - (Tuỳ chọn) đổi mật khẩu
 *
 * Lưu ý: Các route này yêu cầu đăng nhập (auth()).
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as usersController from "./users.controller.js";
import { updateMeSchema, changePasswordSchema } from "./users.validation.js";

const router = Router();

/**
 * Lấy thông tin user hiện tại
 * GET /api/v1/users/me
 */
router.get("/me", auth(), usersController.getMe);

/**
 * Cập nhật username/email
 * PATCH /api/v1/users/me
 */
router.patch("/me", auth(), validate({ body: updateMeSchema }), usersController.updateMe);

/**
 * Đổi mật khẩu
 * PATCH /api/v1/users/me/password
 */
router.patch(
  "/me/password",
  auth(),
  validate({ body: changePasswordSchema }),
  usersController.changePassword
);

export default router;
