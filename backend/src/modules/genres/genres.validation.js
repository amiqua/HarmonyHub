/**
 * Validate dữ liệu đầu vào cho Genres.
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const genreIdParamSchema = z.object({ id });

export const listGenresQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
});

export const createGenreSchema = z.object({
  name: z.string().min(1, "name không được để trống").max(50),
  description: z.string().max(500).optional(),
});

export const updateGenreSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((v) => Object.keys(v).length > 0 || true, {
    message: "Cần ít nhất một trường để cập nhật",
  });

export const listSongsByGenreQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional(),
});
