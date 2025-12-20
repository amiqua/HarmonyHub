/**
 * Công dụng: Controller cho module History.
 * - Nhận request, gọi history.service xử lý, rồi trả response.
 */

import { created, ok } from "../../utils/response.js";
import * as historyService from "./history.service.js";

export async function listMine(req, res) {
  const result = await historyService.listMine(req.user, req.query);
  return ok(res, result.data, result.meta);
}

export async function create(req, res) {
  const result = await historyService.create(req.user, req.body);
  return created(res, result);
}
