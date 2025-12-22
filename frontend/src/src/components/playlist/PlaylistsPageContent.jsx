// FILE: src/components/playlists/PlaylistsPageContent.jsx
// CHÚ THÍCH:
// - Nội dung trang "Playlist": Header + Grid + Dialog tạo playlist.
// - Hiện dùng DATA MẪU để đảm bảo render chạy ngay, hạn chế phát sinh vấn đề.
// - Mọi hành động đều có toast (sonner) + console log rõ ràng.
// - KHÔNG fetch API. Khi có API thật, thay handleCreatePlaylist bằng gọi apiClient.

import { useMemo, useState } from "react";
import { toast } from "sonner";

import PlaylistsHeader from "@/components/playlist/PlaylistsHeader";
import PlaylistsGrid from "@/components/playlist/PlaylistsGrid";
import CreatePlaylistDialog from "@/components/playlist/CreatePlaylistDialog";

/**
 * Props:
 * - onRequireLogin?: () => void
 */
export default function PlaylistsPageContent({ onRequireLogin }) {
  const seed = useMemo(
    () => [
      {
        id: "pl-1",
        title: "Top Hits 2025",
        description: "Những bài hot nhất tuần này",
        songsCount: 25,
        coverUrl: "",
      },
      {
        id: "pl-2",
        title: "Chill Night",
        description: "Nhạc chill thư giãn buổi tối",
        songsCount: 18,
        coverUrl: "",
      },
    ],
    []
  );

  const [items, setItems] = useState(seed);
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => {
    try {
      setCreateOpen(true);
      toast.success("Mở tạo playlist.");
    } catch (err) {
      console.error("[PlaylistsPageContent] openCreate failed:", err);
      toast.error("Không thể mở tạo playlist.");
    }
  };

  const handleOpenPlaylist = (playlist) => {
    try {
      toast.success(`Mở playlist: ${playlist?.title ?? "Playlist"}`);
      console.log("[PlaylistsPageContent] Open playlist:", playlist);

      // TODO (sau này): navigate tới /playlists/:id hoặc mở trang chi tiết playlist
    } catch (err) {
      console.error("[PlaylistsPageContent] handleOpenPlaylist failed:", err);
      toast.error("Mở playlist thất bại.");
    }
  };

  const handleCreatePlaylist = async ({ name, description }) => {
    // Nếu muốn bắt đăng nhập khi tạo playlist:
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để tạo playlist.");
      console.warn("[PlaylistsPageContent] Missing accessToken.");
      onRequireLogin?.();
      return;
    }

    try {
      // Mock create (tạm thời)
      const newItem = {
        id: `pl-${Date.now()}`,
        title: name,
        description: description || "",
        songsCount: 0,
        coverUrl: "",
      };

      setItems((prev) => [newItem, ...(Array.isArray(prev) ? prev : [])]);

      toast.success("Tạo playlist thành công!");
      console.log("[PlaylistsPageContent] Created playlist:", newItem);
    } catch (err) {
      console.error("[PlaylistsPageContent] create playlist failed:", err);
      toast.error("Tạo playlist thất bại.");
      throw err; // để dialog hiển thị error nếu cần
    }
  };

  return (
    <div className="space-y-6">
      <PlaylistsHeader title="Playlist" subtitle="CỦA TÔI" />

      <PlaylistsGrid
        items={items}
        onCreateClick={openCreate}
        onOpenPlaylist={handleOpenPlaylist}
      />

      <CreatePlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreatePlaylist}
      />
    </div>
  );
}
