/**
 * Công dụng: Validate dữ liệu đầu vào cho module Playlists.
 * - list playlists (system/me): phân trang + tìm kiếm
 * - params id
 * - create/update playlist
 * - add/remove/reorder songs trong playlist
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const playlistIdParamSchema = z.object({ id });

export const playlistSongParamSchema = z.object({
  id, // playlistId
  songId: id,
});

export const listSystemPlaylistsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().trim().min(1).optional(),
});

export const createPlaylistSchema = z.object({
  name: z.string().min(1, "name không được để trống").max(100),
});

export const updatePlaylistSchema = z.object({
  name: z.string().min(1, "name không được để trống").max(100),
});

export const addSongToPlaylistSchema = z.object({
  songId: id,
  position: z.number().int().positive().optional(),
});

export const reorderPlaylistSchema = z.object({
  items: z
    .array(
      z.object({
        songId: id,
        position: z.number().int().positive(),
      })
    )
    .min(1, "items không được rỗng"),
});
