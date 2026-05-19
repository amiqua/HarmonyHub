/**
 * API cho Genres.
 * - Public: list, getById, getSongs
 * - Admin: create / update / remove (yêu cầu role=ADMIN)
 *   - Hỗ trợ multipart/form-data với field "image" để upload ảnh thể loại
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { requireRole } from "../../middlewares/requireRole.js";
import { validate } from "../../middlewares/validate.js";
import { optionalGenreImageUpload } from "../../middlewares/uploadGenreImage.js";
import { ROLES } from "../../constants/roles.js";

import * as genresController from "./genres.controller.js";
import {
  genreIdParamSchema,
  createGenreSchema,
  updateGenreSchema,
  listGenresQuerySchema,
  listSongsByGenreQuerySchema,
} from "./genres.validation.js";

const router = Router();

// Public list
router.get(
  "/",
  validate({ query: listGenresQuerySchema }),
  genresController.list
);

// Public detail
router.get(
  "/:id",
  validate({ params: genreIdParamSchema }),
  genresController.getById
);

// Public songs
router.get(
  "/:id/songs",
  validate({ params: genreIdParamSchema, query: listSongsByGenreQuerySchema }),
  genresController.getSongs
);

// Admin: tạo thể loại (kèm ảnh nếu multipart)
router.post(
  "/",
  auth(),
  requireRole(ROLES.ADMIN),
  optionalGenreImageUpload,
  validate({ body: createGenreSchema }),
  genresController.create
);

// Admin: cập nhật thể loại (đổi tên, đổi ảnh)
router.patch(
  "/:id",
  auth(),
  requireRole(ROLES.ADMIN),
  optionalGenreImageUpload,
  validate({ params: genreIdParamSchema, body: updateGenreSchema }),
  genresController.update
);

// Admin: xoá
router.delete(
  "/:id",
  auth(),
  requireRole(ROLES.ADMIN),
  validate({ params: genreIdParamSchema }),
  genresController.remove
);

export default router;
