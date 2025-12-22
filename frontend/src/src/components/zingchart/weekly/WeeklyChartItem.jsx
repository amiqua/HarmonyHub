// FILE: src/components/zingchart/weekly/WeeklyChartItem.jsx
// CHÚ THÍCH:
// Dòng item trong card "Bảng Xếp Hạng Tuần".
// - Nhận `song` + `onPlay(song)`
// - Click cả dòng để phát
// - Có nút play riêng bên phải
// - Tự normalize field để không phụ thuộc cứng vào backend

import { useMemo } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

export default function WeeklyChartItem({ song, onPlay, className }) {
  const n = useMemo(() => {
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

    const coverUrl =
      song?.coverUrl ??
      song?.cover_url ??
      song?.image_url ??
      song?.thumbnail ??
      "";

    // duration có thể là seconds hoặc string "m:ss"
    const rawDur =
      song?.duration ?? song?.duration_seconds ?? song?.length ?? null;

    const durationText = (() => {
      if (rawDur == null) return "--:--";
      if (typeof rawDur === "string") return rawDur;

      const total = Number(rawDur);
      if (!Number.isFinite(total) || total < 0) return "--:--";
      const m = Math.floor(total / 60);
      const s = Math.floor(total % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    })();

    const rank = Number(song?.rank);
    const rankText = Number.isFinite(rank) && rank > 0 ? String(rank) : "";

    return {
      title,
      artist,
      coverUrl,
      durationText,
      rankText,
    };
  }, [song]);

  const safePlay = (e) => {
    e?.stopPropagation?.();

    try {
      if (typeof onPlay !== "function") {
        toast.error("Chưa cấu hình phát bài hát.");
        console.error("[WeeklyChartItem] Missing onPlay handler.", { song });
        return;
      }
      onPlay(song);
      toast.success(`Đang phát: ${n.title}`);
    } catch (err) {
      console.error("[WeeklyChartItem] onPlay failed:", err);
      toast.error("Phát bài hát thất bại.");
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2",
        "cursor-pointer hover:bg-accent/30",
        className
      )}
      onClick={safePlay}
      title={n.title}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") safePlay(e);
      }}
    >
      {/* Rank */}
      <div className="w-6 shrink-0 text-center text-sm font-semibold opacity-80">
        {n.rankText || ""}
      </div>

      {/* Cover */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted/30">
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

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{n.title}</div>
        <div className="truncate text-xs opacity-70">{n.artist || "—"}</div>
      </div>

      {/* Duration */}
      <div className="shrink-0 text-xs opacity-70">{n.durationText}</div>

      {/* Play button */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          "h-8 w-8 rounded-full",
          "opacity-0 transition group-hover:opacity-100"
        )}
        onClick={safePlay}
        aria-label="Play"
        title="Phát"
      >
        <Play className="h-4 w-4" />
      </Button>
    </div>
  );
}
