/**
 * Công dụng: Xử lý nghiệp vụ cho Artists.
 * - list: phân trang + tìm kiếm theo tên
 * - getById: lấy chi tiết nghệ sĩ
 * - getSongs: lấy danh sách bài hát của nghệ sĩ (join song_artists)
 * - create/update/remove: CRUD nghệ sĩ
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as artistsRepo from "./artists.repository.js";

export async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const q = query.q;

  const { rows, total } = await artistsRepo.list({ limit, offset, q });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function getById(id) {
  const artist = await artistsRepo.getById(id);
  if (!artist) throw new ApiError(404, "Không tìm thấy nghệ sĩ.");
  return artist;
}

export async function getSongs(artistId, query) {
  const artist = await artistsRepo.getById(artistId);
  if (!artist) throw new ApiError(404, "Không tìm thấy nghệ sĩ.");

  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await artistsRepo.getSongs(artistId, { limit, offset });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function create(data) {
  const created = await artistsRepo.create(data);
  return created;
}

export async function update(id, data) {
  const updated = await artistsRepo.update(id, data);
  if (!updated) throw new ApiError(404, "Không tìm thấy nghệ sĩ để cập nhật.");
  return updated;
}

export async function remove(id) {
  const ok = await artistsRepo.remove(id);
  if (!ok) throw new ApiError(404, "Không tìm thấy nghệ sĩ để xoá.");
  return { message: "Xoá nghệ sĩ thành công." };
}
