/**
 * Công dụng: Cấu hình Cloudinary (cloudinary@1.x) và export instance dùng chung.
 * - Export `cloudinary` để multer-storage-cloudinary dùng.
 * - Export `ensureCloudinaryConfigured()` để chặn upload nếu thiếu env.
 */

import cloudinaryPkg from "cloudinary";
import { env } from "./env.js";
import { ApiError } from "../errors/ApiError.js";

const { v2: cloudinary } = cloudinaryPkg;

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export function ensureCloudinaryConfigured() {
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new ApiError(
      500,
      "Thiếu cấu hình Cloudinary. Kiểm tra CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET trong .env"
    );
  }
}

export { cloudinary };
