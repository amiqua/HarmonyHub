import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "@/pages/HomePage";
import UploadsPage from "@/pages/UploadsPage";
import ZingChartPage from "@/pages/ZingChartPage";
import LibraryPage from "@/pages/LibraryPage";
import NewReleasesPage from "@/pages/NewReleasesPage";
import GenresPage from "@/pages/GenresPage";

import { useAuthStore } from "@/store/authStore";

export default function AppRouter({ onLogin, onPlaySong, onNavigate }) {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            onLogin={onLogin}
            onPlaySong={onPlaySong}
            onGoZingChart={() => onNavigate("zingchart")}
          />
        }
      />
      <Route
        path="/uploads"
        element={
          <UploadsPage
            user={user}
            onRequireLogin={onLogin}
            onPlaySong={onPlaySong}
          />
        }
      />

      <Route
        path="/zingchart"
        element={
          <ZingChartPage
            onRequireLogin={onLogin}
            onPlaySong={onPlaySong}
          />
        }
      />
      <Route
        path="/library"
        element={
          <LibraryPage
            user={user}
            onLogin={onLogin}
            onPlaySong={onPlaySong}
            onSelectPlaylist={(pl) => console.log("[Router] Select playlist:", pl)}
          />
        }
      />

      <Route
        path="/new-releases"
        element={
          <NewReleasesPage
            onRequireLogin={onLogin}
            onPlaySong={onPlaySong}
          />
        }
      />
      <Route
        path="/genres"
        element={
          <GenresPage
            onRequireLogin={onLogin}
            onPlaySong={onPlaySong}
          />
        }
      />

      {/* Redirects */}
      <Route path="/history" element={<Navigate to="/library?tab=history" replace />} />
      <Route path="/favorites" element={<Navigate to="/library?tab=liked" replace />} />
      <Route path="/playlists/*" element={<Navigate to="/library?tab=playlists" replace />} />

      {/* 404 Catcher */}
      <Route
        path="*"
        element={
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold">404 - Không tìm thấy trang</h2>
            <p className="text-secondary">Trang bạn yêu cầu không tồn tại.</p>
          </div>
        }
      />
    </Routes>
  );
}
