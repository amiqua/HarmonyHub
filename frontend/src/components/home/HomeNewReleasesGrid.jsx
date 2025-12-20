import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Play, RefreshCcw } from "lucide-react";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * HomeNewReleasesGrid
 * - Section "Mới phát hành" dạng grid card album.
 * - API dùng: GET /api/v1/albums (public)
 *
 * Props (optional):
 * - title?: string
 * - limit?: number (default 12)
 * - sort?: string (không đoán sort; chỉ gửi nếu bạn truyền)
 * - items?: Array (nếu bạn muốn truyền sẵn data thì sẽ không gọi API)
 *
 * Actions (mọi action đều toast):
 * - onSelectAlbum?(album): void     // click card
 * - onPlayAlbum?(album): void       // click nút play trên card
 * - onMoreClick?(): void            // click "Xem thêm"
 */
export default function HomeNewReleasesGrid({
  title = "Mới phát hành",
  limit = 12,
  sort,
  items,
  onSelectAlbum,
  onPlayAlbum,
  onMoreClick,
}) {
  const errorToastedRef = useRef(false);

  const shouldFetch = useMemo(
    () => !(Array.isArray(items) && items.length > 0),
    [items]
  );

  const query = useQuery({
    queryKey: ["new-releases-albums", limit, sort],
    enabled: shouldFetch,
    queryFn: async () => {
      try {
        const params = { page: 1, limit };
        if (sort) params.sort = sort;

        // Backend: GET /api/v1/albums
        const res = await http.get("/api/v1/albums", { params });
        const payload = res?.data;

        const data = Array.isArray(payload?.data) ? payload.data : [];
        return data;
      } catch (err) {
        console.error("[HomeNewReleasesGrid] Fetch /api/v1/albums failed:", {
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
          limit,
          sort,
        });
        throw err;
      }
    },
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (query.isError && !errorToastedRef.current) {
      errorToastedRef.current = true;
      toast.error("Tải danh sách album mới thất bại. Vui lòng thử lại.");
    }
  }, [query.isError]);

  const data = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) return items;
    if (Array.isArray(query.data) && query.data.length > 0) return query.data;
    return [];
  }, [items, query.data]);

  const normalizeAlbum = (album) => {
    const title = album?.title ?? album?.name ?? "Không rõ tên";
    const coverUrl =
      album?.cover_url ?? album?.image_url ?? album?.thumbnail ?? "";
    const artist =
      album?.artist ??
      album?.artist_name ??
      album?.artistNames ??
      album?.artists_name ??
      (Array.isArray(album?.artists)
        ? album.artists
            .map((a) => a?.name ?? a)
            .filter(Boolean)
            .join(", ")
        : "");
    return { title, coverUrl, artist };
  };

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[HomeNewReleasesGrid] ${logTag}: Missing handler`);
        return;
      }
      fn();
      toast.success(okMsg);
    } catch (err) {
      console.error(`[HomeNewReleasesGrid] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const handleRefresh = async () => {
    try {
      errorToastedRef.current = false;
      if (!shouldFetch) {
        toast.success("Đang dùng data truyền sẵn (không cần làm mới).");
        return;
      }
      await query.refetch();
      toast.success("Đã làm mới danh sách album mới.");
    } catch (err) {
      console.error("[HomeNewReleasesGrid] Refetch failed:", err);
      toast.error("Làm mới thất bại.");
    }
  };

  const handleSelect = (album) => {
    const { title } = normalizeAlbum(album);
    safeAction(
      () => onSelectAlbum?.(album),
      `Đã mở album: ${title}`,
      `Không thể mở album: ${title}`,
      `SelectAlbum(${album?.id ?? "no-id"})`
    );
  };

  const handlePlay = (e, album) => {
    e?.stopPropagation?.();
    const { title } = normalizeAlbum(album);
    safeAction(
      () => onPlayAlbum?.(album),
      `Đang phát album: ${title}`,
      `Không thể phát album: ${title}`,
      `PlayAlbum(${album?.id ?? "no-id"})`
    );
  };

  const handleMore = () => {
    safeAction(
      () => onMoreClick?.(),
      "Đã mở thêm album mới phát hành.",
      "Chưa cấu hình hành động Xem thêm.",
      "MoreClick"
    );
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
              className={cn("size-4", query.isFetching && "animate-spin")}
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
      {query.isLoading && shouldFetch ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: Math.min(limit, 12) }).map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-3xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-sm opacity-70">
          Không có album mới phát hành.
          {shouldFetch ? " (API trả về rỗng)" : " (đang dùng items truyền sẵn)"}
        </div>
      ) : (
        <ScrollArea className="w-full">
          <div className="grid gap-4 pb-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {data.slice(0, limit).map((album, i) => {
              const { title, coverUrl, artist } = normalizeAlbum(album);
              const key = album?.id ?? `${title}-${i}`;

              return (
                <Card
                  key={key}
                  className={cn(
                    "group cursor-pointer overflow-hidden rounded-3xl border-border",
                    "bg-card hover:bg-card/80"
                  )}
                  onClick={() => handleSelect(album)}
                  title={title}
                >
                  <CardContent className="p-3">
                    {/* Cover */}
                    <div className="relative overflow-hidden rounded-2xl bg-muted/30">
                      <div className="aspect-square w-full">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                        )}
                      </div>

                      {/* Play overlay */}
                      <Button
                        size="icon"
                        className={cn(
                          "absolute bottom-3 right-3 h-9 w-9 rounded-full",
                          "opacity-0 transition group-hover:opacity-100"
                        )}
                        onClick={(e) => handlePlay(e, album)}
                        aria-label="Play album"
                        title="Phát"
                      >
                        <Play className="size-4" />
                      </Button>
                    </div>

                    {/* Text */}
                    <div className="mt-3 min-w-0">
                      <div className="truncate text-base font-semibold">
                        {title}
                      </div>
                      {artist ? (
                        <div className="truncate text-sm opacity-70">
                          {artist}
                        </div>
                      ) : (
                        <div className="truncate text-sm opacity-50">—</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </section>
  );
}
