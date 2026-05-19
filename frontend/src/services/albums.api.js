import { http } from "@/lib/http";

// Backend mount: /api/v1/albums
// http baseURL defaults to /api/v1, nên ở đây chỉ dùng "/albums" để tránh /api/v1/api/v1.
export const albumsApi = {
  list(params = {}) {
    return http.get("/albums", { params });
  },
  getById(id) {
    return http.get(`/albums/${id}`);
  },
};
