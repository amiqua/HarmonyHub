/**
 * Công dụng: CRUD Upload Audio trên Cloudinary.
 *
 * Base: /api/v1/uploads
 * - CREATE: POST   /audio                  (upload file -> trả audio_url + public_id)
 * - READ:   GET    /audio/:publicId(*)     (lấy info file trên Cloudinary)
 * - UPDATE: PATCH  /audio/:publicId(*)     (rename/move file)
 * - DELETE: DELETE /audio/:publicId(*)     (xoá file)
 *
 * Ghi chú:
 * - Tất cả endpoint yêu cầu đăng nhập (auth()) theo thiết kế hiện tại của bạn.
 */

import { Router } from "express";

import { auth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { uploadAudioSingle } from "../middlewares/uploadAudio.js";
import { ApiError } from "../errors/ApiError.js";
import { ok } from "../utils/response.js";
import { cloudinary } from "../config/cloudinary.js";

import { publicIdParamSchema, renameAudioSchema } from "./upload.validation.js";

const router = Router();

/**
 * CREATE - Upload audio
 * POST /api/v1/uploads/audio
 * form-data: audio=<file>
 */
router.post("/audio", auth(), uploadAudioSingle, (req, res) => {
  if (!req.file) {
    throw new ApiError(
      400,
      "Không nhận được file audio. Hãy gửi form-data với field tên là 'audio'."
    );
  }

  // tuỳ driver: url có thể nằm ở path / secure_url / url
  const audioUrl = req.file?.path || req.file?.secure_url || req.file?.url;
  const publicId = req.file?.filename; // thường chính là public_id (có thể kèm folder tuỳ config)

  if (!audioUrl) {
    throw new ApiError(
      500,
      "Upload thành công nhưng không lấy được audio_url từ Cloudinary."
    );
  }

  return ok(res, {
    audio_url: audioUrl,
    public_id: publicId,
    file: {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
    },
  });
});

/**
 * READ - Lấy info audio theo public_id
 * GET /api/v1/uploads/audio/:publicId(*)
 */
router.get(
  "/audio/:publicId(*)",
  auth(),
  validate({ params: publicIdParamSchema }),
  async (req, res) => {
    const { publicId } = req.params;

    try {
      const info = await cloudinary.api.resource(publicId, {
        resource_type: "video",
      });

      return ok(res, {
        public_id: info.public_id,
        asset_id: info.asset_id,
        url: info.url,
        secure_url: info.secure_url,
        bytes: info.bytes,
        duration: info.duration,
        format: info.format,
        created_at: info.created_at,
      });
    } catch (err) {
      // Cloudinary "not found" thường có http_code 404
      if (err?.http_code === 404) {
        throw new ApiError(404, "Không tìm thấy file audio trên Cloudinary.");
      }
      throw err;
    }
  }
);

/**
 * UPDATE - Rename / Move file (đổi public_id)
 * PATCH /api/v1/uploads/audio/:publicId(*)
 * body: { newPublicId }
 */
router.patch(
  "/audio/:publicId(*)",
  auth(),
  validate({ params: publicIdParamSchema, body: renameAudioSchema }),
  async (req, res) => {
    const { publicId } = req.params;
    const { newPublicId } = req.body;

    try {
      const result = await cloudinary.uploader.rename(publicId, newPublicId, {
        resource_type: "video",
        invalidate: true,
        overwrite: false,
      });

      return ok(res, {
        message: "Đổi tên/di chuyển file thành công.",
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
      });
    } catch (err) {
      if (err?.http_code === 404) {
        throw new ApiError(404, "Không tìm thấy file audio để đổi tên.");
      }
      // Nếu trùng public_id hoặc lỗi khác
      throw err;
    }
  }
);

/**
 * DELETE - Xoá file audio
 * DELETE /api/v1/uploads/audio/:publicId(*)
 */
router.delete(
  "/audio/:publicId(*)",
  auth(),
  validate({ params: publicIdParamSchema }),
  async (req, res) => {
    const { publicId } = req.params;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    // result.result: "ok" | "not found"
    if (result?.result === "not found") {
      throw new ApiError(404, "Không tìm thấy file audio để xoá.");
    }

    return ok(res, { message: "Xoá file audio thành công.", result });
  }
);

export default router;
