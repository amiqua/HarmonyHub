// FILE: src/components/playlists/CreatePlaylistCard.jsx
// CHÚ THÍCH:
// - Card "Tạo playlist mới" (ô nét đứt có dấu +) giống UI bạn chụp.
// - Chỉ làm UI + gọi callback onCreateClick.
// - KHÔNG fetch API.

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props:
 * - onCreateClick?: () => void
 * - disabled?: boolean
 * - className?: string
 */
export default function CreatePlaylistCard({
  onCreateClick,
  disabled = false,
  className,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onCreateClick?.()}
      className={cn(
        "group flex h-60 w-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/20 text-left transition",
        "hover:bg-card/30 hover:border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      aria-label="Tạo playlist mới"
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted/40 transition group-hover:bg-muted/55">
          <Plus className="size-5" />
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Tạo playlist mới
        </div>
      </div>
    </button>
  );
}
