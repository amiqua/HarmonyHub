import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * GlobalAudioPlayer
 * - Nhận nowPlaying (song) từ App
 * - Tự set src = song.audio_url và play()
 * - Hiển thị controls để bạn dễ debug (có thể đổi sang hidden sau)
 */
export default function GlobalAudioPlayer({ song, autoPlay = true }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!autoPlay) return;
    if (!song?.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    // Đổi bài
    audio.src = song.audio_url;

    // Play (có thể bị browser chặn nếu không phải click)
    audio.play().catch((err) => {
      console.error("[GlobalAudioPlayer] play() failed:", err);
      toast.error("Không thể phát bài hát (URL lỗi hoặc bị trình duyệt chặn).");
    });
  }, [song?.audio_url, autoPlay]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {song?.title ?? "Chưa phát bài nào"}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {song?.artist ?? song?.subtitle ?? ""}
          </div>
        </div>

        <audio ref={audioRef} controls className="w-[420px] max-w-full" />
      </div>
    </div>
  );
}
