import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/playerStore";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";

export default function GlobalAudioPlayer({ autoPlay = true }) {
  const { nowPlaying, isPlaying, setIsPlaying } = usePlayerStore();
  const audioRef = useRef(null);

  const song = nowPlaying;
  const coverUrl =
    song?.cover_url ?? song?.image_url ?? song?.thumbnail ?? song?.coverUrl ?? "";

  useEffect(() => {
    if (!autoPlay) return;
    if (!song?.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = song.audio_url;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("[GlobalAudioPlayer] play() failed:", err);
      });
  }, [song?.audio_url, autoPlay, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <div className="player">
      <div className="player__cover">
        {coverUrl ? (
          <img src={coverUrl} alt={song?.title || "cover"} />
        ) : (
          <div className="player__cover-placeholder">
            {song ? String(song?.title || "?").trim().slice(0, 1).toUpperCase() : "?"}
          </div>
        )}
      </div>

      <div className="player__info">
        {song ? (
          <>
            <div className="player__title">{song.title}</div>
            <div className="player__artist">{song.artist || song.artistsText || "Unknown Artist"}</div>
          </>
        ) : (
          <div className="player__empty">Chưa phát bài nào</div>
        )}
      </div>

      <audio 
        ref={audioRef} 
        controls 
        className="player__audio"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="player__spacer" />
    </div>
  );
}

