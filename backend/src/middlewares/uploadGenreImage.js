/**
 * Middleware upload ảnh thể loại lên Cloudinary.
 * - Nhận field "image" trong multipart/form-data
 * - Chỉ chấp nhận image/* (mỗi file ≤ 5MB)
 * - Sau khi upload, req.file có URL + public_id từ Cloudinary
 */

import multer, { MulterError } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  cloudinary,
  ensureCloudinaryConfigured,
} from "../config/cloudinary.js";
import { ApiError } from "../errors/ApiError.js";

function imageFileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    return cb(
      new ApiError(400, "File không hợp lệ. Chỉ chấp nhận ảnh (jpg, png, webp...).")
    );
  }
  return cb(null, true);
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    ensureCloudinaryConfigured();
    return {
      folder: "music/genres",
      resource_type: "image",
      public_id: `${Date.now()}-${(file.originalname || "genre").replace(
        /\.[^/.]+$/,
        ""
      )}`,
    };
  },
});

const uploader = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export function uploadGenreImageSingle(req, res, next) {
  uploader.single("image")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(413, "Ảnh quá lớn. Tối đa 5MB."));
      }
      return next(new ApiError(400, `Upload ảnh lỗi: ${err.message}`));
    }
    return next(err);
  });
}

/**
 * Chỉ chạy multer khi request là multipart/form-data,
 * còn JSON thì cho qua (để PATCH /:id chỉ đổi name vẫn ok).
 */
export function optionalGenreImageUpload(req, res, next) {
  if (req.is("multipart/form-data")) {
    return uploadGenreImageSingle(req, res, next);
  }
  return next();
}
