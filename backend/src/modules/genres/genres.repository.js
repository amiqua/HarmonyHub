/**
 * Công dụng: Tầng thao tác database cho Genres (viết SQL).
 * - list/getById/create/update/remove: CRUD genres
 * - getSongs: lấy danh sách bài hát theo thể loại (join song_genres)
 *
 * Cột:
 * - id, name, image_url, image_public_id, description
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

const GENRE_COLUMNS = "id, name, image_url, image_public_id, description";

export async function list({ q }) {
  const params = [];
  let whereSql = "";

  if (q) {
    whereSql = "WHERE LOWER(name) LIKE LOWER($1)";
    params.push(`%${q}%`);
  }

  const res = await db.query(
    `
    SELECT ${GENRE_COLUMNS}
    FROM genres
    ${whereSql}
    ORDER BY name ASC;
    `,
    params
  );

  return res.rows;
}

export async function getById(id) {
  const res = await db.query(
    `SELECT ${GENRE_COLUMNS} FROM genres WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

export async function create({ name, description, image_url, image_public_id }) {
  const res = await db.query(
    `
    INSERT INTO genres (name, description, image_url, image_public_id)
    VALUES ($1, $2, $3, $4)
    RETURNING ${GENRE_COLUMNS};
    `,
    [name, description ?? null, image_url ?? null, image_public_id ?? null]
  );
  return res.rows[0];
}

export async function update(id, patch) {
  const fields = [];
  const params = [];
  let idx = 1;

  for (const col of ["name", "description", "image_url", "image_public_id"]) {
    if (patch[col] !== undefined) {
      fields.push(`${col} = $${idx++}`);
      params.push(patch[col]);
    }
  }

  if (fields.length === 0) {
    return await getById(id);
  }

  params.push(id);
  const res = await db.query(
    `
    UPDATE genres
    SET ${fields.join(", ")}
    WHERE id = $${idx}
    RETURNING ${GENRE_COLUMNS};
    `,
    params
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
