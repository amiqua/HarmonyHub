// FILE: src/components/genres/common/GenresSectionHeader.jsx
// CHÚ THÍCH:
// - Header dùng chung cho các section ở trang "Chủ đề & Thể Loại".
// - Bên trái: title. Bên phải: action (vd: "Tất cả").
// - KHÔNG fetch API.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - title: string
 * - actionLabel?: string (vd: "Tất cả")
 * - onAction?: () => void
 * - className?: string
 */
export default function GenresSectionHeader({
  title,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        {title}
      </h2>

      {actionLabel ? (
        <Button
          type="button"
          variant="ghost"
          className="h-9 rounded-xl px-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
