// FILE: src/components/newreleases/NewReleasesRow.jsx
// CHÚ THÍCH:
// - Row cho trang "BXH Nhạc Mới" (new releases chart).
// - Hiển thị: hạng, tăng/giảm (delta), cover + title/artist, album, duration + action (mic/like/more).
// - KHÔNG fetch API. Data truyền từ page/content.
// - Tự toast/console ở mức row (tránh toast bị lặp ở list/page).

import { useMemo } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Heart,
  Minus,
  MoreHorizontal,
  Mic2,
  Play,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Props:
 * - song: { id, title, artist, artists?, album, duration, coverUrl?, liked? }
 * - rank?: number
 * - delta?: number (ví dụ: +1/-1/0)
 * - isActive?: boolean
 * - onPlaySong?: (song) => void
 * - onToggleLike?: (song) => void
 * - onOpenLyrics?: (song) => void
 * - onAddToPlaylist?: (song) => void
 * - onShare?: (song) => void
 * - className?: string
 */
export default function NewReleasesRow({
  song,
  rank,
  delta,
  isActive,
  onPlaySong,
  onToggleLike,
  onOpenLyrics,
  onAddToPlaylist,
  onShare,
  className,
}) {
  const safeSong = song ?? {};

  const title = safeSong?.title ?? "Unknown";
  const artistText = useMemo(() => {
    if (typeof safeSong?.artist === "string" && safeSong.artist.trim())
      return safeSong.artist;
    if (Array.isArray(safeSong?.artists) && safeSong.artists.length)
      return safeSong.artists.filter(Boolean).join(", ");
    return "Unknown artist";
  }, [safeSong]);

  const albumText = safeSong?.album ?? "";

  const durationText = useMemo(() => {
    const d = safeSong?.duration;
    if (typeof d === "string" && d.trim()) return d;
    if (typeof d === "number" && Number.isFinite(d)) {
      const m = Math.floor(d / 60);
      const s = Math.max(0, Math.floor(d % 60));
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    return "--:--";
  }, [safeSong]);

  const coverUrl =
    safeSong?.coverUrl ||
    safeSong?.thumbnail ||
    safeSong?.image ||
    safeSong?.cover ||
    "";

  const liked = Boolean(safeSong?.liked);

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[NewReleasesRow] ${logTag}: Missing handler`);
        return;
      }
      fn(safeSong);
      if (okMsg) toast.success(okMsg);
    } catch (err) {
      console.error(`[NewReleasesRow] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const deltaNode = useMemo(() => {
    const v = Number(delta);
    if (!Number.isFinite(v) || v === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Minus className="size-3" />
        </span>
      );
    }
    if (v > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
          <ArrowUp className="size-3" />
          {Math.abs(v)}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-rose-300">
        <ArrowDown className="size-3" />
        {Math.abs(v)}
      </span>
    );
  }, [delta]);

  const rankClass = useMemo(() => {
    if (rank === 1) return "text-red-300";
    if (rank === 2) return "text-emerald-300";
    if (rank === 3) return "text-sky-300";
    return "text-muted-foreground";
  }, [rank]);

  return (
    <div
      className={cn(
        "group rounded-xl px-2 py-2 transition-colors hover:bg-muted/30 md:px-3",
        isActive && "bg-muted/40",
        className
      )}
    >
      <div className="grid grid-cols-12 items-center gap-3">
        {/* Rank + delta */}
        <div className="col-span-2 flex items-center gap-2 md:col-span-1">
          <div
            className={cn("w-7 text-center text-2xl font-extrabold", rankClass)}
          >
            {rank ?? "-"}
          </div>
          <div className="min-w-[28px]">{deltaNode}</div>
        </div>

        {/* Song */}
        <div className="col-span-6 flex min-w-0 items-center gap-3 md:col-span-5">
          <button
            type="button"
            className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted"
            onClick={() =>
              safeAction(
                onPlaySong,
                `Phát: ${title}`,
                "Không thể phát bài hát.",
                "PlaySong"
              )
            }
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : null}

            {/* Hover play overlay */}
            <div className="absolute inset-0 hidden items-center justify-center bg-black/45 group-hover:flex">
              <Play className="size-5 text-white" />
            </div>
          </button>

          <div className="min-w-0">
            <div className="truncate font-semibold">{title}</div>
            <div className="truncate text-sm text-muted-foreground">
              {artistText}
            </div>
          </div>
        </div>

        {/* Album (md+) */}
        <div className="col-span-0 hidden min-w-0 md:col-span-4 md:block">
          <div className="truncate text-sm text-muted-foreground">
            {albumText}
          </div>
        </div>

        {/* Duration + actions */}
        <div className="col-span-4 flex items-center justify-end gap-1 md:col-span-2">
          <div className="mr-2 text-sm text-muted-foreground">
            {durationText}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden rounded-full md:inline-flex"
            onClick={() =>
              safeAction(
                onOpenLyrics,
                "Mở lời bài hát.",
                "Chưa cấu hình mở lời bài hát.",
                "OpenLyrics"
              )
            }
            aria-label="Lyrics"
          >
            <Mic2 className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "hidden rounded-full md:inline-flex",
              liked && "text-purple-300"
            )}
            onClick={() =>
              safeAction(
                onToggleLike,
                liked ? "Đã bỏ yêu thích." : "Đã thêm vào yêu thích.",
                "Không thể cập nhật yêu thích.",
                "ToggleLike"
              )
            }
            aria-label="Like"
          >
            <Heart className={cn("size-4", liked && "fill-current")} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="More"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() =>
                  safeAction(
                    onAddToPlaylist,
                    "Đã chọn thêm vào playlist.",
                    "Chưa cấu hình thêm vào playlist.",
                    "AddToPlaylist"
                  )
                }
              >
                Thêm vào danh sách phát
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  safeAction(
                    onPlaySong,
                    `Phát: ${title}`,
                    "Không thể phát bài hát.",
                    "PlayFromMenu"
                  )
                }
              >
                Phát ngay
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={async () => {
                  const url = safeSong?.link || safeSong?.url || "";
                  if (!url) {
                    toast.error("Không có link để sao chép.");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success("Đã sao chép link.");
                  } catch (e) {
                    console.error("[NewReleasesRow] CopyLink failed:", e);
                    toast.error("Không thể sao chép link.");
                  }
                }}
              >
                Sao chép link
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  safeAction(
                    onShare,
                    "Đã mở chia sẻ.",
                    "Chưa cấu hình chia sẻ.",
                    "Share"
                  )
                }
              >
                Chia sẻ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
