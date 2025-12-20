// FILE: src/components/history/HistoryPlaylistCard.jsx
// CHÚ THÍCH: Card hiển thị 1 playlist trong lưới "Phát gần đây" (tab PLAYLIST).
// - Chỉ lo UI + click handlers (open/play).
// - Không fetch API ở đây.

import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export default function HistoryPlaylistCard({
  item,
  onOpen,
  onPlay,
  className,
}) {
  const title = item?.title ?? "Không rõ tên";
  const subtitle = item?.subtitle ?? "";
  const coverUrl = item?.coverUrl ?? item?.cover ?? "";

  return (
    <button
      type="button"
      onClick={() => onOpen?.(item)}
      className={cn(
        "group w-full text-left",
        "rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
      aria-label={`Open playlist ${title}`}
      title={title}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/20">
        <div className="aspect-square w-full">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/20 text-sm text-muted-foreground">
              No cover
            </div>
          )}
        </div>

        {/* hover play button */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(item);
              }}
              className={cn(
                "inline-flex items-center justify-center",
                "h-12 w-12 rounded-full bg-purple-600/90 text-white shadow-lg",
                "hover:bg-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              )}
              aria-label={`Play playlist ${title}`}
              title="Phát"
            >
              <Play className="ml-0.5 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-0.5 px-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        {subtitle ? (
          <div className="truncate text-xs text-muted-foreground">
            {subtitle}
          </div>
        ) : null}
      </div>
    </button>
  );
}
