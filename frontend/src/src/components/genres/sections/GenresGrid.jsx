// FILE: src/components/genres/sections/GenresGrid.jsx
// CHÚ THÍCH:
// - Grid layout cho các card ở trang "Chủ đề & Thể Loại".
// - Dùng GenreTileCard để render từng item.
// - KHÔNG fetch API. Không toast ở đây (toast xử lý ở page/content nếu cần).

import { cn } from "@/lib/utils";
import GenreTileCard from "@/components/genres/cards/GenreTileCard";

/**
 * Item shape:
 * { id, title, subtitle?, imageUrl? }
 *
 * Props:
 * - items?: Array<Item>
 * - columns?: 2|3|4 (default 3)
 * - cardSize?: "sm"|"md"|"lg"
 * - onSelect?: (item) => void
 * - className?: string
 */
export default function GenresGrid({
  items = [],
  columns = 3,
  cardSize = "md",
  onSelect,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  const colCls =
    columns === 4
      ? "grid-cols-2 md:grid-cols-4"
      : columns === 2
        ? "grid-cols-2"
        : "grid-cols-2 md:grid-cols-3";

  return (
    <div className={cn("grid gap-4", colCls, className)}>
      {safeItems.map((it, idx) => (
        <GenreTileCard
          key={it?.id ?? `${it?.title}-${idx}`}
          title={it?.title ?? "—"}
          subtitle={it?.subtitle}
          imageUrl={it?.imageUrl}
          size={cardSize}
          onClick={onSelect ? () => onSelect(it) : undefined}
        />
      ))}
    </div>
  );
}
