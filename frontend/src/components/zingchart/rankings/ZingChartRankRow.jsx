// FILE: src/components/zingchart/rankings/ZingChartRankRow.jsx
// CHÚ THÍCH: 1 dòng trong danh sách xếp hạng (Top) của trang #zingchart.
// - Nhận `item` từ ZingChartRankList (data do ZingChartPageContent fetch).
// - Hiển thị: rank + delta + cover + title/artist + album + duration + action buttons (hover).
// - Action cần login (like/add playlist...) sẽ kiểm tra accessToken, thiếu thì gọi onRequireLogin().
// - KHÔNG fetch API tại đây để tránh phát sinh vấn đề.

import { useMemo } from "react";
import { toast } from "sonner";

import {
  ChevronUp,
  ChevronDown,
  Minus,
  Mic2,
  Heart,
  ListPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import SongMoreMenu from "@/components/zingchart/common/SongMoreMenu";

function formatDuration(d) {
  if (d == null) return "";
  if (typeof d === "string") return d;

  const n = Number(d);
  if (!Number.isFinite(n) || n <= 0) return "";

  const mm = Math.floor(n / 60);
  const ss = Math.floor(n % 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function DeltaBadge({ delta }) {
  const n = Number(delta);

  if (!Number.isFinite(n) || n === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        <span>—</span>
      </div>
    );
  }

  if (n > 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-emerald-400">
        <ChevronUp className="h-3.5 w-3.5" />
        <span>{n}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-red-400">
      <ChevronDown className="h-3.5 w-3.5" />
      <span>{Math.abs(n)}</span>
    </div>
  );
}

/**
 * Props:
 * - item: { id, rank, delta, title, artist, album, duration, cover_url? }
 * - onPlaySong?: (song) => void
 * - onRequireLogin?: () => void
 * - className?: string
 */
export default function ZingChartRankRow({
  item,
  onPlaySong,
  onRequireLogin,
  className,
}) {
  const hasToken = useMemo(
    () => Boolean(localStorage.getItem("accessToken")),
    []
  );

  const title = item?.title ?? item?.name ?? "Không rõ tên";
  const artist = item?.artist ?? item?.artists ?? "";
  const album = item?.album ?? item?.album_title ?? "";
  const duration = formatDuration(item?.duration);
  const rank = item?.rank ?? "";
  const delta = item?.delta;

  const cover =
    item?.cover_url ||
    item?.thumbnail_url ||
    item?.image_url ||
    item?.artwork_url ||
    "";

  const requireLoginIfNeeded = (actionName) => {
    if (hasToken) return true;
    toast.error(`Bạn cần đăng nhập để dùng "${actionName}".`);
    onRequireLogin?.();
    return false;
  };

  const handlePlay = () => {
    try {
      onPlaySong?.(item);
      toast.success(`Phát: ${title}`);
    } catch (err) {
      console.error("[ZingChartRankRow] onPlaySong failed:", err);
      toast.error("Không thể phát bài hát.");
    }
  };

  return (
    <div
      className={cn(
        "group grid grid-cols-12 items-center gap-3 rounded-xl px-3 py-3",
        "hover:bg-accent/40 transition",
        className
      )}
    >
      {/* Rank + delta */}
      <div className="col-span-2 flex items-center gap-3">
        <div
          className={cn(
            "w-10 text-center text-3xl font-extrabold leading-none",
            rank === 1
              ? "text-red-300"
              : rank === 2
                ? "text-emerald-300"
                : rank === 3
                  ? "text-blue-300"
                  : "text-muted-foreground"
          )}
        >
          {rank}
        </div>
        <DeltaBadge delta={delta} />
      </div>

      {/* Song */}
      <div className="col-span-5 flex items-center gap-3 md:col-span-4">
        <button
          type="button"
          className={cn(
            "relative h-12 w-12 overflow-hidden rounded-lg shrink-0",
            "bg-muted/40"
          )}
          onClick={handlePlay}
          aria-label="Play"
          title="Phát"
        >
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted to-muted/40" />
          )}
          <div className="absolute inset-0 hidden items-center justify-center bg-black/35 group-hover:flex">
            <div className="h-8 w-8 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <div className="ml-[2px] h-0 w-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-white/90" />
            </div>
          </div>
        </button>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{title}</div>
          {artist ? (
            <div className="truncate text-xs text-muted-foreground">
              {Array.isArray(artist) ? artist.join(", ") : artist}
            </div>
          ) : null}
        </div>
      </div>

      {/* Album */}
      <div className="hidden min-w-0 md:col-span-4 md:block">
        <div className="truncate text-sm text-muted-foreground">
          {album || "—"}
        </div>
      </div>

      {/* Actions + duration */}
      <div className="col-span-5 flex items-center justify-end gap-2 md:col-span-2">
        {/* Hover actions (giống ảnh: mic/heart/more...) */}
        <div className="hidden items-center gap-1 group-hover:flex">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => {
              if (!requireLoginIfNeeded("Thêm vào playlist")) return;
              toast.message("TODO: Thêm vào playlist (UI/Modal sau).");
            }}
            aria-label="Add to playlist"
            title="Thêm vào playlist"
          >
            <ListPlus className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => toast.message("TODO: Lời bài hát (UI sau).")}
            aria-label="Lyrics"
            title="Lời bài hát"
          >
            <Mic2 className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full"
            onClick={() => {
              if (!requireLoginIfNeeded("Yêu thích")) return;
              toast.success("TODO: Đã thêm vào yêu thích (API sau).");
            }}
            aria-label="Like"
            title="Yêu thích"
          >
            <Heart className="h-4 w-4" />
          </Button>

          <SongMoreMenu
            song={item}
            align="end"
            side="bottom"
            className="h-9 w-9 rounded-full"
            onLyrics={() => toast.message("TODO: Lời bài hát (UI sau).")}
            onBlock={() => toast.message("TODO: Chặn (UI/API sau).")}
            onAddToQueue={() => toast.message("TODO: Thêm vào danh sách phát.")}
            onPlayNext={() => toast.message("TODO: Phát tiếp theo.")}
            onPlaySimilar={() => toast.message("TODO: Phát nội dung tương tự.")}
            onAddToPlaylist={() => {
              if (!requireLoginIfNeeded("Thêm vào playlist")) return;
              toast.message("TODO: Thêm vào playlist (UI/Modal sau).");
            }}
            onShare={() => toast.message("TODO: Chia sẻ.")}
          />
        </div>

        <div className="min-w-[44px] text-right text-xs text-muted-foreground">
          {duration || "—"}
        </div>
      </div>
    </div>
  );
}
