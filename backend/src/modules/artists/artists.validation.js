/**
 * Công dụng: Validate dữ liệu đầu vào cho module Artists.
 * - listArtistsQuerySchema: phân trang + tìm kiếm theo tên
 * - artistIdParamSchema: validate :id
 * - create/update artist
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const artistIdParamSchema = z.object({ id });

export const listArtistsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  q: z.string().trim().min(1).optional(),
});

export const createArtistSchema = z.object({
  name: z.string().min(1, "name không được để trống").max(100),
  bio: z.string().max(5000).optional(),
});

export const updateArtistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(5000).nullable().optional(),
});
