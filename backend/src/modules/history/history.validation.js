/**
 * Công dụng: Validate dữ liệu đầu vào cho module History (play_history).
 * - createHistorySchema: ghi nhận 1 lượt nghe
 * - listHistoryQuerySchema: phân trang lịch sử nghe
 */

import { z } from "zod";

const id = z.preprocess((v) => Number(v), z.number().int().positive());

export const listHistoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const createHistorySchema = z.object({
  songId: id,
  duration_listened: z.number().int().positive().optional(),
});
