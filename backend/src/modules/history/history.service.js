/**
 * Công dụng: Xử lý nghiệp vụ History (lịch sử nghe).
 * - listMine: trả lịch sử nghe của user (phân trang)
 * - create: ghi nhận 1 lượt nghe (song_id, duration_listened)
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as historyRepo from "./history.repository.js";

function requireUser(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Bạn cần đăng nhập.");
  return userId;
}

export async function listMine(userPayload, query) {
  const userId = requireUser(userPayload);

  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await historyRepo.listMine(userId, { limit, offset });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function create(userPayload, { songId, duration_listened }) {
  const userId = requireUser(userPayload);

  const song = await historyRepo.getSongById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  const created = await historyRepo.create({
    userId,
    songId,
    duration_listened,
  });

  return created;
}
