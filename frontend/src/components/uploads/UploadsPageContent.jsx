import { useState } from "react";
import { toast } from "sonner";

import UploadSongCard from "@/components/uploads/UploadSongCard";
import UploadsSongsList from "@/components/uploads/UploadsSongsList";

/**
 * UploadsPageContent
 * - Ghép UI trang Uploads:
 *   1) UploadSongCard (upload 1 bước)
 *   2) UploadsSongsList (list bài đã upload)
 *
 * - Nối sự kiện:
 *   UploadSongCard -> onUploaded(song) => refresh list
 *
 * Cách refresh tối ưu ít đụng chạm:
 * - Tăng `refreshKey` để remount UploadsSongsList => tự fetch lại /users/me + /songs
 *
 * Props (optional):
 * - onRequireLogin?: () => void  // nếu bạn muốn mở LoginDialog khi cần
 */
export default function UploadsPageContent({ onRequireLogin }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedSongId, setSelectedSongId] = useState(null);

  const handleUploaded = (createdSong) => {
    // UploadSongCard đã toast success rồi, ở đây chỉ log + refresh list
    console.log("[UploadsPageContent] Uploaded song:", createdSong);

    // highlight item vừa upload (nếu list có id)
    if (createdSong?.id != null) setSelectedSongId(createdSong.id);

    // refresh list bằng cách remount
    setRefreshKey((k) => k + 1);

    toast.success("Đã cập nhật danh sách bài hát đã upload.");
  };

  return (
    <div className="space-y-6">
      <UploadSongCard onUploaded={handleUploaded} />

      <UploadsSongsList
        key={refreshKey}
        selectedSongId={selectedSongId}
        onSelectSong={(song) => {
          console.log("[UploadsPageContent] Select song:", song);
          setSelectedSongId(song?.id ?? null);
        }}
        onPlaySong={(song) =>
          console.log("[UploadsPageContent] Play song:", song)
        }
        onDeleted={(song) => {
          console.log("[UploadsPageContent] Deleted song:", song);
          toast.success("Đã xoá và cập nhật danh sách.");
        }}
        onRequireLogin={() => {
          toast.error("Bạn cần đăng nhập để thao tác.");
          onRequireLogin?.();
        }}
      />
    </div>
  );
}
