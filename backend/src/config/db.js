/**
 * Công dụng: Tạo pool kết nối PostgreSQL (pg.Pool) từ DATABASE_URL.
 * - Dùng chung cho toàn dự án: import { db } ... rồi db.query(...)
 * - Hỗ trợ SSL cho Neon/Cloud Postgres (sslmode=require trong DATABASE_URL).
 */

import pg from "pg";
import { env } from "./env.js";

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
});

// Log lỗi ở mức pool (không làm sập process ngay, nhưng nên theo dõi)
db.on("error", (err) => {
  console.error("❌ Lỗi pool PostgreSQL:", err);
});
