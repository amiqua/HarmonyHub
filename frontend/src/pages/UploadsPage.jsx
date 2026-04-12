import UploadsPageContent from "@/components/uploads/UploadsPageContent";

export default function UploadsPage({ user, onRequireLogin, onPlaySong }) {
  return (
    <UploadsPageContent 
      user={user} 
      onRequireLogin={onRequireLogin} 
      onPlaySong={onPlaySong} 
    />
  );
}


