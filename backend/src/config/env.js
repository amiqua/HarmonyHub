/**
 * Công dụng: Đọc và validate biến môi trường từ .env
 * - Các biến Cloudinary để upload audio
 * - Các biến khác (PORT, DATABASE_URL, JWT...) để app chạy ổn định
 */

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL là bắt buộc"),

  // Cloudinary (cho upload) - cho phép optional để app vẫn chạy nếu chưa dùng upload
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // CORS (nếu bạn có dùng)
  CORS_ORIGIN: z.string().default("*"),

  // JWT (tuỳ bạn dùng)
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const msg = parsed.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`❌ Lỗi ENV:\n${msg}`);
}

export const env = parsed.data;
