// FILE: src/services/playlists.api.js
// Công dụng: Client gọi API playlists (theo backend bạn đang có).
// - Public: list system playlists
// - User: list mine, create, update, delete playlist của tôi
// - Detail: get playlist by id (kèm songs)
// - Songs: add/remove/reorder bài hát trong playlist
//
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
// Backend bạn có 2 kiểu:
// - API cũ: POST /api/v1/playlists
// - API mới bạn đang chỉnh: POST /api/v1/playlists/me
// -> Mình ưu tiên /me trước, nếu backend chưa có thì đổi sang "/playlists".
export async function createMyPlaylist(body) {
  // body: { name }
  const res = await http.post("/playlists/me", body);
  return unwrap(res);
}

// ✅ Đổi tên playlist của tôi (auth)
// PATCH /api/v1/playlists/me/:id
export async function updateMyPlaylist(playlistId, body) {
  // body: { name }
  const res = await http.patch(`/playlists/me/${playlistId}`, body);
  return unwrap(res);
}

// ✅ Xoá playlist của tôi (auth)
// DELETE /api/v1/playlists/me/:id
export async function deleteMyPlaylist(playlistId) {
  const res = await http.delete(`/playlists/me/${playlistId}`);
  return unwrap(res);
}

// ===== Detail =====

// Xem chi tiết playlist (kèm songs)
// GET /api/v1/playlists/:id
// (backend: system ai cũng xem được; user thì cần owner)
export async function getPlaylistById(playlistId) {
  const res = await http.get(`/playlists/${playlistId}`);
  return unwrap(res);
}

// (tuỳ chọn) Nếu bạn muốn gọi thẳng route mine:
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
