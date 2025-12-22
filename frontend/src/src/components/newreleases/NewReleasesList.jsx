// FILE: src/components/newreleases/NewReleasesList.jsx
// CHÚ THÍCH:
// - List/table cho trang "BXH Nhạc Mới": render header cột + danh sách NewReleasesRow.
// - KHÔNG fetch API. Data truyền từ page/content.
// - Có empty state nhẹ, không toast.
// - Reuse NewReleasesRow để đồng bộ UI/logic action.

import { cn } from "@/lib/utils";
import NewReleasesRow from "@/components/newreleases/NewReleasesRow";
import { Separator } from "@/components/ui/separator";

/**
 * Props:
 * - items?: Array<song>
 * - activeSongId?: string|number
 * - onPlaySong?: (song) => void
 * - onToggleLike?: (song) => void
 * - onOpenLyrics?: (song) => void
 * - onAddToPlaylist?: (song) => void
 * - onShare?: (song) => void
 * - className?: string
 *
 * Note:
 * - Nếu item có rank/delta riêng: { ...song, rank, delta }
 *   còn không, rank sẽ lấy theo index + 1, delta mặc định 0.
 */
export default function NewReleasesList({
  items = [],
  activeSongId,
  onPlaySong,
  onToggleLike,
  onOpenLyrics,
  onAddToPlaylist,
  onShare,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-card/30",
        className
      )}
    >
      {/* Header columns */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs text-muted-foreground md:px-6">
        <div className="col-span-2 md:col-span-1">HẠNG</div>
        <div className="col-span-6 md:col-span-5">BÀI HÁT</div>
        <div className="hidden md:col-span-4 md:block">ALBUM</div>
        <div className="col-span-4 md:col-span-2 text-right">THỜI GIAN</div>
      </div>

      <Separator />

      {safeItems.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground md:px-6">
          Chưa có dữ liệu BXH nhạc mới.
        </div>
      ) : (
        <div className="px-2 py-2 md:px-3">
          <div className="space-y-1">
            {safeItems.map((song, idx) => {
              const rank = Number.isFinite(song?.rank) ? song.rank : idx + 1;
              const delta = Number.isFinite(song?.delta) ? song.delta : 0;

              return (
                <NewReleasesRow
                  key={song?.id ?? `${song?.title}-${idx}`}
                  song={song}
                  rank={rank}
                  delta={delta}
                  isActive={activeSongId != null && song?.id === activeSongId}
                  onPlaySong={onPlaySong}
                  onToggleLike={onToggleLike}
                  onOpenLyrics={onOpenLyrics}
                  onAddToPlaylist={onAddToPlaylist}
                  onShare={onShare}
                />
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
