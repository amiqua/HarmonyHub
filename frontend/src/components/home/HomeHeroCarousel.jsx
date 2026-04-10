// FILE: src/components/home/HomeHeroCarousel.jsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

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
        description: "Loạt playlist dành cho những phiên nghe nhạc đêm muộn.",
        ctaText: "Đăng nhập",
        coverUrls: [],
      },
      {
        id: "lofi",
        subtitle: "For Focus",
        title: "Lo-fi Study Session",
        description: "Nhạc nhẹ nhàng để tập trung và làm việc.",
        ctaText: "Đăng nhập",
        coverUrls: [],
      },
    ],
    []
  );

  const data = slides?.length ? slides : defaultSlides;
  const [index, setIndex] = useState(0);
  const current = data[index];

  const goPrev = () => {
    const nextIndex = (index - 1 + data.length) % data.length;
    setIndex(nextIndex);
    onSlideChange?.(data[nextIndex], nextIndex);
  };

  const goNext = () => {
    const nextIndex = (index + 1) % data.length;
    setIndex(nextIndex);
    onSlideChange?.(data[nextIndex], nextIndex);
  };

  return (
    <div className="hero-carousel">
      <div className="hero-carousel__slides">
        <div className="hero-carousel__slide">
          {/* We simulate a single item for simplicity, but could map */}
          {current?.coverUrls?.[0] ? (
             <img src={current.coverUrls[0]} alt="" className="hero-carousel__image" />
          ) : (
             <div className="hero-carousel__image" style={{ background: "linear-gradient(45deg, #161b27, #1e2536)" }} />
          )}
          
          <div className="hero-carousel__overlay">
            {current?.subtitle && <span className="hero-carousel__tag">{current.subtitle}</span>}
            <h2 className="hero-carousel__title">{current?.title}</h2>
            <p className="hero-carousel__desc">{current?.description}</p>
            
            <Button variant="primary" onClick={() => toast.success("Khám phá!")}>
              Khám phá
            </Button>
          </div>

          <div className="hero-carousel__controls">
            <button className="hero-carousel__btn" onClick={goPrev}><ChevronLeft size={16}/></button>
            <button className="hero-carousel__btn" onClick={goNext}><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
