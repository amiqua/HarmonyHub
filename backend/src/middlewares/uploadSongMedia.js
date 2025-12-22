/**
 * Công dụng: Middleware upload audio + ảnh minh hoạ (cover) lên Cloudinary trong 1 request.
 *
 * Nhận multipart/form-data với 2 field file:
 * - audio: file nhạc (mp3, wav, flac, m4a...)
 * - image: ảnh minh hoạ (jpg, png, webp, gif...)
 *
 * Sau upload thành công:
 * - req.files.audio?.[0] chứa info Cloudinary của audio
 * - req.files.image?.[0] chứa info Cloudinary của ảnh
 */

import multer from "multer";
import { MulterError } from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import {
  cloudinary,
  ensureCloudinaryConfigured,
} from "../config/cloudinary.js";
import { ApiError } from "../errors/ApiError.js";

function mediaFileFilter(_req, file, cb) {
  const audioAllowed = new Set([
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

  const imageAllowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jpg",
  ]);

  // Chặn field file lạ để tránh "Unexpected field"
  if (file.fieldname === "audio") {
    if (!audioAllowed.has(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "File audio không hợp lệ. Chỉ chấp nhận mp3, wav, flac, ogg, aac, m4a..."
        )
      );
    }
    return cb(null, true);
  }

  if (file.fieldname === "image") {
    if (!imageAllowed.has(file.mimetype)) {
      return cb(
        new ApiError(
          400,
          "File ảnh không hợp lệ. Chỉ chấp nhận jpg, png, webp, gif."
        )
      );
    }
    return cb(null, true);
  }

  return cb(new ApiError(400, `Field file không hợp lệ: ${file.fieldname}`));
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    ensureCloudinaryConfigured();

    const baseName = (file.originalname || file.fieldname)
      .replace(/\.[^/.]+$/, "")
      .slice(0, 80);

    // audio -> resource_type=video, image -> resource_type=image
    if (file.fieldname === "audio") {
      return {
        folder: "music/audio",
        resource_type: "video",
        public_id: `${Date.now()}-${baseName}`,
      };
    }

    // image
    return {
      folder: "music/covers",
      resource_type: "image",
      public_id: `${Date.now()}-${baseName}`,
    };
  },
});

// Note: limits.fileSize là giới hạn mỗi file. Để đơn giản cho 1 request có audio,
// mình để 25MB (đủ cho audio) và cũng áp dụng cho image.
const uploader = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export function uploadSongMediaFields(req, res, next) {
  uploader.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, (err) => {
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
