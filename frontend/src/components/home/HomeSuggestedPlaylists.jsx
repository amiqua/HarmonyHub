import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Play, RefreshCcw } from "lucide-react";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/**
 * HomeSuggestedPlaylists (giữ tên để khỏi sửa import)
 * - "Có thể bạn thích" = 10 BÀI HÁT NGẪU NHIÊN
 * - Gọi thẳng API trong component
 *
 * Fix quan trọng:
 * - Tự tránh lỗi /api/v1/api/v1 khi .env baseURL đã chứa /api/v1
 *
 * API hợp lệ:
 * - Nếu baseURL đã có /api/v1  -> GET /songs?page=1&limit=50
 * - Nếu baseURL chưa có /api/v1 -> GET /api/v1/songs?page=1&limit=50
 */
export default function HomeSuggestedPlaylists({
  title = "Có thể bạn thích",
  limit = 10, // số card hiển thị
  fetchLimit = 50, // số bài tải về để random
  onSelect,
  onPlay,
  onMoreClick,
}) {
  const errorToastedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [rows, setRows] = useState([]);

  // đọc baseURL từ env (KHÔNG yêu cầu bạn đổi .env)
  const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

  const songsPath = useMemo(() => {
    // Nếu baseURL đã chứa /api/v1 thì chỉ gọi "/songs" để tránh /api/v1/api/v1
    const baseHasV1 =
      /\/api\/v1\/?$/.test(baseURL) || baseURL.includes("/api/v1");
    return baseHasV1 ? "/songs" : "/api/v1/songs";
  }, [baseURL]);

  const normalizeSongItem = (song) => {
    const title = song?.title ?? song?.name ?? "Không rõ tên";
    const coverUrl =
      song?.cover_url ?? song?.image_url ?? song?.thumbnail ?? "";

    let subtitle = "";
    if (Array.isArray(song?.artists)) {
      subtitle = song.artists
        .map((a) => a?.name ?? a)
        .filter(Boolean)
        .join(", ");
    } else {
      subtitle =
        song?.artist ??
        song?.artist_name ??
        song?.artists_name ??
        song?.artistNames ??
        "";
    }

    return { ...song, title, subtitle, coverUrl };
  };

  const pickRandom = (arr, n) => {
    const a = Array.isArray(arr) ? [...arr] : [];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  };

  const fetchRandomSongs = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setIsFetching(true);

      const res = await http.get(songsPath, {
        params: { page: 1, limit: fetchLimit },
      });

      const payload = res?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];
      const normalized = list.map(normalizeSongItem);

      setRows(pickRandom(normalized, limit));
      errorToastedRef.current = false;
    } catch (err) {
      console.error("[HomeSuggestedPlaylists] Fetch random songs failed:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        baseURL,
        songsPath,
      });

      if (!errorToastedRef.current) {
        errorToastedRef.current = true;
        toast.error("Tải danh sách gợi ý thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songsPath, limit, fetchLimit]);

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[HomeSuggestedPlaylists] ${logTag}: Missing handler`);
        return;
      }
      fn();
      toast.success(okMsg);
    } catch (e) {
      console.error(`[HomeSuggestedPlaylists] ${logTag} failed:`, e);
      toast.error(failMsg);
    }
  };

  const handleSelect = (song) => {
    const name = song?.title ?? "bài hát";
    safeAction(
      () => onSelect?.(song),
      `Đã chọn: ${name}`,
      `Không thể chọn: ${name}`,
      `Select(${song?.id ?? "no-id"})`
    );
  };

  const handlePlay = (e, song) => {
    e?.stopPropagation?.();
    const name = song?.title ?? "bài hát";
    safeAction(
      () => onPlay?.(song),
      `Đang phát: ${name}`,
      `Không thể phát: ${name}`,
      `Play(${song?.id ?? "no-id"})`
    );
  };

  const handleMore = () => {
    safeAction(
      () => onMoreClick?.(),
      "Đã mở thêm danh sách gợi ý.",
      "Chưa cấu hình hành động Xem thêm.",
      "MoreClick"
    );
  };

  const handleRefresh = async () => {
    await fetchRandomSongs({ silent: true });
    toast.success("Đã làm mới danh sách gợi ý.");
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleRefresh}
            aria-label="Refresh"
            title="Làm mới"
          >
            <RefreshCcw
              className={cn("size-4", isFetching && "animate-spin")}
            />
          </Button>

          <Button
            variant="secondary"
            className="rounded-full"
            onClick={handleMore}
          >
            Xem thêm
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-[120px] w-full rounded-3xl" />
          <Skeleton className="h-[120px] w-full rounded-3xl" />
          <Skeleton className="h-[120px] w-full rounded-3xl" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm opacity-70">Không có bài hát gợi ý.</div>
      ) : (
        <ScrollArea className="w-full">
          <div className="flex w-max gap-4 pb-3 pr-2">
            {rows.map((song, idx) => {
              const id = song?.id ?? `${song?.title}-${idx}`;
              const coverUrl = song?.coverUrl ?? "";

              return (
                <Card
                  key={id}
                  className={cn(
                    "group relative w-[320px] shrink-0 cursor-pointer overflow-hidden rounded-3xl border-border",
                    "bg-card hover:bg-card/80"
                  )}
                  onClick={() => handleSelect(song)}
                  title={song?.title}
                >
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted/30">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={song?.title ?? "cover"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                      )}

                      <Button
                        size="icon"
                        className={cn(
                          "absolute bottom-2 right-2 h-8 w-8 rounded-full",
                          "opacity-0 transition group-hover:opacity-100"
                        )}
                        onClick={(e) => handlePlay(e, song)}
                        aria-label="Play song"
                        title="Phát"
                      >
                        <Play className="size-4" />
                      </Button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs opacity-60">Có thể bạn thích</div>
                      <div className="truncate text-base font-semibold">
                        {song?.title ?? "Untitled"}
                      </div>
                      {song?.subtitle ? (
                        <div className="truncate text-sm opacity-70">
                          {song.subtitle}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </section>
  );
}
