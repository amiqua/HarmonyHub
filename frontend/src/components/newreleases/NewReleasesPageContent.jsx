// FILE: src/components/newreleases/NewReleasesPageContent.jsx
// Page content cho trang "BXH Nhạc Mới" (New Releases Chart).
// Fetch GET /api/v1/songs với sort=newest, sau đó render header + list.

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { http } from "@/lib/http";
import { usePlayer } from "@/hooks/usePlayer";
import { addFavoriteSong, removeFavoriteSong } from "@/services/favorites.api";

import NewReleasesHeader from "@/components/newreleases/NewReleasesHeader";
import NewReleasesList from "@/components/newreleases/NewReleasesList";

function normalizeSong(s, idx) {
  const id = s?.id ?? s?.song_id ?? `nr-${idx}`;
  const title = s?.title ?? s?.name ?? "Untitled";
  const artistsList = Array.isArray(s?.artists)
    ? s.artists.map((a) => a?.name ?? a).filter(Boolean).join(", ")
    : "";
  const artist = s?.artist || artistsList || "Unknown Artist";
  const album = s?.album_title ?? s?.album?.title ?? s?.album ?? "";
  const coverUrl =
    s?.cover_url ?? s?.image_url ?? s?.thumbnail ?? s?.thumbnail_url ?? "";
  const audio_url = s?.audio_url ?? s?.file_url ?? s?.url ?? "";
  const duration = s?.duration ?? null;

  return {
    ...s,
    id,
    title,
    artist,
    album,
    coverUrl,
    cover_url: coverUrl,
    audio_url,
    duration,
    liked: Boolean(s?.liked),
  };
}

export default function NewReleasesPageContent({ onRequireLogin }) {
  const [rawItems, setRawItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSongId, setActiveSongId] = useState(null);
  const { handlePlaySong: playSongGlobal } = usePlayer();

  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      try {
        const res = await http.get("/songs", {
          params: { page: 1, limit: 50, sort: "newest" },
        });
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (!alive) return;
        setRawItems(list);
      } catch (err) {
        console.error("[NewReleasesPageContent] Fetch failed:", err);
        if (alive) setRawItems([]);
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(
    () =>
      rawItems.map((s, idx) => ({
        ...normalizeSong(s, idx),
        rank: idx + 1,
        delta: 0,
      })),
    [rawItems]
  );

  const handlePlaySong = (song) => {
    setActiveSongId(song?.id ?? null);
    if (typeof playSongGlobal === "function") {
      playSongGlobal(song);
    }
  };

  const handlePlayAll = () => {
    if (!items.length) {
      toast.error("Chưa có bài hát để phát.");
      return;
    }
    handlePlaySong(items[0]);
  };

  const handleToggleLike = async (song) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Bạn cần đăng nhập để dùng yêu thích.");
      onRequireLogin?.();
      return;
    }
    try {
      if (song?.liked) {
        await removeFavoriteSong(song.id);
        toast.success("Đã bỏ yêu thích.");
      } else {
        await addFavoriteSong(song.id);
        toast.success("Đã thêm yêu thích.");
      }
      setRawItems((prev) =>
        prev.map((it) =>
          (it?.id ?? it?.song_id) === song?.id
            ? { ...it, liked: !song.liked }
            : it
        )
      );
    } catch (err) {
      console.error("[NewReleasesPageContent] toggleLike failed:", err);
    }
  };

  const handleOpenLyrics = (song) => {
    toast.message(`Lời bài hát "${song?.title ?? ""}" (đang phát triển).`);
  };

  const handleAddToPlaylist = (song) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Bạn cần đăng nhập để thêm vào playlist.");
      onRequireLogin?.();
      return;
    }
    window.dispatchEvent(
      new CustomEvent("playlist:add", { detail: { song } })
    );
  };

  const handleShare = (song) => {
    const url = song?.audio_url || window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => toast.success("Đã copy link bài hát."),
        () => toast.error("Không thể copy link.")
      );
    }
  };

  return (
    <div className="space-y-6">
      <NewReleasesHeader
        title="BXH Nhạc Mới"
        subtitle={
          isLoading
            ? "Đang tải dữ liệu..."
            : `${items.length} bài hát mới nhất`
        }
        items={items}
        onPlayAll={handlePlayAll}
        onPlaySong={handlePlaySong}
      />

      <NewReleasesList
        items={items}
        activeSongId={activeSongId}
        onPlaySong={handlePlaySong}
        onToggleLike={handleToggleLike}
        onOpenLyrics={handleOpenLyrics}
        onAddToPlaylist={handleAddToPlaylist}
        onShare={handleShare}
      />
    </div>
  );
}
