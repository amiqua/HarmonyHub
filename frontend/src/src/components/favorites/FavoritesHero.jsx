// FILE: src/components/favorites/FavoritesHero.jsx
// CHÚ THÍCH:
// - Hero cho trang "Bài hát yêu thích": cover + nhãn PLAYLIST + tiêu đề lớn + số lượng bài + nút Play.
// - KHÔNG fetch API. Data truyền từ FavoritesPageContent.
// - Nút Play gọi onPlayAll(items) hoặc fallback onPlaySong(items[0]).

import { useMemo } from "react";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - title?: string
 * - coverUrl?: string
 * - count?: number
 * - items?: Array<song>
 * - onPlayAll?: (items) => void
 * - onPlaySong?: (song) => void
 * - className?: string
 */
export default function FavoritesHero({
  title = "Bài hát yêu thích",
  coverUrl = "",
  count,
  items = [],
  onPlayAll,
  onPlaySong,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  const safeCount = useMemo(() => {
    if (typeof count === "number") return count;
    return safeItems.length;
  }, [count, safeItems.length]);

  const handlePlay = () => {
    if (typeof onPlayAll === "function") {
      onPlayAll(safeItems);
      return;
    }
    if (typeof onPlaySong === "function" && safeItems[0]) {
      onPlaySong(safeItems[0]);
    }
  };

  return (
    <section
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-center",
        className
      )}
    >
      {/* Cover */}
      <div className="w-full max-w-[280px] overflow-hidden rounded-2xl bg-muted/40 md:w-[280px]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="cover"
            className="h-[280px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
            Cover
          </div>
        )}
      </div>

      {/* Text */}
      <div className="min-w-0">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">
          PLAYLIST
        </div>

        <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-6xl">
          {title}
        </h1>

        <div className="mt-3 text-sm text-muted-foreground">
          {safeCount} bài hát
        </div>

        <div className="mt-5">
          <Button
            onClick={handlePlay}
            className="h-11 rounded-full px-6"
            disabled={safeItems.length === 0}
            title={safeItems.length === 0 ? "Chưa có bài hát để phát" : "Phát"}
          >
            <Play className="mr-2 size-4" />
            Play
          </Button>
        </div>
      </div>
    </section>
  );
}
