import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

/**
 * HomeHeroCarousel
 * - Banner lớn dạng carousel: title/subtitle/desc + nút Đăng nhập + prev/next
 * - Không gọi API (data truyền qua props hoặc dùng defaultSlides)
 *
 * Props (optional):
 * - slides: Array<{
 *     id: string|number,
 *     subtitle?: string,
 *     title: string,
 *     description?: string,
 *     ctaText?: string,
 *     // coverUrls chỉ là tuỳ chọn để hiển thị 2-3 "cover" giống mockup
 *     coverUrls?: string[],
 *   }>
 * - onLoginClick(): void
 * - onSlideChange(slide, index): void
 */
export default function HomeHeroCarousel({
  slides,
  onLoginClick,
  onSlideChange,
}) {
  const defaultSlides = useMemo(
    () => [
      {
        id: "ed",
        subtitle: "New Collection",
        title: "Electronic Dreams",
        description:
          "Loạt playlist dành cho những phiên nghe nhạc đêm muộn. Nhấn Đăng nhập để lưu lại trải nghiệm.",
        ctaText: "Đăng nhập",
        coverUrls: [],
      },
      {
        id: "lofi",
        subtitle: "For Focus",
        title: "Lo-fi Study Session",
        description:
          "Nhạc nhẹ nhàng để tập trung và làm việc. Bạn có thể tìm kiếm bài hát ở thanh phía trên.",
        ctaText: "Đăng nhập",
        coverUrls: [],
      },
      {
        id: "vibes",
        subtitle: "Fresh Picks",
        title: "Daily Vibes",
        description: "Gợi ý mới mỗi ngày — theo dõi playlist để không bỏ lỡ.",
        ctaText: "Đăng nhập",
        coverUrls: [],
      },
    ],
    []
  );

  const data = slides?.length ? slides : defaultSlides;

  const [index, setIndex] = useState(0);
  const current = data[index];

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[HomeHeroCarousel] ${logTag}: Missing handler`);
        return;
      }
      fn();
      toast.success(okMsg);
    } catch (err) {
      console.error(`[HomeHeroCarousel] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const goPrev = () => {
    const nextIndex = (index - 1 + data.length) % data.length;
    setIndex(nextIndex);
    toast.success("Đã chuyển banner (Prev).");
    try {
      onSlideChange?.(data[nextIndex], nextIndex);
    } catch (err) {
      console.error("[HomeHeroCarousel] onSlideChange failed:", err);
      toast.error("Chuyển banner thành công nhưng callback bị lỗi.");
    }
  };

  const goNext = () => {
    const nextIndex = (index + 1) % data.length;
    setIndex(nextIndex);
    toast.success("Đã chuyển banner (Next).");
    try {
      onSlideChange?.(data[nextIndex], nextIndex);
    } catch (err) {
      console.error("[HomeHeroCarousel] onSlideChange failed:", err);
      toast.error("Chuyển banner thành công nhưng callback bị lỗi.");
    }
  };

  const jumpTo = (i) => {
    setIndex(i);
    toast.success(`Đã chuyển tới banner #${i + 1}.`);
    try {
      onSlideChange?.(data[i], i);
    } catch (err) {
      console.error("[HomeHeroCarousel] onSlideChange failed:", err);
      toast.error("Chuyển banner thành công nhưng callback bị lỗi.");
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border-border">
      {/* Background gradient (fallback để không cần ảnh) */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-700/40 via-fuchsia-600/20 to-cyan-500/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_55%)]" />

      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        {/* Left: text */}
        <div className="max-w-xl">
          {current?.subtitle ? (
            <Badge variant="secondary" className="mb-3 rounded-full">
              {current.subtitle}
            </Badge>
          ) : null}

          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {current?.title ?? "Hero Title"}
          </h2>

          {current?.description ? (
            <p className="mt-3 text-sm leading-6 opacity-80 md:text-base">
              {current.description}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              className="rounded-full"
              onClick={() =>
                safeAction(
                  onLoginClick,
                  "Đi tới đăng nhập.",
                  "Chưa cấu hình hành động đăng nhập.",
                  "LoginClick"
                )
              }
            >
              {current?.ctaText ?? "Đăng nhập"}
            </Button>

            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                toast.success("Đã bấm: Khám phá (demo).");
              }}
            >
              Khám phá
            </Button>
          </div>
        </div>

        {/* Right: cover stack (giống mockup — dùng placeholder nếu không có ảnh) */}
        <div className="flex items-center justify-start gap-3 md:justify-end">
          {[0, 1, 2].map((k) => {
            const url = current?.coverUrls?.[k];
            return (
              <div
                key={k}
                className={cn(
                  "relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-card/60 shadow-sm md:h-28 md:w-28",
                  k === 1 && "md:translate-y-2",
                  k === 2 && "md:translate-y-4"
                )}
                title={url ? "Cover" : "Cover placeholder"}
              >
                {url ? (
                  <img
                    src={url}
                    alt="cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Prev/Next controls */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={goPrev}
            aria-label="Prev"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Dots */}
      <div className="relative flex items-center justify-center gap-2 pb-4">
        {data.map((_, i) => (
          <button
            key={data[i]?.id ?? i}
            type="button"
            className={cn(
              "h-2.5 w-2.5 rounded-full border border-border transition",
              i === index ? "bg-primary" : "bg-muted"
            )}
            onClick={() => jumpTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </Card>
  );
}
