// FILE: src/components/playlists/PlaylistCard.jsx
// CHÚ THÍCH:
// - Card hiển thị 1 playlist trong grid (ảnh cover + title + mô tả/số bài).
// - KHÔNG fetch API. Nhận playlist qua props.
// - Click card gọi onOpen().

import { cn } from "@/lib/utils";

/**
 * Playlist shape (gợi ý):
 * - { id, title, coverUrl?, description?, songsCount? }
 *
 * Props:
 * - playlist: object
 * - onOpen?: () => void
 * - className?: string
 */
export default function PlaylistCard({ playlist, onOpen, className }) {
  const p = playlist ?? {};
  const title = p.title ?? "Untitled Playlist";
  const desc =
    p.description ??
    (typeof p.songsCount === "number" ? `${p.songsCount} bài hát` : "");

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group w-64 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className
      )}
      aria-label={`Mở playlist ${title}`}
    >
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/20 transition group-hover:bg-card/30">
        <div className="aspect-square w-full bg-muted/30">
          {p.coverUrl ? (
            <img
              src={p.coverUrl}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Cover
            </div>
          )}
        </div>

        <div className="space-y-1 p-3">
          <div className="truncate text-sm font-semibold">{title}</div>
          {desc ? (
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {desc}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground"> </div>
          )}
        </div>
      </div>
    </button>
  );
}
