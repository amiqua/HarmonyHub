import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "@/store/playerStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
} from "lucide-react";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GlobalAudioPlayer({ autoPlay = true }) {
  const { nowPlaying, isPlaying, setIsPlaying } = usePlayerStore();
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(false);

  const song = nowPlaying;
  const coverUrl =
    song?.cover_url ?? song?.image_url ?? song?.thumbnail ?? song?.coverUrl ?? "";

  // Load + autoplay on song change
  useEffect(() => {
    if (!autoPlay) return;
    if (!song?.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = song.audio_url;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("[GlobalAudioPlayer] play() failed:", err);
      });
  }, [song?.audio_url, autoPlay, setIsPlaying]);

  // Sync play/pause with store
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Sync volume/mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // Time tracking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [repeat, setIsPlaying]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const newTime = (Number(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    if (!song) return;
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[88px] items-center gap-4 border-t border-border/60 bg-card/95 px-4 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:px-6">
      {/* Left — Cover + title */}
      <div className="flex w-[260px] min-w-0 items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={song?.title || "cover"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
              {song ? String(song?.title || "?").trim().slice(0, 1).toUpperCase() : "♪"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {song ? (
            <>
              <div className="truncate text-sm font-semibold text-foreground">
                {song.title}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {song.artist || song.artistsText || "Unknown Artist"}
              </div>
            </>
          ) : (
            <div className="text-sm italic text-muted-foreground">
              Chưa phát bài nào
            </div>
          )}
        </div>

        {song && (
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Yêu thích"
          >
            <Heart
              className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Center — Controls + progress */}
      <div className="flex flex-1 flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShuffle((v) => !v)}
            className={`rounded-full p-1.5 transition-colors hover:text-foreground ${
              shuffle ? "text-emerald-500" : "text-muted-foreground"
            }`}
            aria-label="Trộn bài"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Bài trước"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            disabled={!song}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-all hover:scale-105 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current pl-0.5" />
            )}
          </button>

          <button
            type="button"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Bài kế tiếp"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setRepeat((v) => !v)}
            className={`rounded-full p-1.5 transition-colors hover:text-foreground ${
              repeat ? "text-emerald-500" : "text-muted-foreground"
            }`}
            aria-label="Lặp lại"
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        <div className="flex w-full max-w-2xl items-center gap-3">
          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
            {formatTime(currentTime)}
          </span>

          <div className="group relative flex-1">
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progressPct}
              onChange={handleSeek}
              disabled={!song}
              className="player-range absolute inset-0 z-10 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label="Tiến trình bài hát"
            />
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <span className="w-10 text-left text-xs tabular-nums text-muted-foreground">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right — Volume */}
      <div className="flex w-[200px] items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setMuted((v) => !v)}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={muted ? "Bật âm" : "Tắt âm"}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <div className="group relative h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-emerald-500 transition-[width]"
            style={{ width: `${(muted ? 0 : volume) * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (Number(e.target.value) > 0) setMuted(false);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Âm lượng"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
