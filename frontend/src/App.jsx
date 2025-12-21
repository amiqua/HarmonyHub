import { useEffect, useMemo, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate, // ✅ NEW (redirect /playlists -> /library?tab=playlists)
} from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query"; // ✅ dùng trong AppInner

import AppProviders from "@/components/app/AppProviders";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import LoginDialog from "@/components/auth/LoginDialog";
import RegisterDialog from "@/components/auth/RegisterDialog";

import GlobalAudioPlayer from "@/components/player/GlobalAudioPlayer";

import { addSongToHistory } from "@/services/history.api";

import HomePage from "@/pages/HomePage";
import UploadsPage from "@/pages/UploadsPage";
import ZingChartPage from "@/pages/ZingChartPage";
import LibraryPage from "@/pages/LibraryPage";
import HistoryPage from "@/pages/HistoryPage";
import FavoritesPage from "@/pages/FavoritesPage";
import NewReleasesPage from "@/pages/NewReleasesPage";
import GenresPage from "@/pages/GenresPage";

export default function App() {
  // ✅ Provider bọc ngoài, KHÔNG dùng useQueryClient ở đây
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}

function AppInner() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [nowPlaying, setNowPlaying] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient(); // ✅ giờ OK vì nằm trong AppProviders

  const navMap = useMemo(
    () => ({
      discover: "/",
      zingchart: "/zingchart",
      uploads: "/uploads",
      library: "/library",
      history: "/history",
      favorites: "/favorites",
      playlists: "/library?tab=playlists", // ✅ playlists nằm trong Library

      "new-chart": "/new-releases",
      genres: "/genres",
    }),
    []
  );

  const activeNavKey = useMemo(() => {
    const p = location.pathname;

    if (p.startsWith("/uploads")) return "uploads";
    if (p.startsWith("/zingchart")) return "zingchart";

    // ✅ NEW: /library?tab=playlists => active "playlists"
    if (p.startsWith("/library")) {
      const sp = new URLSearchParams(location.search);
      const t = sp.get("tab");
      if (t === "playlists") return "playlists";
      return "library";
    }

    if (p.startsWith("/history")) return "history";
    if (p.startsWith("/favorites")) return "favorites";

    if (p.startsWith("/new-releases")) return "new-chart";
    if (p.startsWith("/genres")) return "genres";
    return "discover";
  }, [location.pathname, location.search]); // ✅ NEW: include search

  const handleNavigate = (key) => {
    const to = navMap[key];

    if (!to) {
      toast.error(`Chưa cấu hình route cho menu: ${key}`);
      console.error("[App] Missing navMap for key:", key, navMap);
      return;
    }

    // ✅ NEW: so sánh cả search (vì /library?tab=playlists)
    const current = `${location.pathname}${location.search}`;
    if (current === to) return;

    navigate(to);
    toast.success("Điều hướng thành công.");
  };

  const handlePlaySong = (song) => {
    try {
      if (!song?.audio_url) {
        toast.error("Bài hát này chưa có audio_url để phát.");
        return;
      }

      setNowPlaying(song);
      toast.success(`Đang phát: ${song?.title ?? "Bài hát"}`);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return; // Hướng A: chưa login thì không lưu history

      const songId = song?.id;
      if (!songId) return;

      // ✅ Realtime: thông báo cho trang /history đẩy bài này lên đầu ngay
      window.dispatchEvent(
        new CustomEvent("history:played", {
          detail: {
            songId,
            song,
            played_at: new Date().toISOString(),
          },
        })
      );

      // helper: lấy song_id từ row bất kỳ
      const getSongKey = (r) => r?.song_id ?? r?.songId ?? r?.id ?? null;

      const upsertToTop = (arr, row) => {
        const k = getSongKey(row);
        if (!k) return arr;

        const filtered = (arr ?? []).filter((x) => getSongKey(x) !== k);
        return [row, ...filtered];
      };

      addSongToHistory(songId)
        .then((saved) => {
          // tạo "row" giống listMine đang trả về
          const row = {
            id: saved?.id ?? `tmp-${songId}`,
            played_at: saved?.played_at ?? new Date().toISOString(),
            duration_listened: saved?.duration_listened ?? null,

            song_id: songId,
            title: song?.title ?? "Bài hát",
            duration: song?.duration ?? null,
            audio_url: song?.audio_url ?? null,
            release_date: song?.release_date ?? null,
          };

          // ✅ cập nhật cache ngay lập tức cho mọi query bắt đầu bằng ["history","me"]
          qc.setQueriesData({ queryKey: ["history", "me"] }, (old) => {
            // old có thể là array hoặc object {rows,total}
            if (Array.isArray(old)) return upsertToTop(old, row);

            const rows = Array.isArray(old?.rows) ? old.rows : null;
            if (rows) return { ...old, rows: upsertToTop(rows, row) };

            // chưa có cache -> tạo mới
            return [row];
          });

          // ✅ đồng bộ lại từ server (để lấy đúng total/field chuẩn)
          qc.invalidateQueries({ queryKey: ["history", "me"] });
        })
        .catch((err) => {
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
          user={user}
          onLoginClick={() => setLoginOpen(true)}
          onRegisterClick={() => setRegisterOpen(true)}
          onLogoutClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
            navigate("/");
            toast.success("Đã đăng xuất.");
          }}
          onUpgradeClick={() => console.log("[App] Upgrade")}
          onDownloadClick={() => console.log("[App] Download")}
          onSettingsClick={() => console.log("[App] Settings")}
          onSelectSong={(song) => console.log("[App] Selected song:", song)}
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
              onGoZingChart={() => handleNavigate("zingchart")}
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

        {/* ✅ NEW: gợi ý 1 — /playlists chuyển về tab playlists trong Library */}
        <Route
          path="/playlists/*"
          element={<Navigate to="/library?tab=playlists" replace />}
        />

        <Route
          path="/new-releases"
          element={
            <NewReleasesPage onRequireLogin={() => setLoginOpen(true)} />
          }
        />

        <Route path="/genres" element={<GenresPage />} />
      </Routes>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={({ user }) => {
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user ?? null));
          setLoginOpen(false);
          toast.success("Đăng nhập thành công!");
          qc.invalidateQueries({ queryKey: ["history", "me"] });
        }}
      />

      <RegisterDialog
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSuccess={({ user }) => {
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user ?? null));
          setRegisterOpen(false);
          toast.success("Đăng ký thành công!");
          qc.invalidateQueries({ queryKey: ["history", "me"] });
        }}
      />

      <GlobalAudioPlayer song={nowPlaying} />
    </AppShell>
  );
}
