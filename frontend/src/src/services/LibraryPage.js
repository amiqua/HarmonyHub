import LibraryPageContent from "@/components/library/LibraryPageContent";

export default function LibraryPage({ onPlaySong }) {
  return (
    <LibraryPageContent
      onPlaySong={onPlaySong}
      onSelectSong={(song) => console.log("[Library] select song", song)}
      onSelectPlaylist={(pl) => console.log("[Library] select playlist", pl)}
    />
  );
}
