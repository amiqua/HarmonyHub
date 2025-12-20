/**
 * Công dụng: Tầng thao tác database cho Genres (viết SQL).
 * - list/getById/create/update/remove: CRUD genres
 * - getSongs: lấy danh sách bài hát theo thể loại (join song_genres)
 */

import { db } from "../../config/db.js";

function buildSort(sort) {
  switch (sort) {
    case "oldest":
      return "s.release_date ASC NULLS LAST, s.id ASC";
    case "title_asc":
      return "s.title ASC, s.id ASC";
    case "title_desc":
      return "s.title DESC, s.id ASC";
    case "newest":
    default:
      return "s.release_date DESC NULLS LAST, s.id DESC";
  }
}

export async function list({ q }) {
  const params = [];
  let whereSql = "";

  if (q) {
    whereSql = "WHERE LOWER(name) LIKE LOWER($1)";
    params.push(`%${q}%`);
  }

  const res = await db.query(
    `
    SELECT id, name
    FROM genres
    ${whereSql}
    ORDER BY name ASC;
    `,
    params
  );

  return res.rows;
}

export async function getById(id) {
  const res = await db.query(`SELECT id, name FROM genres WHERE id = $1 LIMIT 1;`, [id]);
  return res.rows[0] || null;
}

export async function create({ name }) {
  const res = await db.query(
    `
    INSERT INTO genres (name)
    VALUES ($1)
    RETURNING id, name;
    `,
    [name]
  );
  return res.rows[0];
}

export async function update(id, { name }) {
  const res = await db.query(
    `
    UPDATE genres
    SET name = $1
    WHERE id = $2
    RETURNING id, name;
    `,
    [name, id]
  );
  return res.rows[0] || null;
}

export async function remove(id) {
  const res = await db.query(`DELETE FROM genres WHERE id = $1;`, [id]);
  return res.rowCount > 0;
}

export async function getSongs(genreId, { limit, offset, sort }) {
  const orderBy = buildSort(sort);

  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM song_genres sg
    WHERE sg.genre_id = $1;
    `,
    [genreId]
  );
  const total = Number(countRes.rows[0]?.total || 0);

  const rowsRes = await db.query(
    `
    SELECT
      s.id,
      s.title,
      s.duration,
      s.audio_url,
      s.release_date
    FROM song_genres sg
    JOIN songs s ON s.id = sg.song_id
    WHERE sg.genre_id = $1
    ORDER BY ${orderBy}
    LIMIT $2 OFFSET $3;
    `,
    [genreId, limit, offset]
  );

  return { rows: rowsRes.rows, total };
}
