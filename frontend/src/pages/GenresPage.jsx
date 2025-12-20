// FILE: src/pages/GenresPage.jsx
// CHÚ THÍCH:
// - Page wrapper cho route "/genres" (Chủ đề & Thể Loại).
// - Chỉ mount GenresPageContent đúng cấu trúc dự án.
// - Nếu sau này bạn muốn click item để điều hướng sang trang chi tiết: xử lý ở App.jsx/page level.

import { toast } from "sonner";
import GenresPageContent from "@/components/genres/GenresPageContent";

/**
 * Props:
 * - onRequireLogin?: () => void (chưa dùng ở trang này, để sẵn nếu cần)
 */
export default function GenresPage() {
  return (
    <div className="p-6">
      <GenresPageContent
        onSelectGenre={(item) => {
          // demo handler (không bắt buộc)
          toast.success(`Mở: ${item?.title ?? "Chủ đề"}`);
          console.log("[GenresPage] Select genre:", item);
        }}
      />
    </div>
  );
}
