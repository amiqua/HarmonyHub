// FILE: src/components/zingchart/weekly/WeeklyChartsGrid.jsx
// CHÚ THÍCH: Component con render lưới 3 cột cho "Bảng Xếp Hạng Tuần" (VN / US-UK / K-Pop).
// - Nhận data qua props, KHÔNG fetch API.
// - Dùng WeeklyChartCard (đã tạo) để render từng card.
// - Nếu charts rỗng thì hiển thị empty state.

import { cn } from "@/lib/utils";

import WeeklyChartCard from "@/components/zingchart/weekly/WeeklyChartCard";

/**
 * Props:
 * - charts?: Array<{
 *    regionKey: string,
 *    title: string,
 *    items: Array<{ id, rank, delta, title, artist, duration }>
 * }>
 * - onPlayItem?: (song) => void
 * - onViewAll?: (chart) => void
 * - className?: string
 */
export default function WeeklyChartsGrid({
  charts = [],
  onPlayItem,
  onViewAll,
  className,
}) {
  const safeCharts = Array.isArray(charts) ? charts : [];

  if (safeCharts.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/30 p-6 text-sm text-muted-foreground",
          className
        )}
      >
        Chưa có dữ liệu bảng xếp hạng tuần.
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-3", className)}>
      {safeCharts.map((chart) => (
        <WeeklyChartCard
          key={chart?.regionKey ?? `weekly-${Math.random()}`}
          chart={chart}
          onPlayItem={onPlayItem}
          onViewAll={onViewAll}
        />
      ))}
    </div>
  );
}
