// FILE: src/components/favorites/FavoritesSongsTable.jsx
// CHÚ THÍCH:
// - Table/list cho trang "Bài hát yêu thích": render header cột + danh sách row.
// - Dùng component con FavoritesSongRow.
// - KHÔNG fetch API. Data truyền từ page/content.
// - Empty state nhẹ (không toast).
// - FIX an toàn: key fallback chắc chắn hơn (tránh undefined/duplicated key nếu thiếu id/title).

import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

import FavoritesSongRow from "@/components/favorites/FavoritesSongRow";

/**
 * Props:
 * - items?: Array<song>
 * - activeSongId?: string|number
 * - onPlaySong?: (song) => void
 * - onToggleLike?: (song) => void
 * - className?: string
 */
export default function FavoritesSongsTable({
  items = [],
  activeSongId,
  onPlaySong,
  onToggleLike,
  className,
}) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/30",
        className
      )}
    >
      {/* Header columns */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs text-muted-foreground md:px-6">
        <div className="col-span-7 md:col-span-6">BÀI HÁT</div>
        <div className="hidden md:col-span-4 md:block">ALBUM</div>
        <div className="col-span-5 md:col-span-2 text-right">THỜI GIAN</div>
      </div>

      <Separator />

      {safeItems.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground md:px-6">
          Chưa có bài hát yêu thích nào.
        </div>
      ) : (
        <div className="px-2 py-2 md:px-3">
          <div className="space-y-1">
            {safeItems.map((song, idx) => {
              const key =
                song?.id ??
                `${song?.title ?? song?.name ?? "song"}-${song?.artist ?? "na"}-${idx}`;

              return (
                <FavoritesSongRow
                  key={key}
                  index={idx + 1}
                  song={song}
                  isActive={activeSongId != null && song?.id === activeSongId}
                  onPlaySong={onPlaySong}
                  onToggleLike={onToggleLike}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
