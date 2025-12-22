// FILE: src/pages/PlaylistsPage.jsx
// CHÚ THÍCH:
// - Page wrapper cho route "/playlists".
// - Chỉ mount PlaylistsPageContent đúng cấu trúc dự án của bạn.
// - Truyền onRequireLogin xuống dưới (App.jsx sẽ truyền handler mở LoginDialog).

import PlaylistsPageContent from "@/components/playlist/PlaylistsPageContent";

/**
 * Props:
 * - onRequireLogin?: () => void
 */
export default function PlaylistsPage({ onRequireLogin }) {
  return (
    <div className="p-6">
      <PlaylistsPageContent onRequireLogin={onRequireLogin} />
    </div>
  );
}
