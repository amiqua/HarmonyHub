import { http } from "@/lib/http";

// Upload bài hát (multipart/form-data)
// API: POST /api/v1/songs (Auth required):contentReference[oaicite:3]{index=3}
/**
 * Upload 1 bước: audio + (optional) ảnh minh hoạ.
 *
 * ⚠️ Backend phải hỗ trợ nhận thêm file ảnh (multer.fields / cloudinary...).
 * Nếu backend chưa cho phép field ảnh, multer sẽ báo: "Unexpected field".
 *
 * Field file backend nhận:
 * - audio (file nhạc)
 * - image (ảnh minh hoạ/cover)
 *
 * Options:
 * - signal: AbortSignal (cancel upload)
 * - onUploadProgress: (evt) => void (progress)
 */
export async function uploadSong({
  audioFile,
  imageFile,
  title,
  duration,
  release_date,
  signal,
  onUploadProgress,
} = {}) {
  const form = new FormData();
  form.append("audio", audioFile); // field name: audio (file)
  form.append("title", title); // required:contentReference[oaicite:4]{index=4}
  if (duration != null && duration !== "") form.append("duration", String(duration));
  if (release_date) form.append("release_date", release_date); // YYYY-MM-DD:contentReference[oaicite:5]{index=5}

  // Optional: ảnh minh hoạ (cover)
  // Backend nhận đúng field file: "image"
  if (imageFile) {
    form.append("image", imageFile);
  }

  // ⚠️ Không set Content-Type thủ công để axios tự gắn boundary
  const res = await http.post("/songs", form, {
    signal,
    onUploadProgress,
  });

  // response chuẩn: { success, data }:contentReference[oaicite:6]{index=6}
  return res.data.data; // trả về song vừa tạo:contentReference[oaicite:7]{index=7}
}

// Lấy danh sách bài hát public (có paging/filter)
// API: GET /api/v1/songs:contentReference[oaicite:8]{index=8}
export async function getSongs(params = {}) {
  const res = await http.get("/songs", { params });
  return res.data; // giữ cả { success, data, meta }
}

// Lấy me (để lọc uploads theo user_id)
// API: GET /api/v1/auth/me (Auth required):contentReference[oaicite:9]{index=9}
export async function getMe() {
  const res = await http.get("/auth/me");
  return res.data.data.user;
}
