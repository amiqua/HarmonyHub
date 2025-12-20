// FILE: src/components/history/HistoryGrid.jsx
// CHÚ THÍCH: Grid hiển thị danh sách item theo tab hiện tại của trang "Phát gần đây".
// - Hiện tại ưu tiên UI cho tab PLAYLIST (theo ảnh bạn gửi).
// - Nếu sau này bạn muốn tách riêng cho Bài hát/MV/Phòng nhạc: thêm component card tương ứng và switch theo type/tab.
// - Không fetch API ở đây.

import { useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import HistoryPlaylistCard from "@/components/history/HistoryPlaylistCard";

/**
 * Props:
 * - items?: Array<{ id, title, subtitle, cover }>
 * - emptyText?: string
 * - onSelect?: (item) => void
 * - onRequireLogin?: () => void
 * - className?: string
 */
export default function HistoryGrid({
  items = [],
  emptyText = "Không có dữ liệu.",
  onSelect,
  onRequireLogin,
  className,
}) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  if (safeItems.length === 0) {
    return (
      <div
        className={cn(
          "py-10 text-center text-sm text-muted-foreground",
          className
        )}
      >
        {emptyText}
      </div>
    );
  }

  const requireLoginIfNeeded = (actionName) => {
    const token = localStorage.getItem("accessToken");
    if (token) return true;
    toast.error(`Bạn cần đăng nhập để dùng "${actionName}".`);
    onRequireLogin?.();
    return false;
  };

  return (
    <div className={cn("grid grid-cols-2 gap-5 md:grid-cols-4", className)}>
      {safeItems.map((item, idx) => (
        <HistoryPlaylistCard
          key={item?.id ?? `${item?.title ?? "item"}-${idx}`}
          item={item}
          onOpen={(it) => {
            try {
              onSelect?.(it);
            } catch (err) {
              console.error("[HistoryGrid] onSelect failed:", err);
              toast.error("Mở item thất bại.");
            }
          }}
          onPlay={(it) => {
            if (!requireLoginIfNeeded("Phát")) return;
            toast.success(`Phát: ${it?.title ?? "Playlist"} (demo)`);
            console.log("[HistoryGrid] Play item:", it);
          }}
        />
      ))}
    </div>
  );
}
