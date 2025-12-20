/**
 * Công dụng: Validate dữ liệu đầu vào cho module Albums.
 * - list: phân trang + tìm kiếm + sort
 * - params id
 * - body create/update album
 * - body/params quản lý tracklist (album_songs)
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const albumIdParamSchema = z.object({ id });

export const albumSongParamSchema = z.object({
  id, // albumId
  songId: id,
});

export const listAlbumsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().trim().min(1).optional(),
  sort: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional(),
});

export const createAlbumSchema = z.object({
  title: z.string().min(1, "title không được để trống").max(150),
  release_date: z.string().optional(), // YYYY-MM-DD
});

export const updateAlbumSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  release_date: z.string().nullable().optional(),
});

export const addAlbumSongSchema = z.object({
  songId: id,
  trackNumber: z.number().int().positive().optional(),
});

export const updateAlbumSongSchema = z.object({
  trackNumber: z.number().int().positive(),
});
