import { parsePagination, buildMeta } from "../src/utils/pagination.js";

describe("Pagination Utility", () => {
  test("parsePagination with default values", () => {
    const result = parsePagination({});

    expect(result).toEqual({
      page: 1,
      limit: 20,
      offset: 0,
    });
  });

  test("parsePagination with custom values", () => {
    const result = parsePagination({ page: "2", limit: "10" });

    expect(result).toEqual({
      page: 2,
      limit: 10,
      offset: 10,
    });
  });

  test("parsePagination enforces max limit", () => {
    const result = parsePagination({ limit: "999" });

    expect(result.limit).toBe(100);
  });

  test("parsePagination validates negative page", () => {
    const result = parsePagination({ page: "-1" });

    expect(result.page).toBe(1);
  });

  test("buildMeta calculates totalPages correctly", () => {
    const meta = buildMeta(1, 20, 100);

    expect(meta).toEqual({
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
  });

  test("buildMeta handles single page", () => {
    const meta = buildMeta(1, 20, 5);

    expect(meta.totalPages).toBe(1);
  });
});
