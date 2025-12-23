// FILE: backend/src/modules/playlists/playlists.service.js
/**
 * Công dụng: Xử lý nghiệp vụ cho module Playlists.
 * - Controller gọi service, service gọi repository để thao tác DB.
 * - File này PHẢI export các hàm mà playlists.controller.js đang import.
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as playlistsRepo from "./playlists.repository.js";

function requireUser(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Bạn cần đăng nhập.");
  return Number(userId);
}

function ensureOwnerOrThrow(userId, playlist) {
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");
  if (playlist.type !== "user") return; // system playlist: cho phép public xem
  if (Number(playlist.user_id) !== Number(userId)) {
    throw new ApiError(403, "Bạn không có quyền truy cập playlist này.");
  }
}

async function getPlaylistOrThrow(playlistId) {
  const id = Number(playlistId);
  if (!Number.isFinite(id) || id <= 0)
    throw new ApiError(400, "playlistId không hợp lệ.");
  const playlist = await playlistsRepo.getById(id);
  if (!playlist) throw new ApiError(404, "Không tìm thấy playlist.");
  return playlist;
}

export async function listSystem(query = {}) {
  const { page, limit, offset } = parsePagination(query);
  const q = typeof query.q === "string" ? query.q.trim() : undefined;

  const { rows, total } = await playlistsRepo.listSystem({ q, limit, offset });
  return {
    data: rows,
    meta: buildMeta({ page, limit, total }),
  };
}

export async function listMine(userPayload, query = {}) {
  const userId = requireUser(userPayload);
  const { page, limit, offset } = parsePagination(query);
  const q = typeof query.q === "string" ? query.q.trim() : undefined;

  const { rows, total } = await playlistsRepo.listMine({
    userId,
    q,
    limit,
    offset,
  });
  return {
    data: rows,
    meta: buildMeta({ page, limit, total }),
  };
}

export async function create(userPayload, body) {
  const userId = requireUser(userPayload);
  const name = body?.name?.trim?.() || "";

  if (!name) throw new ApiError(400, "Tên playlist là bắt buộc.");

  try {
    const created = await playlistsRepo.createUserPlaylist({ userId, name });
    return created;
  } catch (err) {
    // unique_violation (Postgres)
    if (err?.code === "23505") throw new ApiError(409, "Playlist đã tồn tại.");
    throw err;
  }
}

// Alias “/playlists/me”
export async function createMine(userPayload, body) {
  return create(userPayload, body);
}

export async function getById(userPayload, playlistId) {
  const playlist = await getPlaylistOrThrow(playlistId);

  // user playlist: chỉ owner xem được
  if (playlist.type === "user") {
    const userId = requireUser(userPayload);
    ensureOwnerOrThrow(userId, playlist);
  }

  const songs = await playlistsRepo.getSongs(Number(playlistId));
  return { ...playlist, songs };
}

export async function getMineById(userPayload, playlistId) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const songs = await playlistsRepo.getSongs(Number(playlistId));
  return { ...playlist, songs };
}

export async function update(userPayload, playlistId, body) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const name = body?.name?.trim?.() || "";
  if (!name) throw new ApiError(400, "Tên playlist là bắt buộc.");

  try {
    const updated = await playlistsRepo.updateName({
      playlistId: Number(playlistId),
      name,
    });
    return updated;
  } catch (err) {
    if (err?.code === "23505") throw new ApiError(409, "Playlist đã tồn tại.");
    throw err;
  }
}

export async function updateMine(userPayload, playlistId, body) {
  return update(userPayload, playlistId, body);
}

export async function remove(userPayload, playlistId) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const ok = await playlistsRepo.deletePlaylist(Number(playlistId));
  if (!ok) throw new ApiError(404, "Không tìm thấy playlist.");
  return { message: "Đã xoá playlist." };
}

export async function removeMine(userPayload, playlistId) {
  return remove(userPayload, playlistId);
}

export async function addSong(userPayload, playlistId, body) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const songId = Number(body?.songId);
  const position = body?.position == null ? undefined : Number(body.position);

  if (!Number.isFinite(songId) || songId <= 0) {
    throw new ApiError(400, "songId không hợp lệ.");
  }
  if (position !== undefined && (!Number.isFinite(position) || position < 0)) {
    throw new ApiError(400, "position không hợp lệ.");
  }

  const song = await playlistsRepo.getSongById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  try {
    await playlistsRepo.addSongToPlaylist({
      playlistId: Number(playlistId),
      songId,
      position,
    });
    return { message: "Đã thêm bài hát vào playlist." };
  } catch (err) {
    if (err?.code === "23505")
      throw new ApiError(409, "Bài hát đã có trong playlist.");
    throw err;
  }
}

export async function removeSong(userPayload, playlistId, songId) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const sId = Number(songId);
  if (!Number.isFinite(sId) || sId <= 0)
    throw new ApiError(400, "songId không hợp lệ.");

  const ok = await playlistsRepo.removeSongFromPlaylist({
    playlistId: Number(playlistId),
    songId: sId,
  });
  if (!ok) throw new ApiError(404, "Bài hát không tồn tại trong playlist.");
  return { message: "Đã xoá bài hát khỏi playlist." };
}

export async function reorder(userPayload, playlistId, body) {
  const userId = requireUser(userPayload);
  const playlist = await getPlaylistOrThrow(playlistId);
  ensureOwnerOrThrow(userId, playlist);

  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items || items.length === 0)
    throw new ApiError(400, "items không hợp lệ.");

  const normalized = items.map((it) => ({
    songId: Number(it?.songId),
    position: Number(it?.position),
  }));

  for (const it of normalized) {
    if (!Number.isFinite(it.songId) || it.songId <= 0)
      throw new ApiError(400, "items.songId không hợp lệ.");
    if (!Number.isFinite(it.position) || it.position < 0)
      throw new ApiError(400, "items.position không hợp lệ.");
  }

  // Không cho trùng songId
  const set = new Set(normalized.map((x) => x.songId));
  if (set.size !== normalized.length)
    throw new ApiError(400, "items bị trùng songId.");

  // Chỉ reorder những bài đang có trong playlist
  const current = await playlistsRepo.getSongs(Number(playlistId));
  const currentIds = new Set(current.map((s) => Number(s.id)));
  for (const it of normalized) {
    if (!currentIds.has(it.songId)) {
      throw new ApiError(404, `Bài hát ${it.songId} không có trong playlist.`);
    }
  }

  await playlistsRepo.reorderSongs(Number(playlistId), normalized);
  return { message: "Đã sắp xếp lại playlist." };
}
