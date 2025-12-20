/**
 * Công dụng: API lịch sử nghe nhạc (play_history).
 * - POST /api/v1/history        : ghi nhận 1 lần nghe (song_id, duration_listened)
 * - GET  /api/v1/history/me     : lấy lịch sử nghe gần đây của tôi (phân trang)
 *
 * Ghi chú:
 * - play_history lưu theo user_id + song_id + played_at
 * - Đây là API rất hữu ích để làm "nghe gần đây", "top bài hát", gợi ý...
 */

import { Router } from "express";

import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";

import * as historyController from "./history.controller.js";
import { createHistorySchema, listHistoryQuerySchema } from "./history.validation.js";

const router = Router();

/**
 * Lịch sử nghe của tôi
 * GET /api/v1/history/me?page=&limit=
 */
router.get(
  "/me",
  auth(),
  validate({ query: listHistoryQuerySchema }),
  historyController.listMine
);

/**
 * Ghi nhận 1 lượt nghe
 * POST /api/v1/history
 * body: { songId, duration_listened? }
 */
router.post("/", auth(), validate({ body: createHistorySchema }), historyController.create);

export default router;
