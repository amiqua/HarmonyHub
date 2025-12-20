// FILE: src/components/history/HistoryHeader.jsx
// CHÚ THÍCH: Header của trang "Phát gần đây".
// - Hiển thị tiêu đề + nút Play (giống UI bạn chụp).
// - Không xử lý router ở đây, chỉ gọi callback.

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HistoryHeader({ title = "Phát gần đây", onPlayAll }) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
        {title}
      </h1>

      <Button
        type="button"
        size="icon"
        className="h-10 w-10 rounded-full bg-purple-600 text-white hover:bg-purple-500"
        onClick={() => onPlayAll?.()}
        aria-label="Play all"
        title="Phát tất cả"
      >
        <Play className="size-5" />
      </Button>
    </div>
  );
}
