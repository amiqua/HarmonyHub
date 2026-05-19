import crypto from "crypto";
import { parseBuffer, parseFile } from "music-metadata";
import { logger } from "../config/logger.js";

const ALLOWED_AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/aac",
  "audio/webm",
  "audio/x-m4a",
];
const MIN_DURATION = 5; // 5 seconds
const MAX_DURATION = 3600 * 10; // 10 hours
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export function validateAudioMime(mimeType) {
  if (!ALLOWED_AUDIO_MIMES.includes(mimeType)) {
    return {
      valid: false,
      error: `Định dạng audio không được hỗ trợ. Được hỗ trợ: ${ALLOWED_AUDIO_MIMES.join(", ")}`,
    };
  }
  return { valid: true };
}

export function validateFileSize(fileSize) {
  if (!fileSize || fileSize === 0) {
    return { valid: false, error: "File rỗng" };
  }
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File quá lớn (tối đa 100MB). File của bạn: ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
    };
  }
  return { valid: true };
}

export async function computeAudioHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Phân tích metadata từ buffer (ưu tiên), fallback parseFile cho path local.
 * - Không chặn upload nếu parse fail (chỉ thiếu metadata).
 */
export async function extractAudioMetadata(input, mimetype) {
  try {
    let metadata;
    if (Buffer.isBuffer(input)) {
      metadata = await parseBuffer(input, mimetype, { duration: true });
    } else {
      metadata = await parseFile(input);
    }

    const format = metadata.format || {};
    const duration = Math.round(format.duration || 0);
    const bitrate = format.bitrate || 0;
    const codec = format.codec || "unknown";

    if (duration && (duration < MIN_DURATION || duration > MAX_DURATION)) {
      return {
        valid: false,
        error: `Độ dài audio không hợp lệ (${MIN_DURATION}s - ${(MAX_DURATION / 60).toFixed(0)}min). Độ dài file: ${(duration / 60).toFixed(2)}min`,
      };
    }

    return {
      valid: true,
      metadata: { duration, bitrate, codec },
    };
  } catch (err) {
    logger?.warn?.("Failed to extract audio metadata", err?.message);
    // Không chặn upload — cho phép tiếp tục với metadata rỗng
    return {
      valid: true,
      metadata: { duration: 0, bitrate: 0, codec: "unknown" },
      warning: "Không đọc được metadata audio (vẫn cho upload).",
    };
  }
}

export const audioValidation = {
  validateMime: validateAudioMime,
  validateSize: validateFileSize,
  computeHash: computeAudioHash,
  extractMetadata: extractAudioMetadata,
};
