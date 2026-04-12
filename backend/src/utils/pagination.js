/**
 * Công dụng: Hỗ trợ phân trang (page/limit) từ query string.
 * - parsePagination(req.query): trả về { page, limit, offset }
 * - buildMeta(page, limit, total): trả về { page, limit, total, totalPages }
 * - Validation: limit max 100, min 1, page min 1
 *
 * Ví dụ:
 *   const { page, limit, offset } = parsePagination(req.query);
 *   const { rows, total } = await repo.list({ limit, offset });
 *   return ok(res, rows, buildMeta(page, limit, total));
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

export function parsePagination(query = {}) {
  const pageRaw = query.page;
  const limitRaw = query.limit;

  let page = Number(pageRaw ?? DEFAULT_PAGE);
  let limit = Number(limitRaw ?? DEFAULT_LIMIT);

  // Validation with bounds
  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(limit) || limit < MIN_LIMIT) limit = DEFAULT_LIMIT;

  // Enforce max limit to prevent DoS
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

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
