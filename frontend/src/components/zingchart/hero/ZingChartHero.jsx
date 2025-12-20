// src/components/zingchart/hero/ZingChartHero.jsx
import { toast } from "sonner";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * ZingChartHero
 * - Header "#zingchart" + nút Play tròn như thiết kế
 *
 * Props:
 * - onPlay?: () => void
 */
export default function ZingChartHero({ onPlay }) {
  const handlePlay = () => {
    try {
      if (typeof onPlay !== "function") {
        toast.error("Chưa cấu hình hành động Play.");
        console.error("[ZingChartHero] Missing onPlay handler.");
        return;
      }
      onPlay();
    } catch (err) {
      toast.error("Play thất bại.");
      console.error("[ZingChartHero] onPlay failed:", err);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <h1 className="text-5xl font-extrabold tracking-tight text-purple-400">
        #zingchart
      </h1>

      <Button
        type="button"
        size="icon"
        className="h-12 w-12 rounded-full bg-purple-600 text-white hover:bg-purple-500"
        onClick={handlePlay}
        aria-label="Play zingchart"
        title="Play"
      >
        <Play className="size-6" />
      </Button>
    </div>
  );
}
