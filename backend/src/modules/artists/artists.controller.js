/**
 * Công dụng: Controller cho module Artists.
 * - Nhận request, gọi artists.service xử lý, rồi trả response.
 */

import { created, ok } from "../../utils/response.js";
import * as artistsService from "./artists.service.js";

export async function list(req, res) {
  const result = await artistsService.list(req.query);
  return ok(res, result.data, result.meta);
}

export async function getById(req, res) {
  const artistId = Number(req.params.id);
  const result = await artistsService.getById(artistId);
  return ok(res, result);
}

export async function getSongs(req, res) {
  const artistId = Number(req.params.id);
  const result = await artistsService.getSongs(artistId, req.query);
  return ok(res, result.data, result.meta);
}

export async function create(req, res) {
  const result = await artistsService.create(req.body);
  return created(res, result);
}

export async function update(req, res) {
  const artistId = Number(req.params.id);
  const result = await artistsService.update(artistId, req.body);
  return ok(res, result);
}

export async function remove(req, res) {
  const artistId = Number(req.params.id);
  const result = await artistsService.remove(artistId);
  return ok(res, result);
}
