// FILE: src/components/favorites/FavoritesPageContent.jsx
// CHÚ THÍCH:
// - Nội dung trang "Bài hát yêu thích": Hero + Table.
// - Fetch 1 lần ở đây (container) bằng React Query.
// - Toggle like: ở trang favorites thì chủ yếu là "bỏ thích" => DELETE /favorites/:songId
// - Nếu 401 => toast + gọi onRequireLogin()

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import FavoritesHero from "@/components/favorites/FavoritesHero";
import FavoritesSongsTable from "@/components/favorites/FavoritesSongsTable";

import {
  getMyFavoriteSongs,
  removeFavoriteSong,
  // addFavoriteSong, // nếu sau này bạn muốn thêm từ trang khác
} from "@/services/favorites.api";

/**
 * Props:
 * - onRequireLogin?: () => void
 * - onPlaySong?: (song) => void
 * - onPlayAll?: (songs) => void
 */
export default function FavoritesPageContent({
  onRequireLogin,
  onPlaySong,
  onPlayAll,
}) {
  const qc = useQueryClient();
  const [activeSongId, setActiveSongId] = useState(null);

  // ---- Fetch favorites ----
  const q = useQuery({
    queryKey: ["favorites", "me", { page: 1, limit: 50 }],
    queryFn: () => getMyFavoriteSongs({ page: 1, limit: 50 }),
    retry: false,
    onError: (e) => {
      const status = e?.response?.status;
      if (status === 401) {
        toast.error("Bạn cần đăng nhập để xem bài hát yêu thích.");
        onRequireLogin?.();
        return;
      }
      toast.error(e?.response?.data?.message ?? "Tải favorites thất bại.");
    },
  });

  // API doc: { success:true, data:[...], meta:{...} }
  // data item có: id, title, duration, audio_url, release_date, added_at...
  // UI của bạn đang dùng: id, title, artist, album, duration, plays, coverUrl, liked
  const items = useMemo(() => {
    const list = q.data?.data ?? [];
    if (!Array.isArray(list)) return [];

    return list.map((it) => ({
      id: it.id ?? it.song_id ?? it.songId,
      title: it.title ?? "Bài hát",
      artist: it.artist ?? it.artist_name ?? it.subtitle ?? "",
      album: it.album ?? it.album_title ?? "",
      duration: it.duration ?? it.duration_seconds ?? 0,
      plays: it.plays ?? 0,
      coverUrl: it.coverUrl ?? it.cover_url ?? it.thumbnail ?? "",
      liked: true, // vì đây là trang favorites
      // giữ lại raw field để bạn dùng sau nếu cần
      audio_url: it.audio_url,
      release_date: it.release_date,
      added_at: it.added_at,
    }));
  }, [q.data]);

  // ---- Actions ----
  const handlePlaySong = (song) => {
    try {
      if (!song) return;

      setActiveSongId(song.id ?? null);
      onPlaySong?.(song);

      toast.success(`Đang phát: ${song?.title ?? "Bài hát"}`);
      console.log("[FavoritesPageContent] Play song:", song);
    } catch (err) {
      console.error("[FavoritesPageContent] handlePlaySong failed:", err);
      toast.error("Phát bài hát thất bại.");
    }
  };

  const handlePlayAll = (songs) => {
    try {
      const list = Array.isArray(songs) ? songs : items;
      if (!list?.length) {
        toast.error("Không có bài hát để phát.");
        return;
      }

      setActiveSongId(list[0]?.id ?? null);
      onPlayAll?.(list);

      toast.success("Đang phát tất cả bài hát yêu thích.");
      console.log("[FavoritesPageContent] Play all:", list);
    } catch (err) {
      console.error("[FavoritesPageContent] handlePlayAll failed:", err);
      toast.error("Phát tất cả thất bại.");
    }
  };

  // ---- Toggle like (bỏ thích) ----
  const mRemove = useMutation({
    mutationFn: (songId) => removeFavoriteSong(songId),
    onSuccess: () => {
      toast.success("Đã xoá khỏi yêu thích.");
      qc.invalidateQueries({ queryKey: ["favorites", "me"] });
    },
    onError: (e) => {
      const status = e?.response?.status;
      if (status === 401) {
        toast.error("Bạn cần đăng nhập để dùng yêu thích.");
        onRequireLogin?.();
        return;
      }
      toast.error(e?.response?.data?.message ?? "Cập nhật yêu thích thất bại.");
    },
  });

  const handleToggleLike = (song) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("Bạn cần đăng nhập để dùng yêu thích.");
        onRequireLogin?.();
        return;
      }

      const songId = song?.id;
      if (!songId) {
        toast.error("Thiếu songId.");
        return;
      }

      // Trang favorites: toggle = bỏ thích
      mRemove.mutate(songId);

      console.log("[FavoritesPageContent] Remove favorite:", song);
    } catch (err) {
      console.error("[FavoritesPageContent] handleToggleLike failed:", err);
      toast.error("Cập nhật yêu thích thất bại.");
    }
  };

  // ---- UI states ----
  if (q.isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FavoritesHero
        title="Bài hát yêu thích"
        count={items.length}
        items={items}
        onPlayAll={handlePlayAll}
        onPlaySong={handlePlaySong}
      />

      <FavoritesSongsTable
        items={items}
        activeSongId={activeSongId}
        onPlaySong={handlePlaySong}
        onToggleLike={handleToggleLike}
        // nếu table muốn disable nút khi đang xoá:
        // isMutating={mRemove.isPending}
      />
    </div>
  );
}
