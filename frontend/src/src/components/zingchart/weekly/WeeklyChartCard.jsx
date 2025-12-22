// FILE: src/components/zingchart/weekly/WeeklyChartCard.jsx
// CHÚ THÍCH: Component card cho từng khu vực trong "Bảng Xếp Hạng Tuần" (Việt Nam / US-UK / K-Pop).
// - BẢN CẬP NHẬT: dùng component con WeeklyChartItem để render từng dòng (tránh lặp code).
// - Nhận data qua props, KHÔNG fetch API.
// - Có nút Play (phát bài đầu tiên) + danh sách top 5 (click để phát) + nút "Xem tất cả".
// - Mọi hành động đều có toast + console log rõ ràng.

import { useCallback } from "react";
import { toast } from "sonner";
import { Play } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import WeeklyChartItem from "@/components/zingchart/weekly/WeeklyChartItem";

/**
 * Props:
 * - chart: {
 *    regionKey: string,
 *    title: string,
 *    items: Array<{ id, rank, delta, title, artist, duration }>
 *   }
 * - onPlayItem?: (song) => void
 * - onViewAll?: (chart) => void
 * - className?: string
 */
export default function WeeklyChartCard({
  chart,
  onPlayItem,
  onViewAll,
  className,
}) {
  const safeItems = Array.isArray(chart?.items) ? chart.items : [];

  const handlePlayItem = useCallback(
    (song) => {
      try {
        if (typeof onPlayItem !== "function") {
          toast.error("Chưa cấu hình phát bài hát.");
          console.error("[WeeklyChartCard] Missing onPlayItem handler.", {
            song,
          });
          return;
        }
        onPlayItem(song);
        // Lưu ý: WeeklyChartItem cũng toast success, nếu bạn muốn tránh toast đôi
        // thì bạn có thể bỏ toast ở WeeklyChartItem hoặc bỏ toast ở handler ngoài.
      } catch (err) {
        console.error("[WeeklyChartCard] onPlayItem failed:", err);
        toast.error("Phát bài hát thất bại.");
      }
    },
    [onPlayItem]
  );

  const handlePlayChart = useCallback(() => {
    const first = safeItems?.[0];
    if (!first) {
      toast.error("Không có bài để phát.");
      console.error("[WeeklyChartCard] Empty chart items:", chart);
      return;
    }
    // Toast cho nút play tổng (vì không click item)
    toast.success(`Phát bảng xếp hạng: ${chart?.title ?? "Weekly Chart"}`);
    handlePlayItem(first);
  }, [chart, handlePlayItem, safeItems]);

  const handleViewAll = useCallback(() => {
    try {
      if (typeof onViewAll !== "function") {
        toast.success(`Xem tất cả: ${chart?.title ?? "Bảng xếp hạng"} (demo).`);
        console.log("[WeeklyChartCard] View all (no handler):", chart);
        return;
      }
      onViewAll(chart);
      toast.success(`Xem tất cả: ${chart?.title ?? "Bảng xếp hạng"}`);
    } catch (err) {
      console.error("[WeeklyChartCard] onViewAll failed:", err);
      toast.error("Mở danh sách thất bại.");
    }
  }, [onViewAll, chart]);

  return (
    <Card className={cn("border-border/60 bg-card/30", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">
          {chart?.title ?? "Bảng xếp hạng"}
        </CardTitle>

        <Button
          type="button"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={handlePlayChart}
          aria-label="Play chart"
          title="Phát"
        >
          <Play className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-0">
        <Separator className="mb-3" />

        {safeItems.length === 0 ? (
          <div className="rounded-xl px-2 py-6 text-sm text-muted-foreground">
            Chưa có dữ liệu.
          </div>
        ) : (
          <div className="space-y-2">
            {safeItems.slice(0, 5).map((song) => (
              <WeeklyChartItem
                key={song?.id ?? `weekly-item-${Math.random()}`}
                song={song}
                onPlay={handlePlayItem}
              />
            ))}
          </div>
        )}

        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleViewAll}
          >
            Xem tất cả
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
