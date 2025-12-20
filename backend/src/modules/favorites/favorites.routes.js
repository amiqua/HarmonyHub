/**
 * Công dụng: API "Yêu thích" (thả tim) cho user.
 * - Mỗi user có 1 favorite_list (1-1) trong bảng favorite_lists
 * - Bảng favorite_songs lưu các bài đã thích
 *
 * Endpoint:
 * - GET    /api/v1/favorites/me           : danh sách bài đã thích
 * - POST   /api/v1/favorites/:songId      : thêm bài vào yêu thích
 * - DELETE /api/v1/favorites/:songId      : xoá bài khỏi yêu thích
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as favoritesController from "./favorites.controller.js";
import {
  favoriteSongParamSchema,
  listFavoritesQuerySchema,
} from "./favorites.validation.js";

const router = Router();

/**
 * Danh sách bài yêu thích của tôi
 * GET /api/v1/favorites/me?page=&limit=
 */
router.get(
  "/me",
  auth(),
  validate({ query: listFavoritesQuerySchema }),
  favoritesController.listMine
);

/**
 * Thêm bài vào yêu thích
 * POST /api/v1/favorites/:songId
 */
router.post(
  "/:songId",
  auth(),
  validate({ params: favoriteSongParamSchema }),
  favoritesController.add
);

/**
 * Xoá bài khỏi yêu thích
 * DELETE /api/v1/favorites/:songId
 */
router.delete(
  "/:songId",
  auth(),
  validate({ params: favoriteSongParamSchema }),
  favoritesController.remove
);

export default router;
