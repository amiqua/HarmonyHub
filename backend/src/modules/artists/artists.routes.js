/**
 * Công dụng: Khai báo các API cho Nghệ sĩ (artists).
 * - Public: xem danh sách nghệ sĩ, xem chi tiết, xem danh sách bài hát của nghệ sĩ
 * - Protected (tạm thời): tạo/sửa/xoá nghệ sĩ
 *
 * Lưu ý:
 * - Schema users hiện chưa có cột role, nên các route "admin" tạm dùng auth() thôi.
 *   Khi bạn thêm role (ADMIN/USER) thì chỉ cần thêm requireRole(ROLES.ADMIN).
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as artistsController from "./artists.controller.js";
import {
  listArtistsQuerySchema,
  artistIdParamSchema,
  createArtistSchema,
  updateArtistSchema,
} from "./artists.validation.js";

const router = Router();

/**
 * Danh sách nghệ sĩ (có phân trang + tìm kiếm theo tên)
 * GET /api/v1/artists?page=&limit=&q=
 */
router.get("/", validate({ query: listArtistsQuerySchema }), artistsController.list);

/**
 * Chi tiết 1 nghệ sĩ
 * GET /api/v1/artists/:id
 */
router.get("/:id", validate({ params: artistIdParamSchema }), artistsController.getById);

/**
 * Danh sách bài hát của nghệ sĩ
 * GET /api/v1/artists/:id/songs?page=&limit=
 */
router.get(
  "/:id/songs",
  validate({ params: artistIdParamSchema, query: listArtistsQuerySchema.pick({ page: true, limit: true }) }),
  artistsController.getSongs
);

/**
 * Tạo nghệ sĩ (tạm thời yêu cầu đăng nhập)
 * POST /api/v1/artists
 */
router.post("/", auth(), validate({ body: createArtistSchema }), artistsController.create);

/**
 * Cập nhật nghệ sĩ (tạm thời yêu cầu đăng nhập)
 * PATCH /api/v1/artists/:id
 */
router.patch(
  "/:id",
  auth(),
  validate({ params: artistIdParamSchema, body: updateArtistSchema }),
  artistsController.update
);

/**
 * Xoá nghệ sĩ (tạm thời yêu cầu đăng nhập)
 * DELETE /api/v1/artists/:id
 */
router.delete("/:id", auth(), validate({ params: artistIdParamSchema }), artistsController.remove);

export default router;
