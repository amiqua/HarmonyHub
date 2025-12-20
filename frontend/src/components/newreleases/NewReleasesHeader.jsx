// FILE: src/components/newreleases/NewReleasesHeader.jsx
// CHÚ THÍCH:
// - Header cho trang "BXH Nhạc Mới": tiêu đề lớn + nút Play.
// - KHÔNG fetch API.
// - Nút Play gọi onPlayAll (nếu có) hoặc onPlaySong(firstItem).
// - Không toast ở đây (tránh spam). Toast nếu cần xử lý tại page/content.

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - items?: Array<song>
 * - onPlayAll?: (items) => void
 * - onPlaySong?: (song) => void
 * - className?: string
 */
export default function NewReleasesHeader({
  title = "BXH Nhạc Mới",
  subtitle,
  items = [],
  onPlayAll,
  onPlaySong,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const first = safeItems[0];

  const handlePlay = () => {
    if (typeof onPlayAll === "function") return onPlayAll(safeItems);
    if (typeof onPlaySong === "function" && first) return onPlaySong(first);
  };

  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={handlePlay}
        disabled={safeItems.length === 0}
        className="h-11 rounded-full px-5"
        aria-label="Play New Releases"
        title="Phát"
      >
        <Play className="mr-2 size-4" />
        Phát
      </Button>
    </div>
  );
}
