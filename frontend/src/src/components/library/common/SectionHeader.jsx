// FILE: src/components/library/common/SectionHeader.jsx
// CHÚ THÍCH:
// - Header dùng chung cho các section trong Library (vd: "Nghệ sĩ", "PLAYLIST").
// - Có nút "Tất cả" (optional) để điều hướng sang trang list đầy đủ.
// - Không fetch API.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - title: string
 * - actionLabel?: string (default "Tất cả")
 * - onAction?: () => void
 * - className?: string
 */
export default function SectionHeader({
  title,
  actionLabel = "Tất cả",
  onAction,
  className,
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="text-lg font-bold tracking-tight">{title}</div>

      {typeof onAction === "function" ? (
        <Button
          type="button"
          variant="ghost"
          className="h-8 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
