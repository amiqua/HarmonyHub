// FILE: src/components/genres/sections/GenresSection.jsx
// CHÚ THÍCH:
// - Wrapper cho mỗi section trong trang "Chủ đề & Thể Loại".
// - Render: tiêu đề (bên trái) + action "Tất cả" (bên phải) + children.
// - KHÔNG fetch API. Không phụ thuộc router, chỉ gọi callback nếu có.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - title: string
 * - actionLabel?: string (default: "Tất cả")
 * - onAction?: () => void
 * - children: ReactNode
 * - className?: string
 */
export default function GenresSection({
  title,
  actionLabel = "Tất cả",
  onAction,
  children,
  className,
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>

        {onAction ? (
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl text-muted-foreground hover:text-foreground"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">{actionLabel}</div>
        )}
      </div>

      {children}
    </section>
  );
}
