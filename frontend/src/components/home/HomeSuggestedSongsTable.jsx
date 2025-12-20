import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCcw } from "lucide-react";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * HomeSuggestedSongsTable
 * - Gợi ý = 10 bài mới nhất
 * - API: GET /api/v1/songs?page=1&limit=10&sort=newest
 */
export default function HomeSuggestedSongsTable({
  title = "Gợi Ý Bài Hát",
  onPlaySong,
  onSelectSong,
}) {
  const errorToastedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [rows, setRows] = useState([]);

  const formatDuration = (value) => {
    if (value == null) return "--:--";
    if (typeof value === "string") return value;

    const total = Number(value);
    if (Number.isNaN(total) || total < 0) return "--:--";
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const normalizeSong = (song) => {
    const title = song?.title ?? song?.name ?? "Không rõ tên";
    const coverUrl =
      song?.cover_url ?? song?.image_url ?? song?.thumbnail ?? "";

    let artistsText = "";
    if (Array.isArray(song?.artists)) {
      artistsText = song.artists
        .map((a) => a?.name ?? a)
        .filter(Boolean)
        .join(", ");
    } else {
      artistsText =
        song?.artist ??
        song?.artist_name ??
        song?.artists_name ??
        song?.artistNames ??
        "";
    }

    const albumText =
      song?.album?.title ?? song?.album_title ?? song?.album ?? "";

    const duration = formatDuration(
      song?.duration ?? song?.duration_seconds ?? song?.length
    );

    const plays =
      song?.plays ??
      song?.play_count ??
      song?.listen_count ??
      song?.views ??
      song?.view_count ??
      null;

    return { title, artistsText, albumText, duration, coverUrl, plays };
  };

  const fetchLatest10 = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setIsFetching(true);

      const res = await http.get("/songs", {
        params: { page: 1, limit: 10, sort: "newest" },
      });

      const payload = res?.data;
      const data = Array.isArray(payload?.data) ? payload.data : [];
      setRows(data);

      // reset flag toast lỗi
      errorToastedRef.current = false;
    } catch (err) {
      console.error("[HomeSuggestedSongsTable] Fetch latest 10 failed:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      if (!errorToastedRef.current) {
        errorToastedRef.current = true;
        toast.error("Tải danh sách bài hát gợi ý thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest10();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[HomeSuggestedSongsTable] ${logTag}: Missing handler`);
        return;
      }
      fn();
      toast.success(okMsg);
    } catch (err) {
      console.error(`[HomeSuggestedSongsTable] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const handlePlay = (song) => {
    const { title } = normalizeSong(song);
    safeAction(
      () => onPlaySong?.(song),
      `Đang phát: ${title}`,
      `Không thể phát: ${title}`,
      `PlaySong(${song?.id ?? "no-id"})`
    );
  };

  const handleSelectRow = (song) => {
    const { title } = normalizeSong(song);
    safeAction(
      () => onSelectSong?.(song),
      `Đã chọn: ${title}`,
      `Không thể chọn: ${title}`,
      `SelectSong(${song?.id ?? "no-id"})`
    );
  };

  const handleRefresh = async () => {
    await fetchLatest10({ silent: true });
    toast.success("Đã làm mới danh sách bài hát.");
  };

  const displayRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={handleRefresh}
          aria-label="Refresh"
          title="Làm mới"
        >
          <RefreshCcw className={cn("size-4", isFetching && "animate-spin")} />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">#</TableHead>
              <TableHead>Bài hát</TableHead>
              <TableHead className="hidden md:table-cell">Album</TableHead>
              <TableHead className="w-[90px] text-right">Thời lượng</TableHead>
              <TableHead className="w-[110px] text-right">Lượt nghe</TableHead>
              <TableHead className="w-[80px] text-right">Phát</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-4">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-4 md:table-cell">
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Skeleton className="ml-auto h-4 w-14" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <Skeleton className="ml-auto h-8 w-10 rounded-xl" />
                  </TableCell>
                </TableRow>
              ))
            ) : displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm opacity-70"
                >
                  Không có dữ liệu bài hát.
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((song, i) => {
                const n = normalizeSong(song);
                const idx = i + 1;

                return (
                  <TableRow
                    key={song?.id ?? `${n.title}-${i}`}
                    className="cursor-pointer hover:bg-accent/40"
                    onClick={() => handleSelectRow(song)}
                  >
                    <TableCell className="font-medium opacity-80">
                      {idx}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-muted/30">
                          {n.coverUrl ? (
                            <img
                              src={n.coverUrl}
                              alt={n.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {n.title}
                          </div>
                          {n.artistsText ? (
                            <div className="truncate text-xs opacity-70">
                              {n.artistsText}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="truncate text-sm opacity-80">
                        {n.albumText || "-"}
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-sm opacity-80">
                      {n.duration}
                    </TableCell>

                    <TableCell className="text-right text-sm opacity-80">
                      {n.plays == null ? "-" : Number(n.plays).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        className="h-9 w-9 rounded-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlay(song);
                        }}
                        aria-label="Play song"
                        title="Phát"
                      >
                        <Play className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
