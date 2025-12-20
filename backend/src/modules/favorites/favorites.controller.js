/**
 * Công dụng: Controller cho module Favorites.
 * - Nhận request, gọi favorites.service xử lý, rồi trả response.
 */

import { ok } from "../../utils/response.js";
import * as favoritesService from "./favorites.service.js";

export async function listMine(req, res) {
  const result = await favoritesService.listMine(req.user, req.query);
  return ok(res, result.data, result.meta);
}

export async function add(req, res) {
  const songId = Number(req.params.songId);
  const result = await favoritesService.add(req.user, songId);
  return ok(res, result);
}

export async function remove(req, res) {
  const songId = Number(req.params.songId);
  const result = await favoritesService.remove(req.user, songId);
  return ok(res, result);
}
