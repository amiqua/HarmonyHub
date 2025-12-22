import { http } from "@/lib/http";

// Hỗ trợ cả 2 kiểu baseURL:
// - baseURL đã có /api/v1  -> gọi "/songs"
// - baseURL chưa có /api/v1 (hoặc baseURL rỗng dùng Vite proxy) -> gọi "/api/v1/songs"
function songsPath() {
  const base = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const baseHasV1 = /\/api\/v1\/?$/i.test(base);
  return baseHasV1 ? "/songs" : "/api/v1/songs";
}

export const songsApi = {
  list(params = {}) {
    return http.get(songsPath(), { params });
  },
  getById(id) {
    return http.get(`${songsPath()}/${id}`);
  },
};
