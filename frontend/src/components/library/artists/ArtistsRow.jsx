// FILE: src/components/library/artists/ArtistsRow.jsx
// CHÚ THÍCH:
// - Hàng nghệ sĩ dạng scroll ngang (avatar tròn) giống UI bạn thiết kế.
// - Nhận items từ LibraryArtistsSection và render ArtistAvatarCard.
// - Không fetch API.

import { cn } from "@/lib/utils";

import ArtistAvatarCard from "@/components/library/artists/ArtistAvatarCard";

/**
 * Props:
 * - items?: Array<{ id, name, imageUrl?, to? }>
 * - onSelect?: (artist) => void
 * - className?: string
 */
export default function ArtistsRow({ items = [], onSelect, className }) {
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return (
      <div className={cn("py-6 text-sm text-muted-foreground", className)}>
        Chưa có nghệ sĩ trong thư viện.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-6 overflow-x-auto pb-2",
        // nho nhỏ: làm scrollbar mảnh hơn ở các browser hỗ trợ
        "scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent",
        className
      )}
    >
      {safeItems.map((artist, idx) => (
        <ArtistAvatarCard
          key={artist?.id ?? `${artist?.name ?? "artist"}-${idx}`}
          artist={artist}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
