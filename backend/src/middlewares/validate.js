/**
 * Công dụng: Middleware validate input (body/query/params) bằng Zod.
 * - Giúp controller không phải tự kiểm tra dữ liệu.
 * - Nếu dữ liệu không hợp lệ -> trả lỗi 400 kèm danh sách field sai.
 *
 * Cách dùng:
 *   router.post("/", validate({ body: createSchema }), controller.create)
 *   router.get("/", validate({ query: listSchema }), controller.list)
 */

import { ApiError } from "../errors/ApiError.js";

export function validate(schemas = {}) {
  const { body, query, params } = schemas;

  return (req, _res, next) => {
    try {
      if (body) req.body = body.parse(req.body);
      if (query) req.query = query.parse(req.query);
      if (params) req.params = params.parse(req.params);
      return next();
    } catch (err) {
      // ZodError có format riêng
      const details =
        err?.errors?.map((e) => ({
          field: e.path?.join("."),
          message: e.message,
        })) || [];

      throw new ApiError(400, "Dữ liệu không hợp lệ.", { details });
    }
  };
}
