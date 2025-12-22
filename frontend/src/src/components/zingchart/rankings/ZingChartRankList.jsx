// FILE: src/components/zingchart/rankings/ZingChartRankList.jsx
// CHÚ THÍCH:
// Danh sách các dòng xếp hạng (#1, #2, ...).
// - Bản cập nhật để TỐI ƯU và TRÁNH LỖI:
//   1) Không dùng Math.random() làm key (giảm re-render lạ).
//   2) Truyền BOTH props (song + item) xuống ZingChartRankRow để tương thích nếu bạn đang dùng bản Row cũ/mới.
//   3) Hỗ trợ highlight bài đang phát qua currentSongId + isPlaying (optional, không truyền vẫn chạy bình thường).
// - KHÔNG fetch API ở đây.

import { cn } from "@/lib/utils";
import ZingChartRankRow from "@/components/zingchart/rankings/ZingChartRankRow";

/**
 * Props:
 * - items?: Array<{ id, rank, delta, title, artist, album, duration }>
 * - onPlaySong?: (song) => void
 * - onRequireLogin?: () => void
 * - currentSongId?: string|number (optional)
 * - isPlaying?: boolean (optional)
 * - className?: string
 */
export default function ZingChartRankList({
  items = [],
  onPlaySong,
  onRequireLogin,
  currentSongId,
  isPlaying = false,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div
        className={cn(
          "px-4 py-8 text-center text-sm text-muted-foreground md:px-6",
          className
        )}
      >
        Chưa có dữ liệu xếp hạng.
      </div>
    );
  }

  return (
    <div className={cn("px-2 py-2 md:px-3", className)}>
      <div className="space-y-1">
        {safeItems.map((song, index) => {
          const key = song?.id ?? `${song?.title ?? "song"}-${index}`;
          const active =
            currentSongId != null && song?.id != null
              ? String(song.id) === String(currentSongId)
              : false;

          return (
            <ZingChartRankRow
              key={key}
              // ✅ tương thích cả 2 kiểu prop (song / item)
              song={song}
              item={song}
              // ✅ highlight optional
              isActive={active}
              isPlaying={Boolean(isPlaying && active)}
              onPlaySong={onPlaySong}
              onRequireLogin={onRequireLogin}
            />
          );
        })}
      </div>
    </div>
  );
}
