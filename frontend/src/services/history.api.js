import { http } from "@/lib/http";

// Lấy lịch sử nghe của tôi (phân trang)
export async function getMyHistory(params = {}) {
  const res = await http.get("/history/me", { params }); // ✅ đúng
  return res.data?.data; // data là mảng
}

// Ghi nhận 1 lượt nghe
export async function addSongToHistory(songId, duration_listened) {
  const payload = { songId };
  if (typeof duration_listened === "number") {
    payload.duration_listened = duration_listened;
  }

  const res = await http.post("/history", payload); // ✅ đúng
  return res.data?.data;
}
