/**
 * Công dụng: Chuẩn hoá format response thành công/thất bại.
 * - Giúp toàn dự án trả JSON nhất quán.
 * - Dùng trong controller:
 *   return ok(res, data)
 *   return created(res, data)
 */

export function ok(res, data, meta) {
  return res.status(200).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function created(res, data) {
  return res.status(201).json({
    success: true,
    data,
  });
}
