// FILE: src/components/genres/cards/GenreTileCard.jsx
// CHÚ THÍCH:
// - Card/tile dùng cho trang "Chủ đề & Thể Loại" (ô hình ảnh + tiêu đề overlay).
// - Dùng cho cả "Nổi bật", "Tâm Trạng & Hoạt Động", "Quốc Gia", v.v.
// - KHÔNG fetch API. Click sẽ gọi onClick(item) nếu có.

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

/**
 * Props:
 * - title: string
 * - subtitle?: string
 * - imageUrl?: string
 * - onClick?: () => void
 * - size?: "sm" | "md" | "lg" (default "md")
 * - className?: string
 */
export default function GenreTileCard({
  title,
  subtitle,
  imageUrl,
  onClick,
  size = "md",
  className,
}) {
  const sizeCls =
    size === "lg"
      ? "h-44 md:h-52"
      : size === "sm"
        ? "h-28 md:h-32"
        : "h-36 md:h-40";

  const Comp = onClick ? "button" : "div";

  return (
    <Card
      className={cn(
        "group overflow-hidden rounded-2xl border-border/60 bg-card/20 text-left",
        "transition hover:bg-card/30",
        className
      )}
    >
      <Comp
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={cn("relative w-full", sizeCls, onClick && "cursor-pointer")}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted/30 to-muted/10" />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
        </div>

        {/* Text */}
        <div className="relative flex h-full w-full flex-col justify-end p-4">
          {subtitle ? (
            <div className="text-xs text-white/70">{subtitle}</div>
          ) : null}
          <div className="line-clamp-2 text-lg font-semibold text-white md:text-xl">
            {title}
          </div>
        </div>
      </Comp>
    </Card>
  );
}
