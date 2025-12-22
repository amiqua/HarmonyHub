/**
 * Công dụng: Controller cho module Songs.
 * - Nhận request, gọi songs.service xử lý, và trả response chuẩn.
 * - Không viết SQL ở đây.
 *
 * Nâng cấp:
 * - Truyền userPayload (req.user) xuống service cho các thao tác protected.
 * - Truyền req.files (nếu upload multipart) xuống service để lấy audio_url + audio_public_id
 *   và cover_url + cover_public_id.
 */

import { created, ok } from "../../utils/response.js";
import * as songsService from "./songs.service.js";

export async function list(req, res) {
  const result = await songsService.list(req.query);
  return ok(res, result.data, result.meta);
}

export async function getById(req, res) {
  const result = await songsService.getById(Number(req.params.id));
  return ok(res, result);
}

export async function create(req, res) {
  // req.user: từ auth()
  // req.files: từ uploadSongMediaFields (nếu multipart/form-data)
  const files = req.files || {};
  const audioFile = Array.isArray(files.audio) ? files.audio[0] : undefined;
  const imageFile = Array.isArray(files.image) ? files.image[0] : undefined;

  const result = await songsService.create(req.user, req.body, {
    audioFile,
    imageFile,
  });
  return created(res, result);
}

export async function update(req, res) {
  const songId = Number(req.params.id);
  const files = req.files || {};
  const audioFile = Array.isArray(files.audio) ? files.audio[0] : undefined;
  const imageFile = Array.isArray(files.image) ? files.image[0] : undefined;

  const result = await songsService.update(req.user, songId, req.body, {
    audioFile,
    imageFile,
  });
  return ok(res, result);
}

export async function remove(req, res) {
  const songId = Number(req.params.id);
  const result = await songsService.remove(req.user, songId);
  return ok(res, result);
}

export async function addArtist(req, res) {
  const songId = Number(req.params.id);
  const result = await songsService.addArtist(req.user, songId, req.body);
  return ok(res, result);
}

export async function removeArtist(req, res) {
  const songId = Number(req.params.id);
  const artistId = Number(req.params.artistId);
  const result = await songsService.removeArtist(req.user, songId, artistId);
  return ok(res, result);
}

export async function addGenre(req, res) {
  const songId = Number(req.params.id);
  const result = await songsService.addGenre(req.user, songId, req.body);
  return ok(res, result);
}

export async function removeGenre(req, res) {
  const songId = Number(req.params.id);
  const genreId = Number(req.params.genreId);
  const result = await songsService.removeGenre(req.user, songId, genreId);
  return ok(res, result);
}

export async function setAlbum(req, res) {
  const songId = Number(req.params.id);
  const result = await songsService.setAlbum(req.user, songId, req.body);
  return ok(res, result);
}

export async function removeAlbum(req, res) {
  const songId = Number(req.params.id);
  const result = await songsService.removeAlbum(req.user, songId);
  return ok(res, result);
}
