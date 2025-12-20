// FILE: src/components/genres/GenresPageContent.jsx
// CHÚ THÍCH:
// - Content tổng cho trang "Chủ đề & Thể Loại".
// - Dùng dữ liệu MẪU để chạy ngay, hạn chế phát sinh vấn đề.
// - KHÔNG fetch API (khi có API, thay seed bằng react-query + apiClient).
// - onSelect sẽ toast + console rõ ràng.

import { useMemo } from "react";
import { toast } from "sonner";

import GenresHero from "@/components/genres/hero/GenresHero";
import GenresSection from "@/components/genres/sections/GenresSection";
import GenresGrid from "@/components/genres/sections/GenresGrid";
import GenresRow from "@/components/genres/sections/GenresRow";

/**
 * Props:
 * - onSelectGenre?: (item) => void
 */
export default function GenresPageContent({ onSelectGenre }) {
  const featured = useMemo(
    () => [
      { id: "feat-1", title: "Cà phê", imageUrl: "" },
      { id: "feat-2", title: "Chill", imageUrl: "" },
      { id: "feat-3", title: "Workout", imageUrl: "" },
      { id: "feat-4", title: "Lo-fi", imageUrl: "" },
      { id: "feat-5", title: "V-Pop", imageUrl: "" },
      { id: "feat-6", title: "US-UK", imageUrl: "" },
    ],
    []
  );

  const moods = useMemo(
    () => [
      { id: "mood-1", title: "Tập trung", imageUrl: "" },
      { id: "mood-2", title: "Thư giãn", imageUrl: "" },
      { id: "mood-3", title: "Chạy bộ", imageUrl: "" },
      { id: "mood-4", title: "Tiệc tùng", imageUrl: "" },
      { id: "mood-5", title: "Lái xe", imageUrl: "" },
    ],
    []
  );

  const countries = useMemo(
    () => [
      { id: "ct-1", title: "Việt Nam", imageUrl: "" },
      { id: "ct-2", title: "Âu Mỹ", imageUrl: "" },
      { id: "ct-3", title: "Hàn Quốc", imageUrl: "" },
      { id: "ct-4", title: "Nhật Bản", imageUrl: "" },
    ],
    []
  );

  const genres = useMemo(
    () => [
      { id: "g-1", title: "Pop", imageUrl: "" },
      { id: "g-2", title: "Rock", imageUrl: "" },
      { id: "g-3", title: "EDM", imageUrl: "" },
      { id: "g-4", title: "R&B", imageUrl: "" },
      { id: "g-5", title: "Rap/Hip-hop", imageUrl: "" },
      { id: "g-6", title: "Acoustic", imageUrl: "" },
    ],
    []
  );

  const handleSelect = (it) => {
    try {
      onSelectGenre?.(it);
      toast.success(`Đã chọn: ${it?.title ?? "Chủ đề"}`);
      console.log("[GenresPageContent] Select:", it);
    } catch (err) {
      console.error("[GenresPageContent] onSelectGenre failed:", err);
      toast.error("Không thể chọn mục.");
    }
  };

  return (
    <div className="space-y-8">
      <GenresHero
        title="Cà phê"
        subtitle="Chill cùng những giai điệu dịu nhẹ."
      />

      <GenresSection title="Nổi bật" actionLabel="Tất cả" onAction={() => {}}>
        <GenresGrid
          items={featured}
          columns={3}
          cardSize="lg"
          onSelect={handleSelect}
        />
      </GenresSection>

      <GenresSection
        title="Tâm trạng & hoạt động"
        actionLabel="Tất cả"
        onAction={() => {}}
      >
        <GenresRow items={moods} cardSize="md" onSelect={handleSelect} />
      </GenresSection>

      <GenresSection title="Quốc gia" actionLabel="Tất cả" onAction={() => {}}>
        <GenresGrid
          items={countries}
          columns={4}
          cardSize="md"
          onSelect={handleSelect}
        />
      </GenresSection>

      <GenresSection title="Thể loại" actionLabel="Tất cả" onAction={() => {}}>
        <GenresGrid
          items={genres}
          columns={3}
          cardSize="md"
          onSelect={handleSelect}
        />
      </GenresSection>
    </div>
  );
}
