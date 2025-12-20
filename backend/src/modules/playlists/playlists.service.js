/**
 * Công dụng: Xử lý nghiệp vụ cho Playlists.
 * - listSystem: danh sách playlist type = "system"
 * - listMine: danh sách playlist type = "user" của user đang đăng nhập
 * - getById: lấy chi tiết playlist (kèm songs)
 *   - nếu system: ai cũng xem được
 *   - nếu user: chỉ owner mới xem được
 * - create/update/remove: chỉ tạo/sửa/xoá playlist của chính mình (type="user")
 * - addSong/removeSong/reorder: chỉ owner, thao tác playlist_songs
 *
 * Ghi chú:
 * - playlist_songs có UNIQUE (playlist_id, song_id) => addSong trùng sẽ báo 409
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as playlistsRepo from "./playlists.repository.js";

function requireUser(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Bạn cần đăng nhập.");
  return userId;
}

export async function listSystem(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await playlistsRepo.listSystem({
    limit,
    offset,
    q: query.q,
  });

  return { data: rows, meta: buildMeta(page, limit, total) };
}

export async function listMine(userPayload, query) {
  const userId = requireUser(userPayload);

  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await playlistsRepo.listMine(userId, {
    limit,
    offset,
    q: query.q,
  });

  return { data: rows, meta: buildMeta(page, limit, total) };
}

export async function create(userPayload, { name }) {
  const userId = requireUser(userPayload);

  const created = await playlistsRepo.createUserPlaylist(userId, name);
  return created;
}

export async function getById(userPayload, playlistId) {
  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  // Nếu là user playlist -> cần đăng nhập + là chủ sở hữu
  if (playlist.type === "user") {
    const userId = requireUser(userPayload);
    if (playlist.user_id !== userId) {
      throw new ApiError(403, "Bạn không có quyền xem playlist này.");
    }
  }

  const songs = await playlistsRepo.getSongs(playlistId);
  return { ...playlist, songs };
}

export async function update(userPayload, playlistId, { name }) {
  const userId = requireUser(userPayload);

  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  if (playlist.type !== "user") {
    throw new ApiError(403, "Không thể sửa playlist hệ thống.");
  }
  if (playlist.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền sửa playlist này.");
  }

  const updated = await playlistsRepo.updateName(playlistId, name);
  return updated;
}

export async function remove(userPayload, playlistId) {
  const userId = requireUser(userPayload);

  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  if (playlist.type !== "user") {
    throw new ApiError(403, "Không thể xoá playlist hệ thống.");
  }
  if (playlist.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền xoá playlist này.");
  }

  const ok = await playlistsRepo.remove(playlistId);
  if (!ok) throw new ApiError(404, "Không tìm thấy playlist để xoá.");

  return { message: "Xoá playlist thành công." };
}

export async function addSong(userPayload, playlistId, { songId, position }) {
  const userId = requireUser(userPayload);

  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  if (playlist.type !== "user" || playlist.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền thêm bài vào playlist này.");
  }

  const song = await playlistsRepo.getSongById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  try {
    await playlistsRepo.addSong(playlistId, songId, position);
  } catch (err) {
    if (err?.code === "23505") {
      throw new ApiError(409, "Bài hát đã có trong playlist.");
    }
    throw err;
  }

  return { message: "Thêm bài hát vào playlist thành công." };
}

export async function removeSong(userPayload, playlistId, songId) {
  const userId = requireUser(userPayload);

  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  if (playlist.type !== "user" || playlist.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền xoá bài khỏi playlist này.");
  }

  const ok = await playlistsRepo.removeSong(playlistId, songId);
  if (!ok) throw new ApiError(404, "Bài hát không nằm trong playlist.");

  return { message: "Xoá bài hát khỏi playlist thành công." };
}

export async function reorder(userPayload, playlistId, { items }) {
  const userId = requireUser(userPayload);

  const playlist = await playlistsRepo.getById(playlistId);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");

  if (playlist.type !== "user" || playlist.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền sắp xếp playlist này.");
  }

  // transaction để update nhiều dòng
  await playlistsRepo.reorderSongs(playlistId, items);

  return { message: "Sắp xếp lại playlist thành công." };
}
