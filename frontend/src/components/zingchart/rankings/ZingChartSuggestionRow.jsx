// FILE: src/components/zingchart/rankings/ZingChartSuggestionRow.jsx
// CHÚ THÍCH: Render dòng “Gợi ý” ngay dưới biểu đồ trong trang #zingchart.
// - Nhận `suggestions` (mảng) từ ZingChartPageContent, KHÔNG fetch tại đây.
// - UI hiển thị 1 bài gợi ý đầu tiên (giống ảnh), có hover actions (lyrics/like/more).
// - onPlaySong(song): phát bài (callback từ cha).
// - onRequireLogin(): gọi khi user bấm hành động cần đăng nhập mà chưa có accessToken.

import { useMemo } from "react";
import { toast } from "sonner";
import { Mic2, Heart, ListPlus } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

// ✅ Menu ba chấm giống mẫu
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

export default function ZingChartSuggestionRow({
  suggestions = [],
  onPlaySong,
  onRequireLogin,
  className,
}) {
  const song = useMemo(() => {
    const arr = Array.isArray(suggestions) ? suggestions : [];
    return arr[0] || null;
  }, [suggestions]);

  // ✅ token có thể thay đổi sau khi login => nên đọc mỗi lần render
  const hasToken = Boolean(localStorage.getItem("accessToken"));

  if (!song) return null;

  const title = song?.title ?? song?.name ?? "Không rõ tên";
  const artist = song?.artist ?? song?.artists ?? "";
  const album = song?.album ?? song?.album_title ?? "";
  const duration = formatDuration(song?.duration);

  const cover =
    song?.cover_url ||
    song?.thumbnail_url ||
    song?.image_url ||
    song?.artwork_url ||
    "";

  const requireLoginIfNeeded = (actionName) => {
    if (hasToken) return true;
    toast.error(`Bạn cần đăng nhập để dùng "${actionName}".`);
    onRequireLogin?.();
    return false;
  };

  const handlePlay = () => {
    try {
      onPlaySong?.(song);
      toast.success(`Phát: ${title}`);
    } catch (err) {
      console.error("[ZingChartSuggestionRow] onPlaySong failed:", err);
      toast.error("Không thể phát bài hát.");
    }
  };

  return (
    <div className={cn("px-4 py-4 md:px-6", className)}>
      <div className="mb-3 text-sm text-muted-foreground">Gợi ý</div>

      <div
        className={cn(
          "group grid grid-cols-12 items-center gap-3 rounded-xl px-3 py-3",
          "hover:bg-accent/40 transition"
        )}
      >
        {/* SONG col */}
        <div className="col-span-7 flex items-center gap-3 md:col-span-6">
          {/* Cover + play */}
          <button
            type="button"
            className={cn(
              "relative h-12 w-12 overflow-hidden rounded-lg",
              "bg-muted/40 shrink-0"
            )}
            onClick={handlePlay}
            aria-label="Play suggestion"
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

        {/* ALBUM col */}
        <div className="hidden min-w-0 md:col-span-4 md:block">
          <div className="truncate text-sm text-muted-foreground">
            {album || "—"}
          </div>
        </div>

        {/* TIME + ACTIONS col */}
        <div className="col-span-5 flex items-center justify-end gap-2 md:col-span-2">
          {/* Actions (hover) - FIX: không dùng hidden để Radix lấy đúng vị trí anchor */}
          <div
            className={cn(
              "flex items-center gap-1",
              "opacity-0 pointer-events-none",
              "group-hover:opacity-100 group-hover:pointer-events-auto",
              "transition-opacity"
            )}
          >
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
              song={song}
              align="end"
              side="bottom"
              onLyrics={() => toast.message("TODO: Lời bài hát (UI sau).")}
              onBlock={() => toast.message("TODO: Chặn (API sau).")}
              onAddToQueue={() => {
                if (!requireLoginIfNeeded("Thêm vào danh sách phát")) return;
                toast.message("TODO: Thêm vào danh sách phát.");
              }}
              onPlayNext={() => toast.message("TODO: Phát tiếp theo.")}
              onPlaySimilar={() =>
                toast.message("TODO: Phát nội dung tương tự.")
              }
              onAddToPlaylist={() => {
                if (!requireLoginIfNeeded("Thêm vào playlist")) return;
                toast.message("TODO: Thêm vào playlist (UI/Modal sau).");
              }}
              onShare={() => toast.message("TODO: Chia sẻ.")}
            />
          </div>

          {/* Duration */}
          <div className="min-w-[44px] text-right text-xs text-muted-foreground">
            {duration || "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
