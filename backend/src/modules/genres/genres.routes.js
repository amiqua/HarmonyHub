/**
 * Công dụng: Khai báo các API cho Thể loại (genres).
 * - Public: xem danh sách thể loại, xem bài hát theo thể loại
 * - Protected (tạm thời): tạo/sửa/xoá thể loại
 *
 * Lưu ý:
 * - Schema users hiện chưa có cột role, nên các route "admin" tạm dùng auth() thôi.
 *   Khi bạn thêm role (ADMIN/USER) thì chỉ cần thêm requireRole(ROLES.ADMIN).
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as genresController from "./genres.controller.js";
import {
  genreIdParamSchema,
  createGenreSchema,
  updateGenreSchema,
  listGenresQuerySchema,
  listSongsByGenreQuerySchema,
} from "./genres.validation.js";

const router = Router();

/**
 * Danh sách thể loại
 * GET /api/v1/genres
 */
router.get("/", validate({ query: listGenresQuerySchema }), genresController.list);

/**
 * Bài hát theo thể loại
 * GET /api/v1/genres/:id/songs?page=&limit=&sort=
 */
router.get(
  "/:id/songs",
  validate({ params: genreIdParamSchema, query: listSongsByGenreQuerySchema }),
  genresController.getSongs
);

/**
 * Tạo thể loại (tạm thời yêu cầu đăng nhập)
 * POST /api/v1/genres
 */
router.post("/", auth(), validate({ body: createGenreSchema }), genresController.create);

/**
 * Cập nhật thể loại
 * PATCH /api/v1/genres/:id
 */
router.patch(
  "/:id",
  auth(),
  validate({ params: genreIdParamSchema, body: updateGenreSchema }),
  genresController.update
);

/**
 * Xoá thể loại
 * DELETE /api/v1/genres/:id
 */
router.delete("/:id", auth(), validate({ params: genreIdParamSchema }), genresController.remove);

export default router;
