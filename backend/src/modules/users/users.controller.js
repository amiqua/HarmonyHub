/**
 * Công dụng: Controller cho module Users.
 * - Nhận req, gọi users.service để xử lý, rồi trả response.
 */

import { ok } from "../../utils/response.js";
import * as usersService from "./users.service.js";

export async function getMe(req, res) {
  const result = await usersService.getMe(req.user);
  return ok(res, result);
}

export async function updateMe(req, res) {
  const result = await usersService.updateMe(req.user, req.body);
  return ok(res, result);
}

export async function changePassword(req, res) {
  const result = await usersService.changePassword(req.user, req.body);
  return ok(res, result);
}
