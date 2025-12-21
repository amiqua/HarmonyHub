/**
 * Công dụng: Controller cho module Playlists.
 * - Nhận request, gọi playlists.service xử lý, rồi trả response.
 */

import { created, ok } from "../../utils/response.js";
import * as playlistsService from "./playlists.service.js";

export async function listSystem(req, res) {
  const result = await playlistsService.listSystem(req.query);
  return ok(res, result.data, result.meta);
}

export async function listMine(req, res) {
  const result = await playlistsService.listMine(req.user, req.query);
  return ok(res, result.data, result.meta);
}

/** ✅ NEW: tạo playlist của tôi theo POST /playlists/me */
export async function createMine(req, res) {
  const result = await playlistsService.createMine(req.user, req.body);
  return created(res, result);
}

export async function create(req, res) {
  const result = await playlistsService.create(req.user, req.body);
  return created(res, result);
}

export async function getById(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.getById(req.user, playlistId);
  return ok(res, result);
}

/** ✅ NEW: xem chi tiết playlist của tôi theo GET /playlists/me/:id */
export async function getMineById(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.getMineById(req.user, playlistId);
  return ok(res, result);
}

export async function update(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.update(req.user, playlistId, req.body);
  return ok(res, result);
}

/** ✅ NEW: đổi tên playlist của tôi theo PATCH /playlists/me/:id */
export async function updateMine(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.updateMine(
    req.user,
    playlistId,
    req.body
  );
  return ok(res, result);
}

export async function remove(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.remove(req.user, playlistId);
  return ok(res, result);
}

/** ✅ NEW: xoá playlist của tôi theo DELETE /playlists/me/:id */
export async function removeMine(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.removeMine(req.user, playlistId);
  return ok(res, result);
}

export async function addSong(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.addSong(req.user, playlistId, req.body);
  return ok(res, result);
}

export async function removeSong(req, res) {
  const playlistId = Number(req.params.id);
  const songId = Number(req.params.songId);
  const result = await playlistsService.removeSong(
    req.user,
    playlistId,
    songId
  );
  return ok(res, result);
}

export async function reorder(req, res) {
  const playlistId = Number(req.params.id);
  const result = await playlistsService.reorder(req.user, playlistId, req.body);
  return ok(res, result);
}
