/**
 * Công dụng: Validate dữ liệu đầu vào cho upload audio CRUD.
 * - publicIdParamSchema: validate param :publicId(*)
 * - renameAudioSchema: validate body đổi tên/di chuyển file
 */

import { z } from "zod";

export const publicIdParamSchema = z.object({
  // public_id của Cloudinary có thể chứa dấu "/" (vd: music/audio/xxx)
  publicId: z.string().min(1, "publicId không được để trống"),
});

export const renameAudioSchema = z.object({
  // bạn truyền public_id mới (có thể đổi folder/name)
  newPublicId: z.string().min(1, "newPublicId không được để trống"),
});
