/**
 * Công dụng: Validate dữ liệu đầu vào cho module Songs.
 * - Query list: phân trang + filter
 * - Params id
 * - Body create/update song
 * - Body/Params liên kết artists/genres/album
 *
 * Nâng cấp:
 * - Thêm audio_public_id (public_id trên Cloudinary)
 * - audio_url/audio_public_id để optional vì backend có thể tự upload rồi tự set
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const songIdParamSchema = z.object({
  id,
});

export const songArtistParamSchema = z.object({
  id,
  artistId: id,
});

export const songGenreParamSchema = z.object({
  id,
  genreId: id,
});

export const listSongsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().trim().min(1).optional(),
  genreId: z.string().optional(),
  artistId: z.string().optional(),
  albumId: z.string().optional(),
  sort: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional(),
});

export const createSongSchema = z.object({
  title: z.string().min(1, "title không được để trống").max(150),

  // duration có thể để frontend tự tính (từ audio metadata) hoặc backend tự tính sau này
  duration: z.number().int().positive().optional(),

  // Nếu API create nhận multipart có file audio => backend tự upload và set 2 trường này
  // Nhưng vẫn cho phép gửi trực tiếp (trong trường hợp test hoặc import data)
  audio_url: z.string().url("audio_url phải là URL hợp lệ").optional(),
  audio_public_id: z.string().min(1).max(255).optional(),

  release_date: z.string().optional(), // YYYY-MM-DD
});

export const updateSongSchema = z.object({
  title: z.string().min(1).max(150).optional(),

  duration: z.number().int().positive().nullable().optional(),

  // Cho phép null để “gỡ link” (tuỳ bạn có cho phép hay không)
  audio_url: z.string().url().nullable().optional(),
  audio_public_id: z.string().min(1).max(255).nullable().optional(),

  release_date: z.string().nullable().optional(),
});

export const addSongArtistSchema = z.object({
  artistId: id,
  role: z.string().max(50).optional(),
});

export const addSongGenreSchema = z.object({
  genreId: id,
});

export const setSongAlbumSchema = z.object({
  albumId: id,
  trackNumber: z.number().int().positive().optional(),
});
