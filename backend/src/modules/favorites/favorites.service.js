/**
 * Công dụng: Xử lý nghiệp vụ Favorites (thả tim).
 * - listMine: danh sách bài yêu thích của user (phân trang)
 * - add: thêm bài vào yêu thích (tự tạo favorite_list nếu chưa có)
 * - remove: xoá bài khỏi yêu thích
 *
 * Ghi chú:
 * - favorite_lists: mỗi user 1 record (user_id UNIQUE)
 * - favorite_songs UNIQUE (favorite_list_id, song_id) => add trùng sẽ báo 409
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as favoritesRepo from "./favorites.repository.js";

function requireUser(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Bạn cần đăng nhập.");
  return userId;
}

export async function listMine(userPayload, query) {
  const userId = requireUser(userPayload);

  const { page, limit, offset } = parsePagination(query);

  const favoriteListId = await favoritesRepo.getOrCreateFavoriteListId(userId);

  const { rows, total } = await favoritesRepo.listSongs(favoriteListId, { limit, offset });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function add(userPayload, songId) {
  const userId = requireUser(userPayload);

  // check song tồn tại
  const song = await favoritesRepo.getSongById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  const favoriteListId = await favoritesRepo.getOrCreateFavoriteListId(userId);

  try {
    await favoritesRepo.addSong(favoriteListId, songId);
  } catch (err) {
    if (err?.code === "23505") {
      throw new ApiError(409, "Bài hát đã có trong danh sách yêu thích.");
    }
    throw err;
  }

  return { message: "Đã thêm vào yêu thích." };
}

export async function remove(userPayload, songId) {
  const userId = requireUser(userPayload);
  const favoriteListId = await favoritesRepo.getOrCreateFavoriteListId(userId);

  const ok = await favoritesRepo.removeSong(favoriteListId, songId);
  if (!ok) throw new ApiError(404, "Bài hát không nằm trong danh sách yêu thích.");

  return { message: "Đã xoá khỏi yêu thích." };
}
