import { http } from "@/lib/http";

export const songsApi = {
  list(params = {}) {
    return http.get("/api/v1/songs", { params });
  },
  getById(id) {
    return http.get(`/api/v1/songs/${id}`);
  },
};
