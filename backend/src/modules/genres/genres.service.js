/**
 * Công dụng: Xử lý nghiệp vụ cho Genres.
 * - list: trả danh sách thể loại (có thể tìm theo q)
 * - getSongs: lấy danh sách bài hát theo thể loại (join song_genres)
 * - create/update/remove: CRUD genres
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as genresRepo from "./genres.repository.js";

function normalizePgUniqueError(err) {
  if (err?.code !== "23505") return null;

  const constraint = err?.constraint || "";
  if (constraint.includes("genres_name_key")) {
    return new ApiError(409, "Tên thể loại đã tồn tại.");
  }
  return new ApiError(409, "Dữ liệu bị trùng (unique constraint).");
}

export async function list(query) {
  const q = query.q;
  return genresRepo.list({ q });
}

export async function getSongs(genreId, query) {
  const genre = await genresRepo.getById(genreId);
  if (!genre) throw new ApiError(404, "Không tìm thấy thể loại.");

  const { page, limit, offset } = parsePagination(query);

  const { rows, total } = await genresRepo.getSongs(genreId, {
    limit,
    offset,
    sort: query.sort,
  });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function create({ name }) {
  try {
    return await genresRepo.create({ name });
  } catch (err) {
    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function update(id, { name }) {
  try {
    const updated = await genresRepo.update(id, { name });
    if (!updated) throw new ApiError(404, "Không tìm thấy thể loại để cập nhật.");
    return updated;
  } catch (err) {
    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function remove(id) {
  const ok = await genresRepo.remove(id);
  if (!ok) throw new ApiError(404, "Không tìm thấy thể loại để xoá.");
  return { message: "Xoá thể loại thành công." };
}
