/**
 * Công dụng: Controller cho module Albums.
 * - Nhận request, gọi albums.service xử lý, rồi trả response.
 */

import { created, ok } from "../../utils/response.js";
import * as albumsService from "./albums.service.js";

export async function list(req, res) {
  const result = await albumsService.list(req.query);
  return ok(res, result.data, result.meta);
}

export async function getById(req, res) {
  const albumId = Number(req.params.id);
  const result = await albumsService.getById(albumId);
  return ok(res, result);
}

export async function create(req, res) {
  const result = await albumsService.create(req.body);
  return created(res, result);
}

export async function update(req, res) {
  const albumId = Number(req.params.id);
  const result = await albumsService.update(albumId, req.body);
  return ok(res, result);
}

export async function remove(req, res) {
  const albumId = Number(req.params.id);
  const result = await albumsService.remove(albumId);
  return ok(res, result);
}

export async function addSong(req, res) {
  const albumId = Number(req.params.id);
  const result = await albumsService.addSong(albumId, req.body);
  return ok(res, result);
}

export async function updateSong(req, res) {
  const albumId = Number(req.params.id);
  const songId = Number(req.params.songId);
  const result = await albumsService.updateSong(albumId, songId, req.body);
  return ok(res, result);
}

export async function removeSong(req, res) {
  const albumId = Number(req.params.id);
  const songId = Number(req.params.songId);
  const result = await albumsService.removeSong(albumId, songId);
  return ok(res, result);
}
