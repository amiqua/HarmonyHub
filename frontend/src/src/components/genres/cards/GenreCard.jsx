// FILE: src/components/genres/cards/GenreCard.jsx
// CHÚ THÍCH:
// - Card nền ảnh + title overlay (dùng cho trang "Chủ đề & Thể Loại").
// - Dùng được cho cả grid và row.
// - KHÔNG fetch API. Props truyền từ ngoài.
// - Có thể dùng onClick hoặc href (khi có router link ở level cao hơn).

import { cn } from "@/lib/utils";

/**
 * Props:
 * - title: string
 * - subtitle?: string
 * - imageUrl?: string
 * - variant?: "default" | "feature" (feature to hơn, chữ lớn hơn)
 * - className?: string
 * - onClick?: () => void
 */
export default function GenreCard({
  title,
  subtitle,
  imageUrl,
  variant = "default",
  className,
  onClick,
}) {
  const isFeature = variant === "feature";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card/30 text-left",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFeature ? "h-[220px] md:h-[260px]" : "h-[150px] md:h-[170px]",
        className
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title ?? "genre"}
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              "group-hover:scale-[1.03]"
            )}
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-5">
        <div
          className={cn(
            "font-semibold tracking-tight text-white",
            isFeature ? "text-3xl md:text-5xl" : "text-lg md:text-xl"
          )}
        >
          {title}
        </div>

        {subtitle ? (
          <div className="mt-1 line-clamp-2 text-sm text-white/80">
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Soft hover border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/0 transition group-hover:ring-white/10" />
    </button>
  );
}
