/**
 * Công dụng: Xử lý nghiệp vụ cho Albums.
 * - list: phân trang + tìm kiếm + sort
 * - getById: lấy chi tiết album (kèm tracklist)
 * - create/update/remove: CRUD album
 * - addSong/updateSong/removeSong: quản lý bảng album_songs
 *
 * Lưu ý schema:
 * - album_songs.song_id UNIQUE => 1 bài hát chỉ thuộc 1 album.
 *   Vì vậy addSong sẽ báo lỗi nếu bài đó đã thuộc album khác.
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as albumsRepo from "./albums.repository.js";

export async function list(query) {
  const { page, limit, offset } = parsePagination(query);
  const { rows, total } = await albumsRepo.list({
    limit,
    offset,
    q: query.q,
    sort: query.sort,
  });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function getById(id) {
  const album = await albumsRepo.getById(id);
  if (!album) throw new ApiError(404, "Không tìm thấy album.");

  const tracks = await albumsRepo.getTracks(id);
  return { ...album, tracks };
}

export async function create(data) {
  const created = await albumsRepo.create(data);
  return created;
}

export async function update(id, data) {
  const updated = await albumsRepo.update(id, data);
  if (!updated) throw new ApiError(404, "Không tìm thấy album để cập nhật.");
  return updated;
}

export async function remove(id) {
  const ok = await albumsRepo.remove(id);
  if (!ok) throw new ApiError(404, "Không tìm thấy album để xoá.");
  return { message: "Xoá album thành công." };
}

export async function addSong(albumId, { songId, trackNumber }) {
  const album = await albumsRepo.getById(albumId);
  if (!album) throw new ApiError(404, "Không tìm thấy album.");

  const song = await albumsRepo.getSongById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  try {
    await albumsRepo.addSong(albumId, songId, trackNumber);
  } catch (err) {
    // vi phạm UNIQUE song_id trong album_songs
    if (err?.code === "23505") {
      throw new ApiError(409, "Bài hát này đã thuộc một album khác.");
    }
    throw err;
  }

  return { message: "Thêm bài hát vào album thành công." };
}

export async function updateSong(albumId, songId, { trackNumber }) {
  const ok = await albumsRepo.updateTrackNumber(albumId, songId, trackNumber);
  if (!ok) throw new ApiError(404, "Không tìm thấy bài hát trong album để cập nhật.");
  return { message: "Cập nhật track number thành công." };
}

export async function removeSong(albumId, songId) {
  const ok = await albumsRepo.removeSong(albumId, songId);
  if (!ok) throw new ApiError(404, "Không tìm thấy bài hát trong album để xoá.");
  return { message: "Xoá bài hát khỏi album thành công." };
}
