// FILE: src/components/playlists/PlaylistCreateCard.jsx
// CHÚ THÍCH:
// - Card “Tạo playlist mới” (ô vuông có dấu +) giống ảnh.
// - Click sẽ gọi onCreateClick để mở dialog (không tự mở dialog ở đây).
// - KHÔNG fetch API.

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Props:
 * - onCreateClick?: () => void
 * - className?: string
 */
export default function PlaylistCreateCard({ onCreateClick, className }) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onCreateClick}
      className={cn(
        "group relative h-[210px] w-full rounded-2xl border border-border/60 bg-card/20 p-0 hover:bg-card/30",
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/10">
        <Plus className="size-5 opacity-80" />
      </div>

      <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground/80">
        Tạo playlist mới
      </div>

      {/* subtle focus ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-primary/20" />
    </Button>
  );
}
