import { http } from "@/lib/http";

// GET /api/v1/genres?q=
export async function listGenres(params = {}) {
  const res = await http.get("/genres", { params });
  return res.data?.data ?? [];
}

// GET /api/v1/genres/:id
export async function getGenreById(id) {
  const res = await http.get(`/genres/${id}`);
  return res.data?.data;
}

// GET /api/v1/genres/:id/songs
export async function getGenreSongs(id, params = {}) {
  const res = await http.get(`/genres/${id}/songs`, { params });
  return res.data;
}

// Admin: POST /api/v1/genres
// fields: name, description?, image?(File)
export async function createGenre({ name, description, imageFile }) {
  if (imageFile) {
    const form = new FormData();
    form.append("name", name);
    if (description) form.append("description", description);
    form.append("image", imageFile);
    const res = await http.post("/genres", form);
    return res.data?.data;
  }
  const res = await http.post("/genres", { name, description });
  return res.data?.data;
}

// Admin: PATCH /api/v1/genres/:id (update name, description, image)
export async function updateGenre(id, { name, description, imageFile }) {
  if (imageFile) {
    const form = new FormData();
    if (name !== undefined) form.append("name", name);
    if (description !== undefined) form.append("description", description ?? "");
    form.append("image", imageFile);
    const res = await http.patch(`/genres/${id}`, form);
    return res.data?.data;
  }
  const body = {};
  if (name !== undefined) body.name = name;
  if (description !== undefined) body.description = description;
  const res = await http.patch(`/genres/${id}`, body);
  return res.data?.data;
}

// Admin: DELETE /api/v1/genres/:id
export async function deleteGenre(id) {
  const res = await http.delete(`/genres/${id}`);
  return res.data?.data;
}
