/**
 * Công dụng: Validate dữ liệu đầu vào cho module Users.
 * - updateMeSchema: cập nhật username/email
 * - changePasswordSchema: đổi mật khẩu (yêu cầu mật khẩu cũ)
 */

import { z } from "zod";

export const updateMeSchema = z
  .object({
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().max(100).optional(),
  })
  .refine((data) => data.username || data.email, {
    message: "Cần cung cấp ít nhất 1 trường: username hoặc email",
    path: ["username"],
  });

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "oldPassword không được để trống"),
  newPassword: z.string().min(6, "newPassword tối thiểu 6 ký tự").max(100),
});
