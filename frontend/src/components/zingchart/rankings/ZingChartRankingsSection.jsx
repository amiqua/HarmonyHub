// FILE: src/components/zingchart/rankings/ZingChartRankingsSection.jsx
// CHÚ THÍCH:
// Section render phần xếp hạng dưới biểu đồ (#zingchart).
// - Bản cập nhật để tương thích Row/List mới (highlight optional) và tránh phát sinh lỗi:
//   1) Truyền currentSongId + isPlaying xuống ZingChartRankList (nếu có).
//   2) Không thay đổi logic dữ liệu: suggestions/items vẫn nhận từ parent.
// - KHÔNG fetch API tại đây.

import { cn } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";

import ZingChartSuggestionRow from "@/components/zingchart/rankings/ZingChartSuggestionRow";
import ZingChartRankList from "@/components/zingchart/rankings/ZingChartRankList";

/**
 * Props:
 * - suggestions?: Array<{ id, title, artist, album, duration }>
 * - items?: Array<{ id, rank, delta, title, artist, album, duration }>
 * - onPlaySong?: (song) => void
 * - onRequireLogin?: () => void
 * - currentSongId?: string|number (optional)
 * - isPlaying?: boolean (optional)
 * - className?: string
 */
export default function ZingChartRankingsSection({
  suggestions = [],
  items = [],
  onPlaySong,
  onRequireLogin,
  currentSongId,
  isPlaying = false,
  className,
}) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
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
        <div className="col-span-7 md:col-span-6">BÀI HÁT</div>
        <div className="hidden md:col-span-4 md:block">ALBUM</div>
        <div className="col-span-5 md:col-span-2 text-right">THỜI GIAN</div>
      </div>

      <Separator />

      {/* Suggestion row */}
      <ZingChartSuggestionRow
        suggestions={safeSuggestions}
        onPlaySong={onPlaySong}
      />

      {safeSuggestions.length > 0 ? <Separator /> : null}

      {/* Rank list */}
      <ZingChartRankList
        items={safeItems}
        onPlaySong={onPlaySong}
        onRequireLogin={onRequireLogin}
        currentSongId={currentSongId}
        isPlaying={isPlaying}
      />
    </section>
  );
}
