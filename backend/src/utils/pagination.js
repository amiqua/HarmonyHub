/**
 * Công dụng: Hỗ trợ phân trang (page/limit) từ query string.
 * - parsePagination(req.query): trả về { page, limit, offset }
 * - buildMeta(page, limit, total): trả về { page, limit, total, totalPages }
 *
 * Ví dụ:
 *   const { page, limit, offset } = parsePagination(req.query);
 *   const { rows, total } = await repo.list({ limit, offset });
 *   return ok(res, rows, buildMeta(page, limit, total));
 */

export function parsePagination(query = {}) {
  const pageRaw = query.page;
  const limitRaw = query.limit;

  let page = Number(pageRaw ?? 1);
  let limit = Number(limitRaw ?? 20);

  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 20;

  // Giới hạn để tránh client spam lấy quá nhiều
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function buildMeta(page, limit, total) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
  };
}
