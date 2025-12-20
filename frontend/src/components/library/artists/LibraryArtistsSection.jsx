// FILE: src/components/library/artists/LibraryArtistsSection.jsx
// CHÚ THÍCH:
// - Section "Nghệ sĩ" trong trang Thư viện.
// - Dùng SectionHeader + ArtistsRow.
// - Không fetch API (data truyền từ LibraryPageContent).

import { cn } from "@/lib/utils";

import SectionHeader from "@/components/library/common/SectionHeader";
import ArtistsRow from "@/components/library/artists/ArtistsRow";

/**
 * Props:
 * - title?: string
 * - items?: Array<{ id, name, imageUrl?, to? }>
 * - onSeeAll?: () => void
 * - onSelectArtist?: (artist) => void
 * - className?: string
 */
export default function LibraryArtistsSection({
  title = "Nghệ sĩ",
  items = [],
  onSeeAll,
  onSelectArtist,
  className,
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <SectionHeader title={title} onAction={onSeeAll} actionLabel="Tất cả" />
      <ArtistsRow items={items} onSelect={onSelectArtist} />
    </section>
  );
}
