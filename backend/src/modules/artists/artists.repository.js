/**
 * Công dụng: Tầng thao tác database cho Artists (viết SQL).
 * - list/getById/create/update/remove: CRUD artists
 * - getSongs: lấy danh sách bài hát theo nghệ sĩ (join song_artists)
 */

import { db } from "../../config/db.js";

export async function list({ limit, offset, q }) {
  const where = [];
  const params = [];
  let idx = 1;

  if (q) {
    where.push(`LOWER(a.name) LIKE LOWER($${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM artists a
    ${whereSql};
    `,
    params
  );
  const total = Number(countRes.rows[0]?.total || 0);

  params.push(limit);
  params.push(offset);

  const rowsRes = await db.query(
    `
    SELECT a.id, a.name, a.bio
    FROM artists a
    ${whereSql}
    ORDER BY a.name ASC
    LIMIT $${idx} OFFSET $${idx + 1};
    `,
    params
  );

  return { rows: rowsRes.rows, total };
}

export async function getById(id) {
  const res = await db.query(
    `SELECT id, name, bio FROM artists WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

export async function create({ name, bio }) {
  const res = await db.query(
    `
    INSERT INTO artists (name, bio)
    VALUES ($1, $2)
    RETURNING id, name, bio;
    `,
    [name, bio ?? null]
  );
  return res.rows[0];
}

export async function update(id, { name, bio }) {
  const res = await db.query(
    `
    UPDATE artists
    SET
      name = COALESCE($1, name),
      bio = COALESCE($2, bio)
    WHERE id = $3
    RETURNING id, name, bio;
    `,
    [name ?? null, bio ?? null, id]
  );
  return res.rows[0] || null;
}

export async function remove(id) {
  const res = await db.query(`DELETE FROM artists WHERE id = $1;`, [id]);
  return res.rowCount > 0;
}

export async function getSongs(artistId, { limit, offset }) {
  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM song_artists sa
    WHERE sa.artist_id = $1;
    `,
    [artistId]
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
      sa.role
    FROM song_artists sa
    JOIN songs s ON s.id = sa.song_id
    WHERE sa.artist_id = $1
    ORDER BY s.release_date DESC NULLS LAST, s.id DESC
    LIMIT $2 OFFSET $3;
    `,
    [artistId, limit, offset]
  );

  return { rows: rowsRes.rows, total };
}
