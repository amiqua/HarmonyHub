/**
 * Công dụng: Khai báo các API cho Album (albums).
 * - Public: xem danh sách album, xem chi tiết album (kèm tracklist)
 * - Protected (tạm thời): tạo/sửa/xoá album, thêm/xoá bài hát trong album
 *
 * Lưu ý:
 * - Schema users hiện chưa có cột role nên các route "admin" tạm dùng auth() thôi.
 *   Khi bạn thêm role (ADMIN/USER) thì chỉ cần thêm requireRole(ROLES.ADMIN) vào các route tạo/sửa/xoá.
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as albumsController from "./albums.controller.js";
import {
  listAlbumsQuerySchema,
  albumIdParamSchema,
  createAlbumSchema,
  updateAlbumSchema,
  addAlbumSongSchema,
  albumSongParamSchema,
  updateAlbumSongSchema,
} from "./albums.validation.js";

const router = Router();

/**
 * Danh sách album (phân trang + tìm kiếm theo title)
 * GET /api/v1/albums?page=&limit=&q=&sort=
 */
router.get("/", validate({ query: listAlbumsQuerySchema }), albumsController.list);

/**
 * Chi tiết album (kèm tracklist từ album_songs)
 * GET /api/v1/albums/:id
 */
router.get("/:id", validate({ params: albumIdParamSchema }), albumsController.getById);

/**
 * Tạo album (tạm thời yêu cầu đăng nhập)
 * POST /api/v1/albums
 */
router.post("/", auth(), validate({ body: createAlbumSchema }), albumsController.create);

/**
 * Cập nhật album (tạm thời yêu cầu đăng nhập)
 * PATCH /api/v1/albums/:id
 */
router.patch(
  "/:id",
  auth(),
  validate({ params: albumIdParamSchema, body: updateAlbumSchema }),
  albumsController.update
);

/**
 * Xoá album (tạm thời yêu cầu đăng nhập)
 * DELETE /api/v1/albums/:id
 */
router.delete("/:id", auth(), validate({ params: albumIdParamSchema }), albumsController.remove);

/**
 * Thêm bài hát vào album (tạo record album_songs)
 * POST /api/v1/albums/:id/songs
 * body: { songId, trackNumber? }
 */
router.post(
  "/:id/songs",
  auth(),
  validate({ params: albumIdParamSchema, body: addAlbumSongSchema }),
  albumsController.addSong
);

/**
 * Cập nhật track_number của 1 bài trong album
 * PATCH /api/v1/albums/:id/songs/:songId
 * body: { trackNumber }
 */
router.patch(
  "/:id/songs/:songId",
  auth(),
  validate({ params: albumSongParamSchema, body: updateAlbumSongSchema }),
  albumsController.updateSong
);

/**
 * Xoá bài hát khỏi album (xoá record album_songs)
 * DELETE /api/v1/albums/:id/songs/:songId
 */
router.delete(
  "/:id/songs/:songId",
  auth(),
  validate({ params: albumSongParamSchema }),
  albumsController.removeSong
);

export default router;
