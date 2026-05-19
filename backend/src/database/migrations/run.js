/**
 * Migration runner — chạy các file .sql trong cùng thư mục theo thứ tự tên.
 *
 *   node src/database/migrations/run.js               # all files
 *   node src/database/migrations/run.js 001_xxx.sql   # one file
 *
 * Cần DATABASE_URL trong .env (giống cấu hình backend).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "../../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function listSqlFiles() {
  const entries = await fs.readdir(__dirname);
  return entries
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b, "en"));
}

async function runOne(file) {
  const fp = path.join(__dirname, file);
  const sql = await fs.readFile(fp, "utf8");
  const start = Date.now();
  await db.query(sql);
  return Date.now() - start;
}

async function main() {
  const requested = process.argv.slice(2);
  const files = requested.length > 0 ? requested : await listSqlFiles();

  if (files.length === 0) {
    console.log("[migrate] no .sql files found.");
    return;
  }

  console.log(`[migrate] running ${files.length} file(s)…`);
  for (const f of files) {
    process.stdout.write(`  • ${f} … `);
    try {
      const ms = await runOne(f);
      console.log(`ok (${ms}ms)`);
    } catch (err) {
      console.log("FAILED");
      console.error(err?.message || err);
      process.exitCode = 1;
      break;
    }
  }
}

main().finally(() => process.exit(process.exitCode ?? 0));
