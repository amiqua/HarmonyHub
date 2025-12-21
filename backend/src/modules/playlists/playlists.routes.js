/**
 * Công dụng: Khai báo các API cho Playlist.
 * - Public: xem playlist hệ thống (system)
 * - User: xem playlist của tôi, tạo/sửa/xoá playlist của tôi
 * - Quản lý bài hát trong playlist: thêm/xoá/sắp xếp
 *
 * Ghi chú:
 * - Bảng playlists có `type` (system | user) và `user_id`.
 * - Với playlist type = "user": chỉ chủ sở hữu (user_id) mới được xem/sửa/xoá.
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as playlistsController from "./playlists.controller.js";
import {
  listSystemPlaylistsQuerySchema,
  playlistIdParamSchema,
  createPlaylistSchema,
  updatePlaylistSchema,
  addSongToPlaylistSchema,
  playlistSongParamSchema,
  reorderPlaylistSchema,
} from "./playlists.validation.js";

const router = Router();

/**
 * Danh sách playlist hệ thống
 * GET /api/v1/playlists/system?page=&limit=&q=
 */
router.get(
  "/system",
  validate({ query: listSystemPlaylistsQuerySchema }),
  playlistsController.listSystem
);

/**
 * Danh sách playlist của tôi
 * GET /api/v1/playlists/me?page=&limit=&q=
 */
router.get(
  "/me",
  auth(),
  validate({ query: listSystemPlaylistsQuerySchema }),
  playlistsController.listMine
);

/**
 * Tạo playlist của user
 * POST /api/v1/playlists
 */
router.post(
  "/",
  auth(),
  validate({ body: createPlaylistSchema }),
  playlistsController.create
);

/**
 * Xem chi tiết playlist (kèm bài hát)
 * GET /api/v1/playlists/:id
 * - Nếu playlist là user playlist -> yêu cầu đăng nhập và phải là chủ sở hữu
 */
router.get(
  "/:id",
  auth({ optional: true }),
  validate({ params: playlistIdParamSchema }),
  playlistsController.getById
);

/**
 * Đổi tên playlist (chỉ owner)
 * PATCH /api/v1/playlists/:id
 */
router.patch(
  "/:id",
  auth(),
  validate({ params: playlistIdParamSchema, body: updatePlaylistSchema }),
  playlistsController.update
);

/**
 * Xoá playlist (chỉ owner)
 * DELETE /api/v1/playlists/:id
 */
router.delete(
  "/:id",
  auth(),
  validate({ params: playlistIdParamSchema }),
  playlistsController.remove
);

/**
 * Thêm bài hát vào playlist (chỉ owner)
 * POST /api/v1/playlists/:id/songs
 * body: { songId, position? }
 */
router.post(
  "/:id/songs",
  auth(),
  validate({ params: playlistIdParamSchema, body: addSongToPlaylistSchema }),
  playlistsController.addSong
);

/**
 * Xoá bài hát khỏi playlist (chỉ owner)
 * DELETE /api/v1/playlists/:id/songs/:songId
 */
router.delete(
  "/:id/songs/:songId",
  auth(),
  validate({ params: playlistSongParamSchema }),
  playlistsController.removeSong
);

/**
 * Sắp xếp lại thứ tự bài hát trong playlist (chỉ owner)
 * PATCH /api/v1/playlists/:id/songs/reorder
 * body: { items: [{ songId, position }] }
 */
router.patch(
  "/:id/songs/reorder",
  auth(),
  validate({ params: playlistIdParamSchema, body: reorderPlaylistSchema }),
  playlistsController.reorder
);

export default router;
