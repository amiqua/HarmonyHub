/**
 * Công dụng: Khai báo các API cho bài hát (songs).
 * - Public: xem danh sách bài hát, xem chi tiết bài hát
 * - Protected: tạo/sửa/xoá bài hát (yêu cầu đăng nhập)
 * - Quản lý liên kết: artists/genres/album
 *
 * Nâng cấp:
 * - POST/PATCH có thể gửi multipart/form-data để backend tự upload audio lên Cloudinary
 *   (field file: "audio"), hoặc gửi JSON như cũ (audio_url, audio_public_id).
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { uploadAudioSingle } from "../../middlewares/uploadAudio.js";

import * as songsController from "./songs.controller.js";
import {
  listSongsQuerySchema,
  songIdParamSchema,
  createSongSchema,
  updateSongSchema,
  addSongArtistSchema,
  songArtistParamSchema,
  addSongGenreSchema,
  songGenreParamSchema,
  setSongAlbumSchema,
} from "./songs.validation.js";

const router = Router();

/**
 * Chỉ chạy multer khi request là multipart/form-data
 * để không phá các request JSON cũ.
 */
function optionalAudioUpload(req, res, next) {
  if (req.is("multipart/form-data")) return uploadAudioSingle(req, res, next);
  return next();
}

/**
 * Danh sách bài hát (có phân trang + filter)
 * GET /api/v1/songs?page=&limit=&q=&genreId=&artistId=&albumId=&sort=
 */
router.get(
  "/",
  validate({ query: listSongsQuerySchema }),
  songsController.list
);

/**
 * Chi tiết 1 bài hát
 * GET /api/v1/songs/:id
 */
router.get(
  "/:id",
  validate({ params: songIdParamSchema }),
  songsController.getById
);

/**
 * Tạo bài hát (yêu cầu đăng nhập)
 * POST /api/v1/songs
 * - JSON: { title, duration?, audio_url?, audio_public_id?, release_date? }
 * - multipart/form-data: fields như trên + file field "audio"
 */
router.post(
  "/",
  auth(),
  optionalAudioUpload,
  validate({ body: createSongSchema }),
  songsController.create
);

/**
 * Cập nhật bài hát (yêu cầu đăng nhập)
 * PATCH /api/v1/songs/:id
 * - JSON hoặc multipart/form-data (nếu multipart có thể gửi file "audio" để đổi audio)
 */
router.patch(
  "/:id",
  auth(),
  optionalAudioUpload,
  validate({ params: songIdParamSchema, body: updateSongSchema }),
  songsController.update
);

/**
 * Xoá bài hát (yêu cầu đăng nhập)
 * DELETE /api/v1/songs/:id
 */
router.delete(
  "/:id",
  auth(),
  validate({ params: songIdParamSchema }),
  songsController.remove
);

/**
 * Gán artist cho bài hát (song_artists)
 * POST /api/v1/songs/:id/artists
 * body: { artistId, role? }
 */
router.post(
  "/:id/artists",
  auth(),
  validate({ params: songIdParamSchema, body: addSongArtistSchema }),
  songsController.addArtist
);

/**
 * Gỡ artist khỏi bài hát
 * DELETE /api/v1/songs/:id/artists/:artistId
 */
router.delete(
  "/:id/artists/:artistId",
  auth(),
  validate({ params: songArtistParamSchema }),
  songsController.removeArtist
);

/**
 * Gán genre cho bài hát (song_genres)
 * POST /api/v1/songs/:id/genres
 * body: { genreId }
 */
router.post(
  "/:id/genres",
  auth(),
  validate({ params: songIdParamSchema, body: addSongGenreSchema }),
  songsController.addGenre
);

/**
 * Gỡ genre khỏi bài hát
 * DELETE /api/v1/songs/:id/genres/:genreId
 */
router.delete(
  "/:id/genres/:genreId",
  auth(),
  validate({ params: songGenreParamSchema }),
  songsController.removeGenre
);

/**
 * Gán album cho bài hát (album_songs)
 * PUT /api/v1/songs/:id/album
 * body: { albumId, trackNumber? }
 */
router.put(
  "/:id/album",
  auth(),
  validate({ params: songIdParamSchema, body: setSongAlbumSchema }),
  songsController.setAlbum
);

/**
 * Bỏ album khỏi bài hát
 * DELETE /api/v1/songs/:id/album
 */
router.delete(
  "/:id/album",
  auth(),
  validate({ params: songIdParamSchema }),
  songsController.removeAlbum
);

export default router;
