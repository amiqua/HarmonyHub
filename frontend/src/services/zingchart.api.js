import { http } from "@/lib/http";

// Tránh lỗi /api/v1/api/v1 nếu baseURL đã có /api/v1
function getSongsPath() {
  const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  const baseHasV1 =
    /\/api\/v1\/?$/.test(baseURL) || baseURL.includes("/api/v1");
  return baseHasV1 ? "/songs" : "/api/v1/songs";
}

function getPlaysNumber(song) {
  const v =
    song?.plays ??
    song?.play_count ??
    song?.listen_count ??
    song?.views ??
    song?.view_count ??
    0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchZingChartSongs({ fetchLimit = 100, q } = {}) {
  const path = getSongsPath();

  const res = await http.get(path, {
    params: {
      page: 1,
      limit: fetchLimit,
      ...(q ? { q } : {}),
    },
  });

  const payload = res?.data;
  const list = Array.isArray(payload?.data) ? payload.data : [];

  // sort giảm dần theo lượt nghe (tự tính BXH)
  const ranked = [...list].sort(
    (a, b) => getPlaysNumber(b) - getPlaysNumber(a)
  );

  return ranked;
}
