// FILE: src/components/zingchart/ZingChartPageContent.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { http } from "@/lib/http";

import ZingChartHero from "@/components/zingchart/hero/ZingChartHero";
import ZingChartLineChart from "@/components/zingchart/chart/ZingChartLineChart";
import ZingChartRankingsSection from "@/components/zingchart/rankings/ZingChartRankingsSection";
import WeeklyChartsSection from "@/components/zingchart/weekly/WeeklyChartsSection";

/**
 * Props:
 * - onRequireLogin?: () => void
 * - onPlaySong?: (song) => void   // ✅ thêm prop để phát nhạc bằng GlobalAudioPlayer
 */
export default function ZingChartPageContent({ onRequireLogin, onPlaySong }) {
  // ===== Playback state (UI highlight) =====
  const [currentSongId, setCurrentSongId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ===== API state =====
  const [songsRaw, setSongsRaw] = useState([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const errorToastedRef = useRef(false);

  // ===== Build API path (không đổi .env) =====
  const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  const songsPath = useMemo(() => {
    // nếu baseURL đã có /api/v1 -> gọi "/songs"
    const baseHasV1 =
      /\/api\/v1\/?$/.test(baseURL) || baseURL.includes("/api/v1");
    return baseHasV1 ? "/songs" : "/api/v1/songs";
  }, [baseURL]);

  // ===== Utils =====
  const getPlaysNumber = (song) => {
    const v =
      song?.plays ??
      song?.play_count ??
      song?.listen_count ??
      song?.views ??
      song?.view_count ??
      0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const getCoverUrl = (song) =>
    song?.coverUrl ??
    song?.cover_url ??
    song?.image_url ??
    song?.thumbnail ??
    song?.thumb ??
    "";

  // ✅ quan trọng: map đúng field audio để GlobalAudioPlayer phát được
  const getAudioUrl = (song) =>
    song?.audioUrl ??
    song?.audio_url ??
    song?.file_url ??
    song?.fileUrl ??
    song?.song_url ??
    song?.url ??
    "";

  const normalizeSong = (song, rank = 0, delta = 0) => {
    const title = song?.title ?? song?.name ?? "Không rõ tên";

    let artist = "";
    if (Array.isArray(song?.artists)) {
      artist = song.artists
        .map((a) => a?.name ?? a)
        .filter(Boolean)
        .join(", ");
    } else {
      artist =
        song?.artist ??
        song?.artist_name ??
        song?.artists_name ??
        song?.artistNames ??
        "";
    }

    const album = song?.album?.title ?? song?.album_title ?? song?.album ?? "";

    const duration =
      song?.duration_seconds ?? song?.duration ?? song?.length ?? null;

    return {
      ...song,
      id: song?.id ?? song?._id ?? `${title}-${Math.random()}`,
      title,
      artist,
      album,
      duration,

      // ✅ để UI có cover + audio
      coverUrl: getCoverUrl(song),
      audioUrl: getAudioUrl(song),

      // ✅ để BXH dùng
      plays: getPlaysNumber(song),
      rank,
      delta,
    };
  };

  const pickRandom = (arr, n) => {
    const a = Array.isArray(arr) ? [...arr] : [];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  };

  // ===== Fetch songs =====
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setIsLoadingSongs(true);

        const res = await http.get(songsPath, {
          params: { page: 1, limit: 200 },
        });

        const payload = res?.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];

        if (!alive) return;
        setSongsRaw(list);
        errorToastedRef.current = false;
      } catch (err) {
        console.error("[ZingChartPageContent] Fetch songs failed:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          songsPath,
          baseURL,
        });

        if (!errorToastedRef.current) {
          errorToastedRef.current = true;
          toast.error("Tải dữ liệu #zingchart thất bại. Vui lòng thử lại.");
        }
      } finally {
        if (alive) setIsLoadingSongs(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [songsPath, baseURL]);

  // ===== Chart demo (không để trống) =====
  const chartLabels = useMemo(
    () => [
      "23:00",
      "01:00",
      "03:00",
      "05:00",
      "07:00",
      "09:00",
      "11:00",
      "13:00",
      "15:00",
      "17:00",
      "19:00",
      "21:00",
    ],
    []
  );

  const chartSeries = useMemo(
    () => [
      {
        name: "Series A",
        data: [32, 28, 26, 24, 30, 44, 42, 39, 36, 33, 35, 50],
      },
      {
        name: "Series B",
        data: [28, 25, 23, 22, 27, 40, 39, 36, 34, 31, 33, 46],
      },
      {
        name: "Series C",
        data: [36, 32, 29, 27, 33, 47, 45, 41, 38, 35, 37, 52],
      },
    ],
    []
  );

  // ===== Rankings data =====
  const topSongs = useMemo(() => {
    if (!songsRaw.length) return [];

    // sort theo plays giảm dần (nếu backend không có plays thì vẫn ra danh sách)
    const ranked = [...songsRaw].sort(
      (a, b) => getPlaysNumber(b) - getPlaysNumber(a)
    );

    return ranked.slice(0, 10).map((s, idx) => normalizeSong(s, idx + 1, 0));
  }, [songsRaw]);

  const suggestions = useMemo(() => {
    if (!songsRaw.length) return [];
    return pickRandom(songsRaw, 10).map((s) => normalizeSong(s, 0, 0));
  }, [songsRaw]);

  // ===== Weekly charts: dùng topSongs để luôn có dữ liệu =====
  const weeklyCharts = useMemo(() => {
    // 1) Ưu tiên topSongs (đã normalize)
    let base = Array.isArray(topSongs) ? topSongs : [];

    // 2) Nếu topSongs rỗng (chưa fetch xong / plays = 0 / vv) thì fallback từ songsRaw
    if (base.length === 0) {
      base = Array.isArray(songsRaw)
        ? songsRaw.slice(0, 10).map((s, idx) => normalizeSong(s, idx + 1, 0))
        : [];
    }

    // 3) Lấy 5 bài đầu để show trong từng card
    const baseItems = base.slice(0, 5).map((s, i) => ({
      ...s,
      rank: i + 1,
      delta: 0,
    }));

    return [
      { regionKey: "vn", title: "Việt Nam", items: baseItems },
      { regionKey: "usuk", title: "US-UK", items: baseItems },
      { regionKey: "kpop", title: "K-Pop", items: baseItems },
    ];
  }, [topSongs, songsRaw]);

  // ===== Handlers =====
  const handlePlayChart = () => {
    const first = topSongs?.[0];
    if (!first) return toast.error("Không có bài để phát.");

    setCurrentSongId(first.id);
    setIsPlaying(true);

    // ✅ gọi lên GlobalAudioPlayer
    onPlaySong?.(first);

    console.log("[ZingChartPageContent] Play chart:", first);
  };

  const handlePlaySong = (song) => {
    setCurrentSongId(song?.id ?? null);
    setIsPlaying(true);

    // ✅ gọi lên GlobalAudioPlayer
    onPlaySong?.(song);

    console.log("[ZingChartPageContent] Play song:", song);
  };

  const handleMoreTop100 = () => toast.success("Xem Top 100 (demo).");

  const handleRequireLogin = () => {
    toast.error("Bạn cần đăng nhập để dùng tính năng này.");
    onRequireLogin?.();
  };

  return (
    <div className="space-y-8">
      <ZingChartHero onPlay={handlePlayChart} />

      <ZingChartLineChart
        labels={chartLabels}
        series={chartSeries}
        activeIndex={5}
      />

      <ZingChartRankingsSection
        suggestions={suggestions}
        items={topSongs}
        onPlaySong={handlePlaySong}
        onRequireLogin={handleRequireLogin}
        currentSongId={currentSongId}
        isPlaying={isPlaying}
        isLoading={isLoadingSongs}
      />

      <WeeklyChartsSection
        charts={weeklyCharts}
        onViewTop100={handleMoreTop100}
        onPlayItem={handlePlaySong}
        onViewAllRegion={(chart) => {
          toast.success(`Xem tất cả: ${chart?.title ?? "Weekly"} (demo).`);
        }}
      />
    </div>
  );
}
