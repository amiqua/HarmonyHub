/**
 * Công dụng: Middleware upload file audio lên Cloudinary bằng multer + multer-storage-cloudinary.
 * - Nhận file từ form-data field: "audio"
 * - Lọc định dạng audio
 * - Giới hạn dung lượng 25MB
 * - Sau upload thành công: thông tin nằm trong req.file (có URL + public_id)
 */

import multer from "multer";
import { MulterError } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  cloudinary,
  ensureCloudinaryConfigured,
} from "../config/cloudinary.js";
import { ApiError } from "../errors/ApiError.js";

function audioFileFilter(_req, file, cb) {
  const allowed = new Set([
    "audio/mpeg", // mp3
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/flac",
    "audio/aac",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
    "audio/x-m4a",
  ]);

  if (!allowed.has(file.mimetype)) {
    return cb(
      new ApiError(
        400,
        "File không hợp lệ. Chỉ chấp nhận định dạng audio (mp3, wav, flac, ogg, aac, m4a...)."
      )
    );
  }
  return cb(null, true);
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    ensureCloudinaryConfigured();

    return {
      folder: "music/audio",
      // Cloudinary thường xử audio như video resource
      resource_type: "video",
      public_id: `${Date.now()}-${(file.originalname || "audio").replace(/\.[^/.]+$/, "")}`,
    };
  },
});

const uploader = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

// Middleware nhận đúng 1 file field "audio" + bọc lỗi multer
export function uploadAudioSingle(req, res, next) {
  uploader.single("audio")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new ApiError(413, "File quá lớn. Tối đa 25MB."));
      }
      return next(new ApiError(400, `Upload lỗi: ${err.message}`));
    }

    return next(err);
  });
}
