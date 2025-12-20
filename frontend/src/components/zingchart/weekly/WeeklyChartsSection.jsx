// FILE: src/components/zingchart/weekly/WeeklyChartsSection.jsx
// CHÚ THÍCH: Component section "Bảng Xếp Hạng Tuần" (đã tách nhỏ).
// - Dùng WeeklyChartsGrid + WeeklyChartCard/WeeklyChartItem (không fetch API).
// - Header có nút "Xem Top 100" (toast + console).
// - Đây là bản CẬP NHẬT để sử dụng các component con bạn vừa tạo, tránh dư thừa code.

import { useCallback } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import WeeklyChartsGrid from "@/components/zingchart/weekly/WeeklyChartsGrid";

/**
 * Props:
 * - charts?: Array<{
 *    regionKey: string,
 *    title: string,
 *    items: Array<{ id, rank, delta, title, artist, duration }>
 * }>
 * - onViewTop100?: () => void
 * - onPlayItem?: (song) => void
 * - onViewAllRegion?: (chart) => void (optional)
 */
export default function WeeklyChartsSection({
  charts = [],
  onViewTop100,
  onPlayItem,
  onViewAllRegion,
  className,
}) {
  const handleViewTop100 = useCallback(() => {
    try {
      if (typeof onViewTop100 !== "function") {
        toast.error("Chưa cấu hình hành động Top 100.");
        console.error("[WeeklyChartsSection] Missing onViewTop100 handler.");
        return;
      }
      onViewTop100();
      toast.success("Đi tới Top 100 (demo).");
    } catch (err) {
      console.error("[WeeklyChartsSection] onViewTop100 failed:", err);
      toast.error("Mở Top 100 thất bại.");
    }
  }, [onViewTop100]);

  const handleViewAllRegion = useCallback(
    (chart) => {
      try {
        if (typeof onViewAllRegion !== "function") {
          toast.success(
            `Xem tất cả: ${chart?.title ?? "Bảng xếp hạng"} (demo).`
          );
          console.log(
            "[WeeklyChartsSection] View all region (no handler):",
            chart
          );
          return;
        }
        onViewAllRegion(chart);
        toast.success(`Xem tất cả: ${chart?.title ?? "Bảng xếp hạng"}`);
      } catch (err) {
        console.error("[WeeklyChartsSection] onViewAllRegion failed:", err);
        toast.error("Mở danh sách thất bại.");
      }
    },
    [onViewAllRegion]
  );

  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Bảng Xếp Hạng Tuần</h2>

        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={handleViewTop100}
          title="Xem Top 100"
        >
          Xem Top 100 <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid (tách component) */}
      <WeeklyChartsGrid
        charts={charts}
        onPlayItem={onPlayItem}
        onViewAll={handleViewAllRegion}
      />
    </section>
  );
}
