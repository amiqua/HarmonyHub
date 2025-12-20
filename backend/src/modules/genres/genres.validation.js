/**
 * Công dụng: Validate dữ liệu đầu vào cho module Genres.
 * - listGenresQuerySchema: (hiện đơn giản, có thể mở rộng q= tìm theo tên)
 * - genreIdParamSchema: validate :id
 * - create/update genre
 * - listSongsByGenreQuerySchema: phân trang + sort
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const genreIdParamSchema = z.object({ id });

export const listGenresQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
});

export const createGenreSchema = z.object({
  name: z.string().min(1, "name không được để trống").max(50),
});

export const updateGenreSchema = z.object({
  name: z.string().min(1).max(50),
});

export const listSongsByGenreQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional(),
});
