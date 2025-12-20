/**
 * Công dụng: Tầng thao tác database cho Favorites.
 * - getOrCreateFavoriteListId: lấy favorite_list_id theo user, nếu chưa có thì tạo
 * - listSongs: danh sách bài yêu thích (join favorite_songs -> songs)
 * - addSong/removeSong: thao tác favorite_songs
 */

import { db } from "../../config/db.js";

export async function getOrCreateFavoriteListId(userId) {
  // Lấy trước
  const findRes = await db.query(
    `SELECT id FROM favorite_lists WHERE user_id = $1 LIMIT 1;`,
    [userId]
  );
  if (findRes.rows[0]?.id) return findRes.rows[0].id;

  // Tạo nếu chưa có
  const createRes = await db.query(
    `
    INSERT INTO favorite_lists (user_id)
    VALUES ($1)
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id;
    `,
    [userId]
  );

  return createRes.rows[0].id;
}

export async function listSongs(favoriteListId, { limit, offset }) {
  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM favorite_songs fs
    WHERE fs.favorite_list_id = $1;
    `,
    [favoriteListId]
  );
  const total = Number(countRes.rows[0]?.total || 0);

  const rowsRes = await db.query(
    `
    SELECT
      s.id,
      s.title,
      s.duration,
      s.audio_url,
      s.release_date,
      fs.added_at
    FROM favorite_songs fs
    JOIN songs s ON s.id = fs.song_id
    WHERE fs.favorite_list_id = $1
    ORDER BY fs.added_at DESC, s.id DESC
    LIMIT $2 OFFSET $3;
    `,
    [favoriteListId, limit, offset]
  );

  return { rows: rowsRes.rows, total };
}

export async function addSong(favoriteListId, songId) {
  await db.query(
    `
    INSERT INTO favorite_songs (favorite_list_id, song_id)
    VALUES ($1, $2);
    `,
    [favoriteListId, songId]
  );
}

export async function removeSong(favoriteListId, songId) {
  const res = await db.query(
    `DELETE FROM favorite_songs WHERE favorite_list_id = $1 AND song_id = $2;`,
    [favoriteListId, songId]
  );
  return res.rowCount > 0;
}

export async function getSongById(id) {
  const res = await db.query(
    `SELECT id, title, duration, audio_url, release_date FROM songs WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}
