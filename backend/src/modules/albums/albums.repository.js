/**
 * Công dụng: Tầng thao tác database cho Albums (viết SQL).
 * - list/getById/create/update/remove: CRUD albums
 * - getTracks/addSong/updateTrackNumber/removeSong: thao tác album_songs
 */

import { db } from "../../config/db.js";

function buildSort(sort) {
  switch (sort) {
    case "oldest":
      return "a.release_date ASC NULLS LAST, a.id ASC";
    case "title_asc":
      return "a.title ASC, a.id ASC";
    case "title_desc":
      return "a.title DESC, a.id ASC";
    case "newest":
    default:
      return "a.release_date DESC NULLS LAST, a.id DESC";
  }
}

export async function list({ limit, offset, q, sort }) {
  const where = [];
  const params = [];
  let idx = 1;

  if (q) {
    where.push(`LOWER(a.title) LIKE LOWER($${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = buildSort(sort);

  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM albums a
    ${whereSql};
    `,
    params
  );
  const total = Number(countRes.rows[0]?.total || 0);

  params.push(limit);
  params.push(offset);

  const rowsRes = await db.query(
    `
    SELECT a.id, a.title, a.release_date
    FROM albums a
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT $${idx} OFFSET $${idx + 1};
    `,
    params
  );

  return { rows: rowsRes.rows, total };
}

export async function getById(id) {
  const res = await db.query(
    `SELECT id, title, release_date FROM albums WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

export async function create({ title, release_date }) {
  const res = await db.query(
    `
    INSERT INTO albums (title, release_date)
    VALUES ($1, $2)
    RETURNING id, title, release_date;
    `,
    [title, release_date ? new Date(release_date) : null]
  );
  return res.rows[0];
}

export async function update(id, { title, release_date }) {
  const res = await db.query(
    `
    UPDATE albums
    SET
      title = COALESCE($1, title),
      release_date = COALESCE($2, release_date)
    WHERE id = $3
    RETURNING id, title, release_date;
    `,
    [
      title ?? null,
      release_date === undefined ? null : (release_date ? new Date(release_date) : null),
      id,
    ]
  );
  return res.rows[0] || null;
}

export async function remove(id) {
  const res = await db.query(`DELETE FROM albums WHERE id = $1;`, [id]);
  return res.rowCount > 0;
}

export async function getTracks(albumId) {
  const res = await db.query(
    `
    SELECT
      s.id,
      s.title,
      s.duration,
      s.audio_url,
      s.release_date,
      als.track_number
    FROM album_songs als
    JOIN songs s ON s.id = als.song_id
    WHERE als.album_id = $1
    ORDER BY als.track_number ASC NULLS LAST, s.id ASC;
    `,
    [albumId]
  );

  return res.rows;
}

export async function addSong(albumId, songId, trackNumber) {
  await db.query(
    `
    INSERT INTO album_songs (album_id, song_id, track_number)
    VALUES ($1, $2, $3);
    `,
    [albumId, songId, trackNumber ?? null]
  );
}

export async function updateTrackNumber(albumId, songId, trackNumber) {
  const res = await db.query(
    `
    UPDATE album_songs
    SET track_number = $1
    WHERE album_id = $2 AND song_id = $3;
    `,
    [trackNumber, albumId, songId]
  );

  return res.rowCount > 0;
}

export async function removeSong(albumId, songId) {
  const res = await db.query(
    `DELETE FROM album_songs WHERE album_id = $1 AND song_id = $2;`,
    [albumId, songId]
  );
  return res.rowCount > 0;
}

/** Check tồn tại song (cho service dùng) */
export async function getSongById(id) {
  const res = await db.query(
    `SELECT id, title, duration, audio_url, release_date FROM songs WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}
