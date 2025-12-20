// FILE: src/App.jsx
// Root layout + Router (Routes) cho toàn app.
// - BrowserRouter nằm ở main.jsx
// - Toaster nằm ở AppProviders
// - GlobalAudioPlayer: phát nhạc thật bằng <audio> (song.audio_url)
// - Khi play song -> ghi "Nghe gần đây" bằng addSongToHistory(songId)

import { useEffect, useMemo, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AppProviders from "@/components/app/AppProviders";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import LoginDialog from "@/components/auth/LoginDialog";

import GlobalAudioPlayer from "@/components/player/GlobalAudioPlayer";

import { addSongToHistory } from "@/services/history.api";

import HomePage from "@/pages/HomePage";
import UploadsPage from "@/pages/UploadsPage";
import ZingChartPage from "@/pages/ZingChartPage";
import LibraryPage from "@/pages/LibraryPage";
import HistoryPage from "@/pages/HistoryPage";
import FavoritesPage from "@/pages/FavoritesPage";
import PlaylistsPage from "@/pages/PlaylistsPage";
import NewReleasesPage from "@/pages/NewReleasesPage";
import GenresPage from "@/pages/GenresPage";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  // ✅ Global nowPlaying (dùng cho mọi trang)
  const [nowPlaying, setNowPlaying] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Map key từ Sidebar -> route
  const navMap = useMemo(
    () => ({
      discover: "/",
      zingchart: "/zingchart",
      uploads: "/uploads",
      library: "/library",

      recent: "/history",
      history: "/history",

      favorites: "/favorites",
      playlists: "/playlists",

      "new-chart": "/new-releases",
      genres: "/genres",
    }),
    []
  );

  const activeNavKey = useMemo(() => {
    const p = location.pathname;

    if (p.startsWith("/uploads")) return "uploads";
    if (p.startsWith("/zingchart")) return "zingchart";
    if (p.startsWith("/library")) return "library";
    if (p.startsWith("/history")) return "recent";
    if (p.startsWith("/favorites")) return "favorites";
    if (p.startsWith("/playlists")) return "playlists";
    if (p.startsWith("/new-releases")) return "new-chart";
    if (p.startsWith("/genres")) return "genres";

    return "discover";
  }, [location.pathname]);

  const handleNavigate = (key) => {
    const to = navMap[key];

    if (!to) {
      toast.error(`Chưa cấu hình route cho menu: ${key}`);
      console.error("[App] Missing navMap for key:", key, navMap);
      return;
    }

    if (location.pathname === to) return;

    navigate(to);
    toast.success("Điều hướng thành công.");
  };

  // ✅ Hàm phát nhạc thật + ghi lịch sử "Nghe gần đây"
  const handlePlaySong = (song) => {
    try {
      if (!song?.audio_url) {
        console.warn("[App] Missing audio_url in song:", song);
        toast.error("Bài hát này chưa có audio_url để phát.");
        return;
      }

      // 1) phát nhạc
      setNowPlaying(song);
      toast.success(`Đang phát: ${song?.title ?? "Bài hát"}`);

      // 2) ghi lịch sử (không chặn playback)
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // chưa login thì bỏ qua

      const songId = song?.id;
      if (!songId) return;

      addSongToHistory(songId).catch((err) => {
        // Không toast lỗi để tránh spam khi user nghe nhạc
        console.warn(
          "[App] addSongToHistory failed:",
          err?.response?.data || err
        );
      });
    } catch (err) {
      console.error("[App] handlePlaySong failed:", err);
      toast.error("Phát bài hát thất bại.");
    }
  };

  useEffect(() => {
    console.log("[App] Path:", location.pathname);
  }, [location.pathname]);

  return (
    <AppProviders>
      <AppShell
        sidebar={
          <Sidebar
            activeNavKey={activeNavKey}
            onNavigate={handleNavigate}
            onSelectPlaylist={(id) => console.log("[App] Select playlist:", id)}
            onUpgradeClick={() => console.log("[App] Upgrade")}
          />
        }
        topbar={
          <TopBar
            onLoginClick={() => setLoginOpen(true)}
            onUpgradeClick={() => console.log("[App] Upgrade")}
            onDownloadClick={() => console.log("[App] Download")}
            onSettingsClick={() => console.log("[App] Settings")}
            onSelectSong={(song) => {
              console.log("[App] Selected song:", song);
              // (tuỳ bạn) nếu chọn bài từ search muốn phát luôn:
              // handlePlaySong(song);
            }}
          />
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onLogin={() => setLoginOpen(true)}
                onPlaySong={handlePlaySong}
              />
            }
          />

          <Route
            path="/uploads"
            element={
              <UploadsPage
                onRequireLogin={() => setLoginOpen(true)}
                onPlaySong={handlePlaySong}
              />
            }
          />

          <Route
            path="/zingchart"
            element={
              <ZingChartPage
                onRequireLogin={() => setLoginOpen(true)}
                onPlaySong={handlePlaySong}
              />
            }
          />

          <Route path="/library" element={<LibraryPage />} />

          <Route
            path="/history"
            element={<HistoryPage onRequireLogin={() => setLoginOpen(true)} />}
          />

          <Route
            path="/favorites"
            element={
              <FavoritesPage
                onRequireLogin={() => setLoginOpen(true)}
                onPlaySong={handlePlaySong}
              />
            }
          />

          <Route
            path="/playlists"
            element={
              <PlaylistsPage onRequireLogin={() => setLoginOpen(true)} />
            }
          />

          <Route
            path="/new-releases"
            element={
              <NewReleasesPage onRequireLogin={() => setLoginOpen(true)} />
            }
          />

          <Route path="/genres" element={<GenresPage />} />

          <Route
            path="*"
            element={
              <div className="p-6">
                <div className="text-xl font-semibold">404</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Không tìm thấy trang:{" "}
                  <span className="font-mono">{location.pathname}</span>
                </div>
              </div>
            }
          />
        </Routes>

        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSuccess={({ user }) => {
            console.log("[App] Logged in user:", user);
            toast.success("Đăng nhập thành công!");
          }}
        />

        {/* ✅ Player thật: phát nhạc bằng audio_url */}
        <GlobalAudioPlayer song={nowPlaying} />
      </AppShell>
    </AppProviders>
  );
}
