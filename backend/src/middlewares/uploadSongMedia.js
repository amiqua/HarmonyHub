/**
 * Middleware upload audio + ảnh minh hoạ (cover) trong 1 request.
 *
 * Quy trình:
 *  1. Multer dùng memoryStorage để giữ file dạng buffer.
 *  2. Validate mime + size + (audio: metadata bằng music-metadata.parseBuffer).
 *  3. Upload từng file lên Cloudinary qua `upload_stream`.
 *  4. Gắn lại thông tin Cloudinary vào req.files (giống multer-storage-cloudinary).
 *
 * Sau middleware:
 *  - req.files.audio[0]: { path, filename, ...meta cloudinary }
 *  - req.files.image[0]: { path, filename, ... } (nếu có)
 *  - req.audioMetadata: { duration, bitrate, codec }
 *  - req.audioHash: SHA256 hex
 */

import multer, { MulterError } from "multer";
import { Readable } from "stream";
import { parseBuffer } from "music-metadata";

import {
  cloudinary,
  ensureCloudinaryConfigured,
} from "../config/cloudinary.js";
import { ApiError } from "../errors/ApiError.js";
import {
  validateAudioMime,
  validateFileSize,
  computeAudioHash,
} from "../utils/audioValidation.js";

const AUDIO_ALLOWED = new Set([
  "audio/mpeg",
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

const IMAGE_ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
]);

function mediaFileFilter(_req, file, cb) {
  if (file.fieldname === "audio") {
    if (!AUDIO_ALLOWED.has(file.mimetype)) {
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
    if (!IMAGE_ALLOWED.has(file.mimetype)) {
      return cb(
        new ApiError(400, "File ảnh không hợp lệ. Chỉ chấp nhận jpg, png, webp, gif.")
      );
    }
    return cb(null, true);
  }
  return cb(new ApiError(400, `Field file không hợp lệ: ${file.fieldname}`));
}

// Memory storage để có buffer cho việc validate/parse trước khi đẩy lên Cloudinary
const uploader = multer({
  storage: multer.memoryStorage(),
  fileFilter: mediaFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

function uploadBufferToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

async function extractAudioMetadataFromBuffer(buffer, mimetype) {
  try {
    const meta = await parseBuffer(buffer, mimetype, { duration: true });
    const format = meta.format || {};
    return {
      duration: Math.round(format.duration || 0),
      bitrate: format.bitrate || 0,
      codec: format.codec || "unknown",
    };
  } catch (err) {
    // Cảnh báo nhưng không chặn upload — backend vẫn lưu được audio
    console.warn(
      "[uploadSongMedia] parseBuffer failed (continuing without metadata):",
      err?.message || err
    );
    return null;
  }
}

export function uploadSongMediaFields(req, res, next) {
  uploader.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      if (err instanceof MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return next(new ApiError(413, "File quá lớn. Tối đa 100MB."));
        }
        return next(new ApiError(400, `Upload lỗi: ${err.message}`));
      }
      return next(err);
    }

    try {
      ensureCloudinaryConfigured();

      const audioFile = req.files?.audio?.[0];
      const imageFile = req.files?.image?.[0];

      // ── Validate audio (nếu có) ─────────────────────────────
      if (audioFile) {
        // Mime
        const mimeRes = validateAudioMime(audioFile.mimetype);
        if (!mimeRes.valid) {
          return next(new ApiError(400, mimeRes.error));
        }

        // Size
        const sizeRes = validateFileSize(audioFile.size);
        if (!sizeRes.valid) {
          return next(new ApiError(400, sizeRes.error));
        }

        // Metadata (best-effort)
        const metadata = await extractAudioMetadataFromBuffer(
          audioFile.buffer,
          audioFile.mimetype
        );
        if (metadata) {
          req.audioMetadata = metadata;
        }

        // Hash để dedupe
        req.audioHash = await computeAudioHash(audioFile.buffer);
      }

      // ── Upload audio lên Cloudinary ─────────────────────────
      if (audioFile) {
        const base = (audioFile.originalname || "audio")
          .replace(/\.[^/.]+$/, "")
          .slice(0, 80);

        const result = await uploadBufferToCloudinary(audioFile.buffer, {
          folder: "music/audio",
          resource_type: "video", // Cloudinary xử lý audio như video resource
          public_id: `${Date.now()}-${base}`,
        });

        // Gắn lại fields giống multer-storage-cloudinary để controller hiện tại còn dùng được
        audioFile.path = result.secure_url || result.url;
        audioFile.filename = result.public_id;
        audioFile.cloudinary = result;
      }

      // ── Upload ảnh (nếu có) ─────────────────────────────────
      if (imageFile) {
        const sizeRes = validateFileSize(imageFile.size);
        if (!sizeRes.valid) {
          return next(new ApiError(400, sizeRes.error));
        }

        const base = (imageFile.originalname || "cover")
          .replace(/\.[^/.]+$/, "")
          .slice(0, 80);

        const result = await uploadBufferToCloudinary(imageFile.buffer, {
          folder: "music/covers",
          resource_type: "image",
          public_id: `${Date.now()}-${base}`,
        });

        imageFile.path = result.secure_url || result.url;
        imageFile.filename = result.public_id;
        imageFile.cloudinary = result;
      }

      return next();
    } catch (uploadErr) {
      console.error("[uploadSongMedia] Cloudinary upload error:", uploadErr);
      return next(
        new ApiError(
          500,
          `Lỗi upload Cloudinary: ${uploadErr?.message || "unknown"}`
        )
      );
    }
  });
}
