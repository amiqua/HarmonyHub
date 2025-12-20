// FILE: src/components/library/artists/ArtistAvatarCard.jsx
// CHÚ THÍCH:
// - Card avatar nghệ sĩ dạng hình tròn + tên dưới.
// - Dùng cho hàng "Nghệ sĩ" trên trang Thư viện.
// - Không fetch API. Click sẽ gọi onSelect(artist).

import { cn } from "@/lib/utils";

/**
 * Props:
 * - artist: { id, name, imageUrl? }
 * - onSelect?: (artist) => void
 * - className?: string
 */
export default function ArtistAvatarCard({ artist, onSelect, className }) {
  const name = artist?.name ?? "Unknown";
  const img = artist?.imageUrl;

  return (
    <button
      type="button"
      className={cn(
        "group flex w-[120px] shrink-0 flex-col items-center gap-3 text-left",
        className
      )}
      onClick={() => onSelect?.(artist)}
      title={name}
    >
      <div
        className={cn(
          "relative h-[92px] w-[92px] rounded-full overflow-hidden",
          "bg-muted/30 ring-1 ring-border/50",
          "transition group-hover:ring-border/80"
        )}
      >
        {img ? (
          <img
            src={img}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <div className="w-full text-center">
        <div className="truncate text-sm font-semibold group-hover:text-primary">
          {name}
        </div>
      </div>
    </button>
  );
}
