// FILE: src/pages/LibraryPage.jsx
// CHÚ THÍCH:
// - Page route cho "/library".
// - Giữ page thật mỏng: chỉ mount LibraryPageContent (layout + data nằm ở component content).

import LibraryPageContent from "@/components/library/LibraryPageContent";

export default function LibraryPage({ onLogin, onPlaySong, onSelectPlaylist }) {
  return (
    <LibraryPageContent
      onLogin={onLogin}
      onPlaySong={onPlaySong}
      onSelectPlaylist={onSelectPlaylist}
    />
  );
}
