import { http } from "@/lib/http";

// GET /favorites/me?page=&limit=
export async function getMyFavoriteSongs(params = {}) {
  const res = await http.get("/favorites/me", { params });
  return res.data; // { success, data, meta }
}

// POST /favorites/:songId
export async function addFavoriteSong(songId) {
  const res = await http.post(`/favorites/${songId}`);
  return res.data.data; // { message }
}

// DELETE /favorites/:songId
export async function removeFavoriteSong(songId) {
  const res = await http.delete(`/favorites/${songId}`);
  return res.data.data; // { message }
}
