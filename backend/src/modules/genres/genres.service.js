/**
 * Công dụng: Xử lý nghiệp vụ cho Genres.
 */

import { ApiError } from "../../errors/ApiError.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import * as genresRepo from "./genres.repository.js";
import { cloudinary } from "../../config/cloudinary.js";

function normalizePgUniqueError(err) {
  if (err?.code !== "23505") return null;

  const constraint = err?.constraint || "";
  if (constraint.includes("genres_name_key")) {
    return new ApiError(409, "Tên thể loại đã tồn tại.");
  }
  return new ApiError(409, "Dữ liệu bị trùng (unique constraint).");
}

export async function list(query) {
  const q = query.q;
  return genresRepo.list({ q });
}

export async function getSongs(genreId, query) {
  const genre = await genresRepo.getById(genreId);
  if (!genre) throw new ApiError(404, "Không tìm thấy thể loại.");

  const { page, limit, offset } = parsePagination(query);

  const { rows, total } = await genresRepo.getSongs(genreId, {
    limit,
    offset,
    sort: query.sort,
  });

  return {
    data: rows,
    meta: buildMeta(page, limit, total),
  };
}

export async function getById(id) {
  const genre = await genresRepo.getById(id);
  if (!genre) throw new ApiError(404, "Không tìm thấy thể loại.");
  return genre;
}

export async function create(body, imageFile) {
  const payload = {
    name: body.name,
    description: body.description ?? null,
  };

  if (imageFile) {
    payload.image_url = imageFile.path || imageFile.secure_url || imageFile.url;
    payload.image_public_id = imageFile.filename;
  }

  try {
    return await genresRepo.create(payload);
  } catch (err) {
    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function update(id, body, imageFile) {
  const existing = await genresRepo.getById(id);
  if (!existing) throw new ApiError(404, "Không tìm thấy thể loại để cập nhật.");

  const patch = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.description !== undefined) patch.description = body.description;

  if (imageFile) {
    patch.image_url = imageFile.path || imageFile.secure_url || imageFile.url;
    patch.image_public_id = imageFile.filename;

    // xoá ảnh cũ trên cloudinary (best-effort, không chặn flow)
    if (existing.image_public_id) {
      try {
        await cloudinary.uploader.destroy(existing.image_public_id, {
          resource_type: "image",
        });
      } catch (err) {
        console.warn(
          "[genres] destroy old image failed:",
          err?.message || err
        );
      }
    }
  }

  try {
    const updated = await genresRepo.update(id, patch);
    if (!updated)
      throw new ApiError(404, "Không tìm thấy thể loại để cập nhật.");
    return updated;
  } catch (err) {
    const mapped = normalizePgUniqueError(err);
    if (mapped) throw mapped;
    throw err;
  }
}

export async function remove(id) {
  const existing = await genresRepo.getById(id);
  const ok = await genresRepo.remove(id);
  if (!ok) throw new ApiError(404, "Không tìm thấy thể loại để xoá.");

  if (existing?.image_public_id) {
    try {
      await cloudinary.uploader.destroy(existing.image_public_id, {
        resource_type: "image",
      });
    } catch (err) {
      console.warn("[genres] destroy image after remove failed:", err?.message);
    }
  }

  return { message: "Xoá thể loại thành công." };
}
