// FILE: src/components/zingchart/common/SongMoreMenu.jsx
// Menu ba chấm giống mẫu (DropdownMenu chuẩn shadcn)
// - Có header (thumb + title + meta)
// - Align end + side bottom, z-index cao
// - Có callback để bạn nối logic sau
// ✅ Update: "Thêm vào playlist" mặc định sẽ mở AddToPlaylistDialog thông qua event "playlist:addSong"

import { useMemo } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Mic2,
  Ban,
  ListPlus,
  PlayCircle,
  Radio,
  Plus,
  Link2,
  Share2,
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

export default function SongMoreMenu({
  song,
  className,
  align = "end",
  side = "bottom",

  // callbacks optional
  onLyrics,
  onBlock,
  onAddToQueue,
  onPlayNext,
  onPlaySimilar,
  onAddToPlaylist,
  onCopyLink,
  onShare,
}) {
  const n = useMemo(() => {
    const title = song?.title ?? song?.name ?? "Không rõ tên";
    const coverUrl =
      song?.coverUrl ??
      song?.cover_url ??
      song?.image_url ??
      song?.thumbnail ??
      "";

    const plays =
      song?.plays ??
      song?.play_count ??
      song?.listen_count ??
      song?.views ??
      song?.view_count ??
      null;

    const artist =
      song?.artist ??
      song?.artist_name ??
      song?.artists_name ??
      song?.artistNames ??
      (Array.isArray(song?.artists)
        ? song.artists
            .map((a) => a?.name ?? a)
            .filter(Boolean)
            .join(", ")
        : "");

    // link share/copy (nếu backend có field url)
    const link = song?.share_url ?? song?.url ?? song?.audio_url ?? "";

    return { title, coverUrl, plays, artist, link };
  }, [song]);

  const safeCall = (fn, fallbackMsg) => {
    try {
      if (typeof fn !== "function") {
        if (fallbackMsg) toast.success(fallbackMsg);
        return;
      }
      fn(song);
    } catch (e) {
      console.error("[SongMoreMenu] action failed:", e);
      toast.error("Thao tác thất bại.");
    }
  };

  const handleCopy = async () => {
    try {
      const text = n.link || `${n.title}`;
      await navigator.clipboard.writeText(text);
      toast.success("Đã sao chép link.");
      safeCall(onCopyLink);
    } catch (e) {
      console.error("[SongMoreMenu] copy failed:", e);
      toast.error("Không thể sao chép.");
    }
  };

  // ✅ NEW: default hành vi thêm vào playlist
  const handleAddToPlaylist = () => {
    if (!song) return;

    // Nếu component cha có truyền callback thì dùng callback (giữ tương thích)
    if (typeof onAddToPlaylist === "function") {
      return safeCall(onAddToPlaylist);
    }

    // Mặc định: bắn event để AddToPlaylistDialog bắt và mở
    window.dispatchEvent(
      new CustomEvent("playlist:addSong", { detail: { song } })
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 rounded-full", className)}
          aria-label="More"
          title="Khác"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side}
        sideOffset={10}
        collisionPadding={12}
        className={cn(
          "w-[320px] rounded-2xl border-border/60 bg-popover/95 p-2 shadow-xl",
          "backdrop-blur",
          "z-[100]" // để nổi trên chart/table
        )}
      >
        {/* Header giống mẫu */}
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
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

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{n.title}</div>
            <div className="truncate text-xs opacity-70">{n.artist || "—"}</div>
            <div className="mt-0.5 text-[11px] opacity-60">
              {n.plays == null ? "0" : Number(n.plays).toLocaleString()} lượt
              nghe
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Nhóm nút nhanh giống mẫu */}
        <div className="grid grid-cols-2 gap-2 px-1 py-1">
          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2 rounded-xl"
            onClick={() => safeCall(onLyrics, "Lời bài hát (demo).")}
          >
            <Mic2 className="h-4 w-4" /> Lời bài hát
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="justify-start gap-2 rounded-xl"
            onClick={() => safeCall(onBlock, "Chặn (demo).")}
          >
            <Ban className="h-4 w-4" /> Chặn
          </Button>
        </div>

        <DropdownMenuSeparator />

        {/* Các mục menu */}
        <DropdownMenuItem
          className="rounded-xl"
          onClick={() =>
            safeCall(onAddToQueue, "Thêm vào danh sách phát (demo).")
          }
        >
          <ListPlus className="mr-2 h-4 w-4" />
          Thêm vào danh sách phát
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-xl"
          onClick={() => safeCall(onPlayNext, "Phát tiếp theo (demo).")}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Phát tiếp theo
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-xl"
          onClick={() =>
            safeCall(onPlaySimilar, "Phát nội dung tương tự (demo).")
          }
        >
          <Radio className="mr-2 h-4 w-4" />
          Phát nội dung tương tự
        </DropdownMenuItem>

        {/* ✅ SỬA Ở ĐÂY */}
        <DropdownMenuItem className="rounded-xl" onClick={handleAddToPlaylist}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm vào playlist
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="rounded-xl" onClick={handleCopy}>
          <Link2 className="mr-2 h-4 w-4" />
          Sao chép link
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-xl"
          onClick={() => safeCall(onShare, "Chia sẻ (demo).")}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Chia sẻ
        </DropdownMenuItem>

        <div className="px-2 pt-2 text-[11px] opacity-50">
          Cung cấp bởi {song?.provider ?? song?.artist ?? "Melodiaverse"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
