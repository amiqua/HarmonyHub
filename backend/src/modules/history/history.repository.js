/**
 * Công dụng: Tầng thao tác database cho History (play_history).
 * - listMine: lấy lịch sử nghe của user (join songs để trả thông tin bài hát)
 * - create: insert vào play_history
 */

import { db } from "../../config/db.js";

export async function listMine(userId, { limit, offset }) {
  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM play_history ph
    WHERE ph.user_id = $1;
    `,
    [userId]
  );
  const total = Number(countRes.rows[0]?.total || 0);

  const rowsRes = await db.query(
    `
    SELECT
      ph.id,
      ph.played_at,
      ph.duration_listened,
      s.id AS song_id,
      s.title,
      s.duration,
      s.audio_url,
      s.release_date
    FROM play_history ph
    JOIN songs s ON s.id = ph.song_id
    WHERE ph.user_id = $1
    ORDER BY ph.played_at DESC, ph.id DESC
    LIMIT $2 OFFSET $3;
    `,
    [userId, limit, offset]
  );

  return { rows: rowsRes.rows, total };
}

export async function create({ userId, songId, duration_listened }) {
  const res = await db.query(
    `
    INSERT INTO play_history (user_id, song_id, duration_listened)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, song_id, played_at, duration_listened;
    `,
    [userId, songId, duration_listened ?? null]
  );

  return res.rows[0];
}

export async function getSongById(id) {
  const res = await db.query(
    `SELECT id, title, duration, audio_url, release_date FROM songs WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}
