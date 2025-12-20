/**
 * Công dụng: Tầng thao tác database cho Songs (viết SQL).
 * - list: trả về danh sách bài hát + total (phục vụ phân trang)
 * - getById/create/update/remove: CRUD songs
 * - getSongArtists/getSongGenres/getSongAlbum: lấy dữ liệu liên kết
 * - add/remove artist/genre, set/remove album: thao tác bảng liên kết
 *
 * Nâng cấp:
 * - Thêm songs.user_id để biết bài hát thuộc user nào (owner).
 * - Thêm songs.audio_public_id để lưu public_id của Cloudinary (phục vụ xoá/cập nhật file).
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

export async function list({
  limit,
  offset,
  q,
  genreId,
  artistId,
  albumId,
  sort,
}) {
  const where = [];
  const params = [];
  let idx = 1;

  if (q) {
    where.push(`LOWER(s.title) LIKE LOWER($${idx})`);
    params.push(`%${q}%`);
    idx++;
  }

  if (genreId) {
    where.push(`
      EXISTS (
        SELECT 1 FROM song_genres sg
        WHERE sg.song_id = s.id AND sg.genre_id = $${idx}
      )
    `);
    params.push(genreId);
    idx++;
  }

  if (artistId) {
    where.push(`
      EXISTS (
        SELECT 1 FROM song_artists sa
        WHERE sa.song_id = s.id AND sa.artist_id = $${idx}
      )
    `);
    params.push(artistId);
    idx++;
  }

  if (albumId) {
    where.push(`
      EXISTS (
        SELECT 1 FROM album_songs als
        WHERE als.song_id = s.id AND als.album_id = $${idx}
      )
    `);
    params.push(albumId);
    idx++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderBy = buildSort(sort);

  // Đếm total
  const countRes = await db.query(
    `
    SELECT COUNT(*)::bigint AS total
    FROM songs s
    ${whereSql};
    `,
    params
  );

  const total = Number(countRes.rows[0]?.total || 0);

  // Lấy rows
  params.push(limit);
  params.push(offset);

  const rowsRes = await db.query(
    `
    SELECT
      s.id,
      s.title,
      s.duration,
      s.audio_url,
      s.audio_public_id,
      s.release_date,
      s.user_id
    FROM songs s
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
    `
    SELECT
      id,
      title,
      duration,
      audio_url,
      audio_public_id,
      release_date,
      user_id
    FROM songs
    WHERE id = $1
    LIMIT 1;
    `,
    [id]
  );

  return res.rows[0] || null;
}

export async function create({
  user_id,
  title,
  duration,
  audio_url,
  audio_public_id,
  release_date,
}) {
  const res = await db.query(
    `
    INSERT INTO songs (user_id, title, duration, audio_url, audio_public_id, release_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, user_id, title, duration, audio_url, audio_public_id, release_date;
    `,
    [
      user_id,
      title,
      duration ?? null,
      audio_url ?? null,
      audio_public_id ?? null,
      release_date ? new Date(release_date) : null,
    ]
  );

  return res.rows[0];
}

export async function update(
  id,
  { title, duration, audio_url, audio_public_id, release_date }
) {
  const res = await db.query(
    `
    UPDATE songs
    SET
      title = COALESCE($1, title),
      duration = COALESCE($2, duration),
      audio_url = COALESCE($3, audio_url),
      audio_public_id = COALESCE($4, audio_public_id),
      release_date = COALESCE($5, release_date)
    WHERE id = $6
    RETURNING id, user_id, title, duration, audio_url, audio_public_id, release_date;
    `,
    [
      title ?? null,
      duration ?? null,
      audio_url ?? null,
      audio_public_id ?? null,
      // để giống style hiện tại của bạn: null/Date tùy trường hợp
      release_date === undefined
        ? null
        : release_date
          ? new Date(release_date)
          : null,
      id,
    ]
  );

  return res.rows[0] || null;
}

export async function remove(id) {
  const res = await db.query(`DELETE FROM songs WHERE id = $1;`, [id]);
  return res.rowCount > 0;
}

/** ====== LIÊN KẾT: ARTISTS / GENRES / ALBUM ====== */

export async function getSongArtists(songId) {
  const res = await db.query(
    `
    SELECT
      a.id,
      a.name,
      a.bio,
      sa.role
    FROM song_artists sa
    JOIN artists a ON a.id = sa.artist_id
    WHERE sa.song_id = $1
    ORDER BY a.name ASC;
    `,
    [songId]
  );
  return res.rows;
}

export async function getSongGenres(songId) {
  const res = await db.query(
    `
    SELECT
      g.id,
      g.name
    FROM song_genres sg
    JOIN genres g ON g.id = sg.genre_id
    WHERE sg.song_id = $1
    ORDER BY g.name ASC;
    `,
    [songId]
  );
  return res.rows;
}

export async function getSongAlbum(songId) {
  const res = await db.query(
    `
    SELECT
      al.id,
      al.title,
      al.release_date,
      als.track_number
    FROM album_songs als
    JOIN albums al ON al.id = als.album_id
    WHERE als.song_id = $1
    LIMIT 1;
    `,
    [songId]
  );
  return res.rows[0] || null;
}

export async function addArtist(songId, artistId, role) {
  await db.query(
    `
    INSERT INTO song_artists (song_id, artist_id, role)
    VALUES ($1, $2, $3);
    `,
    [songId, artistId, role ?? null]
  );
}

export async function removeArtist(songId, artistId) {
  const res = await db.query(
    `DELETE FROM song_artists WHERE song_id = $1 AND artist_id = $2;`,
    [songId, artistId]
  );
  return res.rowCount > 0;
}

export async function addGenre(songId, genreId) {
  await db.query(
    `
    INSERT INTO song_genres (song_id, genre_id)
    VALUES ($1, $2);
    `,
    [songId, genreId]
  );
}

export async function removeGenre(songId, genreId) {
  const res = await db.query(
    `DELETE FROM song_genres WHERE song_id = $1 AND genre_id = $2;`,
    [songId, genreId]
  );
  return res.rowCount > 0;
}

export async function setAlbum(songId, albumId, trackNumber) {
  // song_id UNIQUE => upsert theo song_id
  await db.query(
    `
    INSERT INTO album_songs (album_id, song_id, track_number)
    VALUES ($1, $2, $3)
    ON CONFLICT (song_id)
    DO UPDATE SET
      album_id = EXCLUDED.album_id,
      track_number = EXCLUDED.track_number;
    `,
    [albumId, songId, trackNumber ?? null]
  );
}

export async function removeAlbum(songId) {
  const res = await db.query(`DELETE FROM album_songs WHERE song_id = $1;`, [
    songId,
  ]);
  return res.rowCount > 0;
}

/** ====== CHECK TỒN TẠI (cho service dùng) ====== */

export async function getArtistById(id) {
  const res = await db.query(
    `SELECT id, name, bio FROM artists WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

export async function getGenreById(id) {
  const res = await db.query(
    `SELECT id, name FROM genres WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}

export async function getAlbumById(id) {
  const res = await db.query(
    `SELECT id, title, release_date FROM albums WHERE id = $1 LIMIT 1;`,
    [id]
  );
  return res.rows[0] || null;
}
