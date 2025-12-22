// FILE: src/components/genres/hero/GenresHero.jsx
// CHÚ THÍCH:
// - Hero banner lớn ở đầu trang "Chủ đề & Thể Loại" (ảnh nền + tiêu đề).
// - Có thể truyền title/subtitle/backgroundUrl.
// - KHÔNG fetch API.

import { cn } from "@/lib/utils";

/**
 * Props:
 * - title?: string
 * - subtitle?: string
 * - backgroundUrl?: string
 * - className?: string
 */
export default function GenresHero({
  title = "Cà phê",
  subtitle,
  backgroundUrl,
  className,
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-muted/10",
        className
      )}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        {backgroundUrl ? (
          <img
            src={backgroundUrl}
            alt="genre-hero"
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-muted/30 to-background" />
        )}

        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <div className="text-4xl font-extrabold tracking-tight text-yellow-300 drop-shadow md:text-6xl">
            {title}
          </div>

          {subtitle ? (
            <div className="mt-3 text-sm text-muted-foreground md:text-base">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
