/**
 * Công dụng: Validate dữ liệu đầu vào cho module Favorites.
 * - listFavoritesQuerySchema: phân trang
 * - favoriteSongParamSchema: validate :songId
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const listFavoritesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const favoriteSongParamSchema = z.object({
  songId: id,
});
