import { http } from "@/lib/http";

// Lấy lịch sử (dùng cho trang History)
export async function getMyHistory(params = {}) {
  const res = await http.get("/me/history", { params });
  return res.data?.data; // theo chuẩn { success, data, meta }
}

// Ghi lịch sử khi play 1 bài
export async function addSongToHistory(songId) {
  const res = await http.post("/me/history", {
    type: "songs",
    songId,
  });
  return res.data?.data;
}
