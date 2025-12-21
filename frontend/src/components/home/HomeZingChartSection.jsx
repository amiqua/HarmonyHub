import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { Play, RefreshCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HomeZingChartSection
 * - Hiển thị khối #zingchart: top 3 bài + chart placeholder
 * - Gọi API: GET /songs?page=1&limit=3 (không đoán sort)
 *
 * Props (optional):
 * - title: string (default "#zingchart")
 * - limit: number (default 3)
 * - onPlayAll(): void
 * - onPlaySong(song): void
 * - onMoreClick(): void
 */
export default function HomeZingChartSection({
  title = "#zingchart",
  limit = 3,
  onPlayAll,
  onPlaySong,
  onMoreClick,
}) {
  const errorToastedRef = useRef(false);

  const fallbackPercents = useMemo(() => [49, 28, 23], []);

  const chartData = useMemo(
    () => [
      { t: "23:00", a: 22, b: 18, c: 15 },
      { t: "02:00", a: 18, b: 16, c: 14 },
      { t: "05:00", a: 16, b: 15, c: 13 },
      { t: "09:00", a: 28, b: 24, c: 21 },
      { t: "11:00", a: 26, b: 23, c: 20 },
      { t: "13:00", a: 24, b: 21, c: 19 },
      { t: "15:00", a: 23, b: 20, c: 18 },
      { t: "17:00", a: 22, b: 19, c: 17 },
      { t: "19:00", a: 24, b: 21, c: 19 },
      { t: "21:00", a: 30, b: 26, c: 23 },
    ],
    []
  );

  const getSongTitle = (song) => song?.title ?? song?.name ?? "Không rõ tên";
  const getArtistText = (song) => {
    if (Array.isArray(song?.artists)) {
      const names = song.artists.map((a) => a?.name ?? a).filter(Boolean);
      return names.join(", ");
    }
    return (
      song?.artist ??
      song?.artist_name ??
      song?.artistNames ??
      song?.artists_name ??
      ""
    );
  };

  const query = useQuery({
    queryKey: ["zingchart-top", limit],
    queryFn: async () => {
      try {
        const res = await http.get("/songs", {
          params: { page: 1, limit },
        });

        const payload = res?.data;
        const list = Array.isArray(payload?.data) ? payload.data : [];

        return list;
      } catch (err) {
        console.error("[HomeZingChartSection] Fetch top songs failed:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        throw err;
      }
    },
    staleTime: 30_000,
    retry: 1,
  });

  if (query.isError && !errorToastedRef.current) {
    errorToastedRef.current = true;
    toast.error("Tải #zingchart thất bại. Vui lòng thử lại.");
  }

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[HomeZingChartSection] ${logTag}: Missing handler`);
        return;
      }
      fn();
      toast.success(okMsg);
    } catch (err) {
      console.error(`[HomeZingChartSection] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const handleRefresh = async () => {
    try {
      errorToastedRef.current = false;
      await query.refetch();
      toast.success("Đã làm mới #zingchart.");
    } catch (err) {
      console.error("[HomeZingChartSection] Refetch failed:", err);
      toast.error("Làm mới thất bại.");
    }
  };

  const handlePlayAll = () =>
    safeAction(
      onPlayAll,
      "Đang phát #zingchart (demo).",
      "Chưa cấu hình phát tất cả.",
      "PlayAll"
    );

  const handlePlaySong = (song) => {
    const t = getSongTitle(song);
    safeAction(
      () => onPlaySong?.(song),
      `Đang phát: ${t}`,
      `Không thể phát: ${t}`,
      `PlaySong(${song?.id ?? "no-id"})`
    );
  };

  const handleMore = () => {
    if (typeof onMoreClick === "function") return onMoreClick();
    // fallback: tự điều hướng (nếu bạn muốn)
    // navigate("/zingchart");
    toast.error("Chưa cấu hình hành động Xem thêm.");
  };

  return (
    <Card className="overflow-hidden rounded-3xl border-border">
      <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/30 to-purple-900/20">
        <CardContent className="p-6 md:p-7">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-tight text-purple-200">
              {title}
            </h3>

            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full"
              onClick={handlePlayAll}
              aria-label="Play"
              title="Phát"
            >
              <Play className="size-4" />
            </Button>

            <div className="ml-auto">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full"
                onClick={handleRefresh}
                aria-label="Refresh"
                title="Làm mới"
              >
                <RefreshCcw
                  className={cn("size-4", query.isFetching && "animate-spin")}
                />
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {/* Left: Top list */}
            <div className="space-y-3">
              {query.isLoading ? (
                <>
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </>
              ) : (
                (query.data ?? []).slice(0, limit).map((song, i) => {
                  const rank = i + 1;
                  const t = getSongTitle(song);
                  const artist = getArtistText(song);
                  const percent =
                    typeof song?.percent === "number"
                      ? song.percent
                      : (fallbackPercents[i] ?? 0);

                  return (
                    <button
                      key={song?.id ?? `${t}-${i}`}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border border-border bg-black/20 px-4 py-3 text-left",
                        "hover:bg-black/30"
                      )}
                      onClick={() => handlePlaySong(song)}
                    >
                      {/* Rank */}
                      <div
                        className={cn(
                          "w-7 text-2xl font-extrabold leading-none",
                          rank === 1 && "text-red-300",
                          rank === 2 && "text-green-300",
                          rank === 3 && "text-blue-300"
                        )}
                      >
                        {rank}
                      </div>

                      {/* Cover */}
                      <div className="h-10 w-10 overflow-hidden rounded-xl bg-muted/30">
                        {song?.cover_url ||
                        song?.image_url ||
                        song?.thumbnail ? (
                          <img
                            src={
                              song.cover_url || song.image_url || song.thumbnail
                            }
                            alt={t}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-purple-100">
                          {t}
                        </div>
                        {artist ? (
                          <div className="truncate text-xs text-purple-100/70">
                            {artist}
                          </div>
                        ) : null}
                      </div>

                      {/* Percent */}
                      <div className="text-sm font-semibold text-purple-100">
                        {percent}%
                      </div>
                    </button>
                  );
                })
              )}

              <Separator className="my-2 bg-white/10" />

              <Button
                variant="secondary"
                className="h-11 w-full rounded-2xl bg-black/20 hover:bg-black/30"
                onClick={handleMore}
              >
                Xem thêm
              </Button>
            </div>

            {/* Right: Chart placeholder */}
            <div className="rounded-2xl border border-border bg-black/15 p-4">
              <div className="mb-3 text-sm font-medium text-purple-100/80">
                Biểu đồ (placeholder)
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="t"
                      tick={{ fontSize: 12 }}
                      stroke="rgba(255,255,255,0.35)"
                    />
                    <YAxis hide />
                    <ReTooltip
                      contentStyle={{
                        background: "rgba(0,0,0,0.75)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.85)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="a"
                      dot={false}
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="b"
                      dot={false}
                      stroke="var(--chart-2)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="c"
                      dot={false}
                      stroke="var(--chart-3)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-2 text-xs text-purple-100/60">
                *Chart hiện chưa nối API chart riêng — tạm hiển thị demo để khớp
                UI.
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
