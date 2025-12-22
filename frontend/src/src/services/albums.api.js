import { http } from "@/lib/http";

export const albumsApi = {
  list(params = {}) {
    return http.get("/api/v1/albums", { params });
  },
  getById(id) {
    return http.get(`/api/v1/albums/${id}`);
  },
};
