/**
 * Công dụng: Controller cho module Auth.
 * - Nhận request (req), gọi service xử lý nghiệp vụ, rồi trả response.
 * - Không viết SQL/logic phức tạp ở đây (để trong auth.service.js).
 */

import { created, ok } from "../../utils/response.js";
import * as authService from "./auth.service.js";

export async function register(req, res) {
  const result = await authService.register(req.body);
  // result: { user, tokens }
  return created(res, result);
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  // result: { user, tokens }
  return ok(res, result);
}

export async function refresh(req, res) {
  const result = await authService.refresh(req.body);
  // result: { accessToken }
  return ok(res, result);
}

export async function me(req, res) {
  // req.user được gắn từ middleware auth()
  const result = await authService.getMe(req.user);
  return ok(res, result);
}
