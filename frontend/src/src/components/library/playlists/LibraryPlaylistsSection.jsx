// FILE: src/components/library/playlists/LibraryPlaylistsSection.jsx
// CHÚ THÍCH:
// - Section "PLAYLIST" trong trang Thư viện.
// - Hiện tại: nếu items rỗng -> show Empty State giống UI ("Bạn chưa có playlist nào") + nút tạo playlist.
// - Không fetch API (data truyền từ LibraryPageContent).
// - Sau này có data thật: bạn chỉ cần thay phần render grid playlist.

import { cn } from "@/lib/utils";

import SectionHeader from "@/components/library/common/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Props:
 * - title?: string
 * - items?: Array<any>  (sau này playlist schema bạn quyết định)
 * - onSeeAll?: () => void
 * - onCreatePlaylist?: () => void
 * - className?: string
 */
export default function LibraryPlaylistsSection({
  title = "PLAYLIST",
  items = [],
  onSeeAll,
  onCreatePlaylist,
  className,
}) {
  const safeItems = Array.isArray(items) ? items : [];
  const isEmpty = safeItems.length === 0;

  return (
    <section className={cn("space-y-4", className)}>
      <SectionHeader title={title} onAction={onSeeAll} actionLabel="Tất cả" />

      {isEmpty ? (
        <Card className="border-border/60 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="text-base font-semibold">
              Bạn chưa có playlist nào
            </div>
            <div className="max-w-[520px] text-sm text-muted-foreground">
              Tạo playlist để lưu lại những bài hát bạn yêu thích và nghe lại
              bất cứ lúc nào.
            </div>

            <Button
              type="button"
              className="rounded-full"
              onClick={() => onCreatePlaylist?.()}
            >
              Tạo playlist
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {safeItems.map((pl, idx) => (
            <Card
              key={pl?.id ?? `playlist-${idx}`}
              className="border-border/60 bg-card/30"
            >
              <CardContent className="p-4">
                <div className="text-sm font-semibold truncate">
                  {pl?.title ?? pl?.name ?? "Playlist"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground truncate">
                  {pl?.subtitle ?? "—"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
