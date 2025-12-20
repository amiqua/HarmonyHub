import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AudioPlayer({ song }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!song?.audio_url) return;
    const audio = ref.current;
    if (!audio) return;

    audio.src = song.audio_url;
    audio.play().catch((e) => {
      console.error("[AudioPlayer] play failed:", e);
      toast.error("Không thể phát bài hát.");
    });
  }, [song?.audio_url]);

  return (
    <audio
      ref={ref}
      controls
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
    />
  );
}
