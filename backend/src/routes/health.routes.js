/**
 * Công dụng: Route health check để kiểm tra server/DB đang hoạt động.
 * - GET /health: trả về trạng thái "ok" và (tuỳ chọn) ping database.
 */

import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  // Ping DB để biết DB còn sống không
  const result = await db.query("SELECT NOW() as now;");
  res.json({
    status: "ok",
    time: result.rows[0]?.now,
  });
});

export default router;
