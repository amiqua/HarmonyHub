/**
 * Công dụng: Tạo pool kết nối PostgreSQL (pg.Pool) từ DATABASE_URL.
 * - Dùng chung cho toàn dự án: import { db } ... rồi db.query(...)
 * - Hỗ trợ SSL cho Neon/Cloud Postgres (sslmode=require trong DATABASE_URL).
 * - Có query timeout để prevent hanging connections
 */

import pg from "pg";
import { env } from "./env.js";
import { logger } from "./logger.js";

const { Pool } = pg;

// Với Neon (DATABASE_URL có sslmode=require) thường cần ssl: { rejectUnauthorized: false }
export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // số kết nối tối đa trong pool
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  statementTimeoutMillis: 30_000, // Query timeout: 30 seconds
});

// Log lỗi ở mức pool (không làm sập process ngay, nhưng nên theo dõi)
db.on("error", (err) => {
  logger.error(err, "Pool PostgreSQL error");
});

// Wrapper để add timeout cho queries
export async function queryWithTimeout(sql, params, timeoutMs = 30000) {
  const query = db.query(sql, params);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Query timeout after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  return Promise.race([query, timeoutPromise]);
}
