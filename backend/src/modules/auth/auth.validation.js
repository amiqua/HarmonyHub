/**
 * Công dụng: Định nghĩa schema validate (Zod) cho các API auth.
 * - registerSchema: validate đăng ký
 * - loginSchema: validate đăng nhập
 * - refreshSchema: validate refresh token
 */

import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "username tối thiểu 3 ký tự").max(50),
  email: z.string().email("email không hợp lệ").max(100),
  password: z.string().min(6, "password tối thiểu 6 ký tự").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("email không hợp lệ").max(100),
  password: z.string().min(1, "password không được để trống"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken không được để trống"),
});
