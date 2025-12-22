// FILE: src/components/library/hero/LibraryHeader.jsx
// CHÚ THÍCH:
// - Header của trang Thư viện: tiêu đề lớn "Thư viện" + nút Play tròn.
// - Không fetch API. Chỉ render UI và bắn callback onPlay().

import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Props:
 * - title?: string
 * - onPlay?: () => void
 * - className?: string
 */
export default function LibraryHeader({
  title = "Thư viện",
  onPlay,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
        {title}
      </h1>

      <Button
        type="button"
        size="icon"
        onClick={() => onPlay?.()}
        className={cn(
          "h-12 w-12 rounded-full",
          "bg-primary/20 text-primary hover:bg-primary/30",
          "shadow-sm"
        )}
        aria-label="Play"
        title="Phát"
      >
        <Play className="h-5 w-5" />
      </Button>
    </div>
  );
}
