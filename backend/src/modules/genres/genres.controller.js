/**
 * Công dụng: Controller cho module Genres.
 * - Nhận request, gọi genres.service xử lý, trả response.
 */

import { created, ok } from "../../utils/response.js";
import * as genresService from "./genres.service.js";

export async function list(req, res) {
  const result = await genresService.list(req.query);
  return ok(res, result);
}

export async function getSongs(req, res) {
  const genreId = Number(req.params.id);
  const result = await genresService.getSongs(genreId, req.query);
  return ok(res, result.data, result.meta);
}

export async function create(req, res) {
  const result = await genresService.create(req.body);
  return created(res, result);
}

export async function update(req, res) {
  const genreId = Number(req.params.id);
  const result = await genresService.update(genreId, req.body);
  return ok(res, result);
}

export async function remove(req, res) {
  const genreId = Number(req.params.id);
  const result = await genresService.remove(genreId);
  return ok(res, result);
}
