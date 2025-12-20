// FILE: src/components/genres/sections/GenresRow.jsx
// CHÚ THÍCH:
// - Row ngang (scroll) cho các item dạng "Tâm trạng & hoạt động" giống ảnh.
// - Dùng GenreTileCard, set width cố định để scroll mượt.
// - KHÔNG fetch API. Không toast ở đây.

import { cn } from "@/lib/utils";
import GenreTileCard from "@/components/genres/cards/GenreTileCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

/**
 * Item shape:
 * { id, title, subtitle?, imageUrl? }
 *
 * Props:
 * - items?: Array<Item>
 * - cardSize?: "sm"|"md"|"lg" (default "md")
 * - itemWidthClass?: string (default "w-[220px] md:w-[260px]")
 * - onSelect?: (item) => void
 * - className?: string
 */
export default function GenresRow({
  items = [],
  cardSize = "md",
  itemWidthClass = "w-[220px] md:w-[260px]",
  onSelect,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <ScrollArea className={cn("w-full", className)}>
      <div className="flex gap-4 pb-3">
        {safeItems.map((it, idx) => (
          <div
            key={it?.id ?? `${it?.title}-${idx}`}
            className={cn("shrink-0", itemWidthClass)}
          >
            <GenreTileCard
              title={it?.title ?? "—"}
              subtitle={it?.subtitle}
              imageUrl={it?.imageUrl}
              size={cardSize}
              onClick={onSelect ? () => onSelect(it) : undefined}
            />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
