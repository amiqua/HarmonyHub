// FILE: src/components/favorites/FavoritesSongRow.jsx
// CHÚ THÍCH:
// - 1 row (1 bài hát) cho trang "Bài hát yêu thích".
// - KHÔNG fetch API, chỉ nhận data qua props.
// - Không toast để tránh spam; parent tự xử lý nếu cần.
// - Thiết kế theo layout giống ảnh: STT + bài hát + album + (tim) + thời lượng + lượt nghe.

import { cn } from "@/lib/utils";
import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @typedef {Object} FavoriteSong
 * @property {string|number} id
 * @property {string} title
 * @property {string} artist
 * @property {string} [album]
 * @property {string|number} [duration]   // "3:30" hoặc seconds
 * @property {number} [plays]             // lượt nghe
 * @property {string} [coverUrl]
 * @property {boolean} [liked]
 */

/**
 * Props:
 * - index: number (1-based)
 * - song: FavoriteSong
 * - isActive?: boolean (đang phát)
 * - onPlaySong?: (song) => void
 * - onToggleLike?: (song) => void
 * - className?: string
 */
export default function FavoritesSongRow({
  index,
  song,
  isActive = false,
  onPlaySong,
  onToggleLike,
  className,
}) {
  const s = song ?? {};

  const formatDuration = (d) => {
    if (d == null) return "";
    if (typeof d === "string") return d;
    const sec = Number(d);
    if (!Number.isFinite(sec)) return "";
    const mm = Math.floor(sec / 60);
    const ss = Math.floor(sec % 60);
    return `${mm}:${String(ss).padStart(2, "0")}`;
  };

  const formatPlays = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "";
    return v.toLocaleString("en-US");
  };

  return (
    <div
      className={cn(
        "group grid grid-cols-12 items-center gap-3 rounded-xl px-3 py-2 transition",
        "hover:bg-accent/40",
        isActive && "bg-accent/40",
        className
      )}
    >
      {/* STT */}
      <div className="col-span-1 min-w-0 text-center">
        <span
          className={cn(
            "text-lg font-semibold tabular-nums",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          {index}
        </span>
      </div>

      {/* Bài hát (cover + title/artist) */}
      <div className="col-span-6 flex min-w-0 items-center gap-3 md:col-span-5">
        <button
          type="button"
          onClick={() => onPlaySong?.(s)}
          className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted"
          title="Phát"
        >
          {s.coverUrl ? (
            <img
              src={s.coverUrl}
              alt={s.title || "cover"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}

          {/* overlay play on hover */}
          <div
            className={cn(
              "absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition",
              "group-hover:opacity-100"
            )}
          >
            <Play className="size-5 text-white" />
          </div>
        </button>

        <div className="min-w-0">
          <div
            className={cn(
              "truncate text-sm font-semibold",
              isActive ? "text-primary" : "text-foreground"
            )}
          >
            {s.title || "Untitled"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {s.artist || "Unknown artist"}
          </div>
        </div>
      </div>

      {/* Album */}
      <div className="col-span-0 hidden min-w-0 text-sm text-muted-foreground md:col-span-4 md:block">
        <div className="truncate">{s.album || ""}</div>
      </div>

      {/* Right controls */}
      <div className="col-span-5 flex items-center justify-end gap-3 md:col-span-2">
        {/* Like */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-full",
            s.liked ? "text-purple-400" : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike?.(s);
          }}
          title={s.liked ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart className={cn("size-4", s.liked && "fill-current")} />
        </Button>

        {/* Duration */}
        <div className="w-[52px] text-right text-xs text-muted-foreground tabular-nums">
          {formatDuration(s.duration)}
        </div>

        {/* Plays */}
        <div className="hidden w-[86px] text-right text-xs text-muted-foreground tabular-nums lg:block">
          {formatPlays(s.plays)}
        </div>
      </div>
    </div>
  );
}
