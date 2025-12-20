/**
 * Công dụng: Tầng thao tác database cho Playlists (viết SQL).
 * - listSystem/listMine: danh sách playlist (có phân trang)
 * - getById/create/update/remove: CRUD playlists
 * - getSongs/addSong/removeSong/reorderSongs: thao tác playlist_songs
 *
 * Ghi chú:
 * - playlists.type: system | user
 * - playlist_songs UNIQUE (playlist_id, song_id)
 */

import { db } from "../../config/db.js";

export async function listSystem({ limit, offset, q }) {
  const where = [`p.type = 'system'`];
  const params = [];
  let idx = 1;

  if (q) {
    where.push(`LOWER(p.name) LIKE LOWER($${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM playlists p
    ${whereSql};
    `,
    params
  );
  const total = Number(countRes.rows[0]?.total || 0);

  params.push(limit);
  params.push(offset);

  const rowsRes = await db.query(
    `
    SELECT p.id, p.name, p.type, p.created_at, p.user_id
    FROM playlists p
    ${whereSql}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${idx} OFFSET $${idx + 1};
    `,
    params
  );

  return { rows: rowsRes.rows, total };
}

export async function listMine(userId, { limit, offset, q }) {
  const where = [`p.type = 'user'`, `p.user_id = $1`];
  const params = [userId];
  let idx = 2;

  if (q) {
    where.push(`LOWER(p.name) LIKE LOWER($${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM playlists p
    ${whereSql};
    `,
    params
  );
  const total = Number(countRes.rows[0]?.total || 0);

  params.push(limit);
  params.push(offset);

  const rowsRes = await db.query(
    `
    SELECT p.id, p.name, p.type, p.created_at, p.user_id
    FROM playlists p
    ${whereSql}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $${idx} OFFSET $${idx + 1};
    `,
    params
  );

  return { rows: rowsRes.rows, total };
}

export async function getById(id) {
  const res = await db.query(
    `
    SELECT id, name, type, created_at, user_id
    FROM playlists
    WHERE id = $1
    LIMIT 1;
    `,
    [id]
  );
  return res.rows[0] || null;
}

export async function createUserPlaylist(userId, name) {
  const res = await db.query(
    `
    INSERT INTO playlists (name, type, user_id)
    VALUES ($1, 'user', $2)
    RETURNING id, name, type, created_at, user_id;
    `,
    [name, userId]
  );
  return res.rows[0];
}

export async function updateName(id, name) {
  const res = await db.query(
    `
    UPDATE playlists
    SET name = $1
    WHERE id = $2
    RETURNING id, name, type, created_at, user_id;
    `,
    [name, id]
  );
  return res.rows[0] || null;
}

export async function remove(id) {
  const res = await db.query(`DELETE FROM playlists WHERE id = $1;`, [id]);
  return res.rowCount > 0;
}

export async function getSongs(playlistId) {
  const res = await db.query(
    `
    SELECT
      s.id,
      s.title,
      s.duration,
      s.audio_url,
      s.release_date,
      ps.position,
      ps.added_at
    FROM playlist_songs ps
    JOIN songs s ON s.id = ps.song_id
    WHERE ps.playlist_id = $1
    ORDER BY ps.position ASC NULLS LAST, ps.added_at ASC, ps.id ASC;
    `,
    [playlistId]
  );

  return res.rows;
}

export async function addSong(playlistId, songId, position) {
  await db.query(
    `
    INSERT INTO playlist_songs (playlist_id, song_id, position)
    VALUES ($1, $2, $3);
    `,
    [playlistId, songId, position ?? null]
  );
}

export async function removeSong(playlistId, songId) {
  const res = await db.query(
    `DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2;`,
    [playlistId, songId]
  );
  return res.rowCount > 0;
}

export async function reorderSongs(playlistId, items) {
  await db.query("BEGIN");
  try {
    for (const it of items) {
      await db.query(
        `
        UPDATE playlist_songs
        SET position = $1
        WHERE playlist_id = $2 AND song_id = $3;
        `,
        [it.position, playlistId, it.songId]
      );
    }
    await db.query("COMMIT");
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

export async function getSongById(id) {
  const res = await db.query(
    `SELECT id, title, duration, audio_url, release_date FROM songs WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}