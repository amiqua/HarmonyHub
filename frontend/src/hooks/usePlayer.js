import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePlayerStore } from "@/store/playerStore";
import { addSongToHistory } from "@/services/history.api";

export function usePlayer() {
  const queryClient = useQueryClient();
  const { setNowPlaying } = usePlayerStore();

  const handlePlaySong = (song) => {
    try {
      if (!song?.audio_url) {
        toast.error("Bài hát này chưa có audio_url để phát.");
        return;
      }

      setNowPlaying(song);
      toast.success(`Đang phát: ${song?.title ?? "Bài hát"}`);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // Haven't logged in, don't save history

      const songId = song?.id;
      if (!songId) return;

      // Realtime notification for components listening (e.g. History UI)
      window.dispatchEvent(
        new CustomEvent("history:played", {
          detail: {
            songId,
            song,
            played_at: new Date().toISOString(),
          },
        })
      );

      const getSongKey = (r) => r?.song_id ?? r?.songId ?? r?.id ?? null;

      const upsertToTop = (arr, row) => {
        const k = getSongKey(row);
        if (!k) return arr;
        const filtered = (arr ?? []).filter((x) => getSongKey(x) !== k);
        return [row, ...filtered];
      };

      addSongToHistory(songId)
        .then((saved) => {
          const row = {
            id: saved?.id ?? `tmp-${songId}`,
            played_at: saved?.played_at ?? new Date().toISOString(),
            duration_listened: saved?.duration_listened ?? null,
            song_id: songId,
            title: song?.title ?? "Bài hát",
            duration: song?.duration ?? null,
            audio_url: song?.audio_url ?? null,
            release_date: song?.release_date ?? null,
          };

          // Optimistic update
          queryClient.setQueriesData({ queryKey: ["history", "me"] }, (old) => {
            if (Array.isArray(old)) return upsertToTop(old, row);
            const rows = Array.isArray(old?.rows) ? old.rows : null;
            if (rows) return { ...old, rows: upsertToTop(rows, row) };
            return [row];
          });

          // Sync from server
          queryClient.invalidateQueries({ queryKey: ["history", "me"] });
        })
        .catch((err) => {
          console.warn("[Player] addSongToHistory failed:", err?.response?.data || err);
        });
    } catch (err) {
      console.error("[Player] handlePlaySong failed:", err);
      toast.error("Phát bài hát thất bại.");
    }
  };

  return { handlePlaySong };
}
