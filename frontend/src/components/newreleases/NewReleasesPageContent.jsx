// FILE: src/components/newreleases/NewReleasesPageContent.jsx
// CHÚ THÍCH:
// - Page content cho trang "BXH Nhạc Mới" (New Releases Chart).
// - Dùng NewReleasesHeader + NewReleasesList.
// - Hiện dùng DATA MẪU để đảm bảo render chạy ngay, hạn chế phát sinh vấn đề.
// - Mọi action có toast + console rõ ràng (play/like/more...).
// - KHÔNG fetch API. Khi có API thật, thay phần seedItems bằng react-query + apiClient.

import { useMemo, useState } from "react";
import { toast } from "sonner";

import NewReleasesHeader from "@/components/newreleases/NewReleasesHeader";
import NewReleasesList from "@/components/newreleases/NewReleasesList";

/**
 * Props:
 * - onRequireLogin?: () => void
 */
export default function NewReleasesPageContent({ onRequireLogin }) {
  const seedItems = useMemo(
    () => [
      {
        id: "nr-1",
        rank: 1,
        delta: +1,
        title: "Golden Hour",
        artist: "Luna Wave",
        album: "Neon Skies",
        duration: 214,
        thumbnail: "",
        liked: false,
      },
      {
        id: "nr-2",
        rank: 2,
        delta: 0,
        title: "Midnight Drive",
        artist: "The Midnight Bloom",
        album: "Late Night Drives",
        duration: 198,
        thumbnail: "",
        liked: true,
      },
      {
        id: "nr-3",
        rank: 3,
        delta: -2,
        title: "Afterglow",
        artist: "Orion's Belt",
        album: "Starlight Sessions",
        duration: 231,
        thumbnail: "",
        liked: false,
      },
    ],
    []
  );

  const [items, setItems] = useState(seedItems);
  const [activeSongId, setActiveSongId] = useState(null);

  const handlePlaySong = (song) => {
    try {
      setActiveSongId(song?.id ?? null);
      toast.success(`Phát: ${song?.title ?? "Bài hát"}`);
      console.log("[NewReleasesPageContent] Play song:", song);
    } catch (err) {
      console.error("[NewReleasesPageContent] handlePlaySong failed:", err);
      toast.error("Không thể phát bài hát.");
    }
  };

  const handlePlayAll = () => {
    try {
      if (!items.length) {
        toast.error("Chưa có bài hát để phát.");
        return;
      }
      const first = items[0];
      setActiveSongId(first?.id ?? null);
      toast.success("Phát tất cả (mock).");
      console.log("[NewReleasesPageContent] Play all:", items);
    } catch (err) {
      console.error("[NewReleasesPageContent] handlePlayAll failed:", err);
      toast.error("Không thể phát tất cả.");
    }
  };

  const handleToggleLike = (song) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để dùng yêu thích.");
      console.warn("[NewReleasesPageContent] Missing accessToken.");
      onRequireLogin?.();
      return;
    }

    try {
      setItems((prev) =>
        (Array.isArray(prev) ? prev : []).map((it) =>
          it?.id === song?.id ? { ...it, liked: !it?.liked } : it
        )
      );
      toast.success(song?.liked ? "Đã bỏ yêu thích." : "Đã thêm yêu thích.");
      console.log("[NewReleasesPageContent] Toggle like:", song);
    } catch (err) {
      console.error("[NewReleasesPageContent] handleToggleLike failed:", err);
      toast.error("Không thể cập nhật yêu thích.");
    }
  };

  const handleOpenLyrics = (song) => {
    try {
      toast.success("Mở lời bài hát (mock).");
      console.log("[NewReleasesPageContent] Open lyrics:", song);
    } catch (err) {
      console.error("[NewReleasesPageContent] handleOpenLyrics failed:", err);
      toast.error("Không thể mở lời bài hát.");
    }
  };

  const handleAddToPlaylist = (song) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để thêm vào playlist.");
      console.warn("[NewReleasesPageContent] Missing accessToken.");
      onRequireLogin?.();
      return;
    }

    try {
      toast.success("Đã chọn thêm vào danh sách phát (mock).");
      console.log("[NewReleasesPageContent] Add to playlist:", song);
    } catch (err) {
      console.error(
        "[NewReleasesPageContent] handleAddToPlaylist failed:",
        err
      );
      toast.error("Không thể thêm vào playlist.");
    }
  };

  const handleShare = (song) => {
    try {
      toast.success("Mở chia sẻ (mock).");
      console.log("[NewReleasesPageContent] Share:", song);
    } catch (err) {
      console.error("[NewReleasesPageContent] handleShare failed:", err);
      toast.error("Không thể chia sẻ.");
    }
  };

  return (
    <div className="space-y-6">
      <NewReleasesHeader
        title="BXH Nhạc Mới"
        subtitle="Cập nhật theo thời gian thực (UI demo)"
        onPlayAll={handlePlayAll}
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
