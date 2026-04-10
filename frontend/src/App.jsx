import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import AppProviders from "@/components/app/AppProviders";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import LoginDialog from "@/components/auth/LoginDialog";
import RegisterDialog from "@/components/auth/RegisterDialog";
import AddToPlaylistDialog from "@/components/playlist/AddToPlaylistDialog";
import GlobalAudioPlayer from "@/components/player/GlobalAudioPlayer";

import AppRouter from "@/router/AppRouter";

import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { usePlayer } from "@/hooks/usePlayer";

export default function App() {
  return (
    <AppProviders>
      <AppInner />
    </AppProviders>
  );
}

function AppInner() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const { user, logout } = useAuthStore();
  useAuth(); // Auto-fetch user

  const { handlePlaySong } = usePlayer();

  const navigate = useNavigate();
  const location = useLocation();

  const navMap = useMemo(
    () => ({
      discover: "/",
      zingchart: "/zingchart",
      uploads: "/uploads",
      library: "/library",
      history: "/library?tab=history",
      favorites: "/library?tab=liked",
      playlists: "/library?tab=playlists",
      "new-chart": "/new-releases",
      genres: "/genres",
    }),
    []
  );

  const activeNavKey = useMemo(() => {
    const p = location.pathname;

    if (p.startsWith("/uploads")) return "uploads";
    if (p.startsWith("/zingchart")) return "zingchart";
    if (p.startsWith("/library")) {
      const sp = new URLSearchParams(location.search);
      const t = sp.get("tab");
      if (t === "playlists") return "playlists";
      if (t === "history") return "history";
      if (t === "liked") return "favorites";
      if (t === "uploads") return "uploads";
      return "library";
    }

    if (p.startsWith("/history")) return "history";
    if (p.startsWith("/favorites")) return "favorites";
    if (p.startsWith("/new-releases")) return "new-chart";
    if (p.startsWith("/genres")) return "genres";
    return "discover";
  }, [location.pathname, location.search]);

  const handleNavigate = (key) => {
    const to = navMap[key];
    if (!to) {
      toast.error(`Chưa cấu hình route cho menu: ${key}`);
      return;
    }
    const current = `${location.pathname}${location.search}`;
    if (current === to) return;
    navigate(to);
  };

  const handleLogoutClick = () => {
    logout(); // uses Zustand store logic
    window.dispatchEvent(new Event("auth:changed"));
    navigate("/");
    toast.success("Đã đăng xuất.");
  };

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
          onLogoutClick={handleLogoutClick}
          onUpgradeClick={() => console.log("[App] Upgrade")}
          onDownloadClick={() => console.log("[App] Download")}
          onSettingsClick={() => console.log("[App] Settings")}
          onSelectSong={(song) => console.log("[App] Selected song:", song)}
        />
      }
    >
      <AppRouter 
        onLogin={() => setLoginOpen(true)} 
        onPlaySong={handlePlaySong} 
        onNavigate={handleNavigate}
      />

      <GlobalAudioPlayer />

      {loginOpen && (
        <LoginDialog
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSwitchRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
          onSuccess={() => {
            setLoginOpen(false);
            window.dispatchEvent(new Event("auth:changed")); // sync Library
          }}
        />
      )}

      {registerOpen && (
        <RegisterDialog
          open={registerOpen}
          onOpenChange={setRegisterOpen}
          onSwitchLogin={() => {
            setRegisterOpen(false);
            setLoginOpen(true);
          }}
          onSuccess={() => {
            setRegisterOpen(false);
            window.dispatchEvent(new Event("auth:changed")); // sync Library
          }}
        />
      )}

      <AddToPlaylistDialog />
    </AppShell>
  );
}
