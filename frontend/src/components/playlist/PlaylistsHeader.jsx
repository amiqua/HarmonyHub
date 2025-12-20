// FILE: src/components/playlists/PlaylistsHeader.jsx
// CHÚ THÍCH:
// - Header trang Playlist: tiêu đề lớn "Playlist" + sub label "CỦA TÔI".
// - Có thể nhận props title/subtitle để tái dùng.
// - KHÔNG fetch API.

import { cn } from "@/lib/utils";

/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - rightSlot?: ReactNode (optional)
 * - className?: string
 */
export default function PlaylistsHeader({
  title = "Playlist",
  subtitle = "CỦA TÔI",
  rightSlot,
  className,
}) {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          {title}
        </h1>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>

      <div className="text-xs font-semibold tracking-widest text-muted-foreground">
        {subtitle}
      </div>
    </header>
  );
}
