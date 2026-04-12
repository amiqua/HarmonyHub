/**
 * Công dụng: Định nghĩa schema validate (Zod) cho các API auth.
 * - registerSchema: validate đăng ký
 * - loginSchema: validate đăng nhập
 * - refreshSchema: validate refresh token
 */

import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "username tối thiểu 3 ký tự").max(50).trim(),
  email: z.string().email("email không hợp lệ").max(100).toLowerCase().trim(),
  password: z
    .string()
    .min(8, "password tối thiểu 8 ký tự")
    .max(100)
    .regex(/[A-Z]/, "password phải chứa ít nhất 1 chữ hoa")
    .regex(/[a-z]/, "password phải chứa ít nhất 1 chữ thường")
    .regex(/[0-9]/, "password phải chứa ít nhất 1 chữ số")
    .regex(/[^A-Za-z0-9]/, "password phải chứa ít nhất 1 ký tự đặc biệt"),
});

export const loginSchema = z.object({
  email: z.string().email("email không hợp lệ").max(100).toLowerCase().trim(),
  password: z.string().min(1, "password không được để trống"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "refreshToken không được để trống"),
});
