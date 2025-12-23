// FILE: src/services/playlists.api.js
// Công dụng: Client gọi API playlists.
// Chuẩn response backend: { success, data, meta? }

import { http } from "@/lib/http";

// ===== Helpers =====
function unwrap(res) {
  return res?.data?.data;
}

function unwrapWithMeta(res) {
  return {
    data: res?.data?.data,
    meta: res?.data?.meta,
  };
}

// Thử nhiều endpoint để tương thích backend khác nhau
async function tryMany(requestFns) {
  let lastErr = null;

  for (const fn of requestFns) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;

      // 404: route không tồn tại | 405: sai method => thử endpoint tiếp theo
      if (status === 404 || status === 405) continue;

      // Lỗi khác (401, 403, 500...) => ném luôn để UI báo đúng nguyên nhân
      throw err;
    }
  }

  throw lastErr;
}

// ===== List =====

// Playlist hệ thống (public)
// GET /api/v1/playlists/system?page=&limit=&q=
export async function listSystemPlaylists(params = {}) {
  const res = await http.get("/playlists/system", { params });
  return unwrapWithMeta(res);
}

// Playlist của tôi (auth)
// GET /api/v1/playlists/me?page=&limit=&q=
export async function listMyPlaylists(params = {}) {
  const res = await http.get("/playlists/me", { params });
  return unwrapWithMeta(res);
}

// ===== CRUD playlist (user) =====

// ✅ Tạo playlist của tôi (auth)
// Chuẩn thường gặp: POST /api/v1/playlists
// Một số backend khác có: POST /api/v1/playlists/me
export async function createMyPlaylist(body) {
  const res = await tryMany([
    () => http.post("/playlists", body),
    () => http.post("/playlists/me", body),
  ]);
  return unwrap(res);
}

// ✅ Đổi tên playlist của tôi (auth)
// Chuẩn thường gặp: PATCH /api/v1/playlists/:id
// Một số backend khác có: PATCH /api/v1/playlists/me/:id
export async function updateMyPlaylist(playlistId, body) {
  const res = await tryMany([
    () => http.patch(`/playlists/${playlistId}`, body),
    () => http.patch(`/playlists/me/${playlistId}`, body),
  ]);
  return unwrap(res);
}

// ✅ Xoá playlist của tôi (auth)
// Chuẩn thường gặp: DELETE /api/v1/playlists/:id
// Một số backend khác có: DELETE /api/v1/playlists/me/:id
export async function deleteMyPlaylist(playlistId) {
  const res = await tryMany([
    () => http.delete(`/playlists/${playlistId}`),
    () => http.delete(`/playlists/me/${playlistId}`),
  ]);
  return unwrap(res);
}

// ===== Detail =====

// Xem chi tiết playlist (kèm songs)
// GET /api/v1/playlists/:id
export async function getPlaylistById(playlistId) {
  const res = await http.get(`/playlists/${playlistId}`);
  return unwrap(res);
}

// (tuỳ chọn) Nếu backend bạn có route mine:
// GET /api/v1/playlists/me/:id
export async function getMyPlaylistById(playlistId) {
  const res = await http.get(`/playlists/me/${playlistId}`);
  return unwrap(res);
}

// ===== Songs in playlist =====

// Thêm bài vào playlist (auth, owner)
// POST /api/v1/playlists/:id/songs  body: { songId, position? }
export async function addSongToPlaylist(playlistId, body) {
  const res = await http.post(`/playlists/${playlistId}/songs`, body);
  return unwrap(res);
}

// Xoá bài khỏi playlist (auth, owner)
// DELETE /api/v1/playlists/:id/songs/:songId
export async function removeSongFromPlaylist(playlistId, songId) {
  const res = await http.delete(`/playlists/${playlistId}/songs/${songId}`);
  return unwrap(res);
}

// Sắp xếp lại bài trong playlist (auth, owner)
// PATCH /api/v1/playlists/:id/songs/reorder  body: { items: [{ songId, position }] }
export async function reorderPlaylistSongs(playlistId, body) {
  const res = await http.patch(`/playlists/${playlistId}/songs/reorder`, body);
  return unwrap(res);
}
