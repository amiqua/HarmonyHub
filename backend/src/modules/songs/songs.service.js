/**
 * Công dụng: Xử lý nghiệp vụ cho Songs.
 * - list/getById: public
 * - create/update/remove + các thao tác liên kết: bắt buộc đăng nhập
 * - Chỉ chủ sở hữu (songs.user_id) mới được update/delete và sửa liên kết
 *
 * Nâng cấp:
 * - create/update nhận thêm `files` (từ multer Cloudinary) để tự lấy audio_url + audio_public_id
 *   và cover_url + cover_public_id.
 * - remove cố gắng xoá file trên Cloudinary (best-effort), rồi xoá DB.
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import {
  cloudinary,
  ensureCloudinaryConfigured,
} from "../../config/cloudinary.js";
import { logger } from "../../config/logger.js";
import * as songsRepo from "./songs.repository.js";

function requireUser(userPayload) {
  const userId = userPayload?.userId;
  if (!userId) throw new ApiError(401, "Bạn cần đăng nhập.");
  return userId;
}

async function requireOwner(userPayload, songId) {
  const userId = requireUser(userPayload);

  const song = await songsRepo.getById(songId);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  if (song.user_id !== userId) {
    throw new ApiError(403, "Bạn không có quyền thao tác bài hát này.");
  }

  return { userId, song };
}

function pickAudioFromFile(file) {
  if (!file) return {};

  const audio_url = file?.path || file?.secure_url;
  // multer-storage-cloudinary thường gắn public_id vào `filename`
  const audio_public_id = file?.filename || file?.public_id;

  return {
    ...(audio_url ? { audio_url } : {}),
    ...(audio_public_id ? { audio_public_id } : {}),
  };
}

function pickCoverFromFile(file) {
  if (!file) return {};

  const cover_url = file?.path || file?.secure_url;
  const cover_public_id = file?.filename || file?.public_id;

  return {
    ...(cover_url ? { cover_url } : {}),
    ...(cover_public_id ? { cover_public_id } : {}),
  };
}

function normalizeNumber(v, fieldName) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n))
    throw new ApiError(400, `${fieldName} không hợp lệ.`);
  return n;
}

/** Public */
export async function list(query) {
  const { page, limit, offset } = parsePagination(query);

  const filters = {
    q: query.q,
    genreId: query.genreId ? Number(query.genreId) : undefined,
    artistId: query.artistId ? Number(query.artistId) : undefined,
    albumId: query.albumId ? Number(query.albumId) : undefined,
    sort: query.sort,
  };

  const { rows, total } = await songsRepo.list({ limit, offset, ...filters });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

/** Public */
export async function getById(id) {
  const song = await songsRepo.getById(id);
  if (!song) throw new ApiError(404, "Không tìm thấy bài hát.");

  const [artists, genres, album] = await Promise.all([
    songsRepo.getSongArtists(id),
    songsRepo.getSongGenres(id),
    songsRepo.getSongAlbum(id),
  ]);

  return { ...song, artists, genres, album };
}

/**
 * Create (Protected)
 * - Ưu tiên lấy audio_url + audio_public_id từ file upload
 * - Nếu không upload file, có thể nhận audio_url/audio_public_id từ body (tuỳ bạn)
 */
export async function create(userPayload, body, files) {
  const userId = requireUser(userPayload);

  const fromAudio = pickAudioFromFile(files?.audioFile);
  const fromCover = pickCoverFromFile(files?.imageFile);

  const data = {
    user_id: userId,
    title: body.title,
    duration: normalizeNumber(body.duration, "duration"),
    release_date: body.release_date,
    audio_url: fromAudio.audio_url ?? body.audio_url,
    audio_public_id: fromAudio.audio_public_id ?? body.audio_public_id,
    cover_url: fromCover.cover_url ?? body.cover_url,
    cover_public_id: fromCover.cover_public_id ?? body.cover_public_id,
  };

  const created = await songsRepo.create(data);
  return created;
}

/**
 * Update (Protected, only owner)
 * - Nếu có upload file mới: cập nhật audio_url + audio_public_id
 * - (Tuỳ chọn) xoá file cũ trên Cloudinary (best-effort)
 */
export async function update(userPayload, songId, body, files) {
  const { song: current } = await requireOwner(userPayload, songId);

  const fromAudio = pickAudioFromFile(files?.audioFile);
  const fromCover = pickCoverFromFile(files?.imageFile);

  // Nếu upload file mới và bài cũ có public_id -> thử xoá file cũ để tránh rác
  if (fromAudio.audio_public_id && current.audio_public_id) {
    try {
      ensureCloudinaryConfigured();
      await cloudinary.uploader.destroy(current.audio_public_id, {
        resource_type: "video",
      });
    } catch (err) {
      logger.warn(
        {
          err: { message: err?.message },
          audio_public_id: current.audio_public_id,
        },
        "Delete old Cloudinary audio failed (ignored)"
      );
    }
  }

  // Nếu upload cover mới và bài cũ có cover_public_id -> xoá cover cũ (best-effort)
  if (fromCover.cover_public_id && current.cover_public_id) {
    try {
      ensureCloudinaryConfigured();
      await cloudinary.uploader.destroy(current.cover_public_id, {
        resource_type: "image",
      });
    } catch (err) {
      logger.warn(
        {
          err: { message: err?.message },
          cover_public_id: current.cover_public_id,
        },
        "Delete old Cloudinary cover failed (ignored)"
      );
    }
  }

  const data = {
    title: body.title,
    duration:
      body.duration === undefined
        ? undefined
        : normalizeNumber(body.duration, "duration"),
    audio_url: fromAudio.audio_url ?? body.audio_url,
    audio_public_id: fromAudio.audio_public_id ?? body.audio_public_id,
    cover_url: fromCover.cover_url ?? body.cover_url,
    cover_public_id: fromCover.cover_public_id ?? body.cover_public_id,
    release_date: body.release_date,
  };

  const updated = await songsRepo.update(songId, data);
  if (!updated) throw new ApiError(404, "Không tìm thấy bài hát để cập nhật.");
  return updated;
}

/**
 * Remove (Protected, only owner)
 * - best-effort: xoá Cloudinary trước (nếu có public_id), sau đó xoá DB
 */
export async function remove(userPayload, songId) {
  const { song: current } = await requireOwner(userPayload, songId);

  if (current.audio_public_id) {
    try {
      ensureCloudinaryConfigured();
      await cloudinary.uploader.destroy(current.audio_public_id, {
        resource_type: "video",
      });
    } catch (err) {
      logger.warn(
        {
          err: { message: err?.message },
          audio_public_id: current.audio_public_id,
        },
        "Delete Cloudinary audio failed (ignored)"
      );
    }
  }

  if (current.cover_public_id) {
    try {
      ensureCloudinaryConfigured();
      await cloudinary.uploader.destroy(current.cover_public_id, {
        resource_type: "image",
      });
    } catch (err) {
      logger.warn(
        {
          err: { message: err?.message },
          cover_public_id: current.cover_public_id,
        },
        "Delete Cloudinary cover failed (ignored)"
      );
    }
  }

  const ok = await songsRepo.remove(songId);
  if (!ok) throw new ApiError(404, "Không tìm thấy bài hát để xoá.");

  return { message: "Xoá bài hát thành công." };
}

/** ====== LIÊN KẾT: chỉ owner mới được thao tác ====== */

export async function addArtist(userPayload, songId, { artistId, role }) {
  await requireOwner(userPayload, songId);

  const artist = await songsRepo.getArtistById(artistId);
  if (!artist) throw new ApiError(404, "Không tìm thấy nghệ sĩ.");

  try {
    await songsRepo.addArtist(songId, artistId, role);
  } catch (err) {
    if (err?.code === "23505") {
      throw new ApiError(409, "Nghệ sĩ đã được gán cho bài hát này.");
    }
    throw err;
  }

  return { message: "Gán nghệ sĩ cho bài hát thành công." };
}

export async function removeArtist(userPayload, songId, artistId) {
  await requireOwner(userPayload, songId);

  const ok = await songsRepo.removeArtist(songId, artistId);
  if (!ok)
    throw new ApiError(
      404,
      "Không tìm thấy liên kết bài hát - nghệ sĩ để xoá."
    );

  return { message: "Gỡ nghệ sĩ khỏi bài hát thành công." };
}

export async function addGenre(userPayload, songId, { genreId }) {
  await requireOwner(userPayload, songId);

  const genre = await songsRepo.getGenreById(genreId);
  if (!genre) throw new ApiError(404, "Không tìm thấy thể loại.");

  try {
    await songsRepo.addGenre(songId, genreId);
  } catch (err) {
    if (err?.code === "23505") {
      throw new ApiError(409, "Thể loại đã được gán cho bài hát này.");
    }
    throw err;
  }

  return { message: "Gán thể loại cho bài hát thành công." };
}

export async function removeGenre(userPayload, songId, genreId) {
  await requireOwner(userPayload, songId);

  const ok = await songsRepo.removeGenre(songId, genreId);
  if (!ok)
    throw new ApiError(
      404,
      "Không tìm thấy liên kết bài hát - thể loại để xoá."
    );

  return { message: "Gỡ thể loại khỏi bài hát thành công." };
}

export async function setAlbum(userPayload, songId, { albumId, trackNumber }) {
  await requireOwner(userPayload, songId);

  const album = await songsRepo.getAlbumById(albumId);
  if (!album) throw new ApiError(404, "Không tìm thấy album.");

  await songsRepo.setAlbum(songId, albumId, trackNumber);

  return { message: "Gán album cho bài hát thành công." };
}

export async function removeAlbum(userPayload, songId) {
  await requireOwner(userPayload, songId);

  const ok = await songsRepo.removeAlbum(songId);
  if (!ok)
    throw new ApiError(
      404,
      "Bài hát hiện không thuộc album nào (không có gì để xoá)."
    );

  return { message: "Bỏ album khỏi bài hát thành công." };
}
