// FILE: src/components/playlists/PlaylistsGrid.jsx
// CHÚ THÍCH:
// - Grid cho trang "Playlist" (mục "CỦA TÔI"): chứa CreatePlaylistCard + các playlist cards.
// - KHÔNG fetch API. Data truyền từ page/content.
// - Nếu chưa có playlist: vẫn hiển thị CreatePlaylistCard (giống ảnh).

import { cn } from "@/lib/utils";

import CreatePlaylistCard from "@/components/playlist/CreatePlaylistCard";
import PlaylistCard from "@/components/playlist/PlaylistCard";

/**
 * Props:
 * - items?: Array<{ id, title, coverUrl?, description?, songsCount? }>
 * - onCreateClick?: () => void
 * - onOpenPlaylist?: (playlist) => void
 * - className?: string
 */
export default function PlaylistsGrid({
  items = [],
  onCreateClick,
  onOpenPlaylist,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className={cn("flex flex-wrap gap-6", className)}>
      <CreatePlaylistCard onCreateClick={onCreateClick} />

      {safeItems.map((pl, idx) => (
        <PlaylistCard
          key={pl?.id ?? `${pl?.title}-${idx}`}
          playlist={pl}
          onOpen={() => onOpenPlaylist?.(pl)}
        />
      ))}
    </div>
  );
}
