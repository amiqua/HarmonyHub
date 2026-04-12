// FILE: src/components/layout/Sidebar.jsx

import { useMemo } from "react";
import { toast } from "sonner";
import {
  Compass,
  Hash,
  Radio,
  Library,
  Clock,
  Heart,
  ListMusic,
  Upload,
  Music2,
  LayoutGrid,
  Crown,
} from "lucide-react";

import { cn } from "@/lib/utils";

export default function Sidebar({
  brand,
  navItems,
  playlists,
  activeNavKey,
  activePlaylistId,
  onNavigate,
  onSelectPlaylist,
  onUpgradeClick,
}) {
  const defaultBrand = useMemo(
    () => ({
      name: "Melodiaverse",
      logoUrl: "", 
    }),
    []
  );

  const defaultNavItems = useMemo(
    () => [
      { key: "discover", label: "Khám Phá", icon: <Compass />, group: "main" },
      { key: "zingchart", label: "#zingchart", icon: <Hash />, group: "main" },
      { key: "radio", label: "Phòng Nhạc", icon: <Radio />, live: true, group: "main" },
      { key: "library", label: "Thư Viện", icon: <Library />, group: "main" },
      { key: "uploads", label: "Đã tải lên", icon: <Upload />, group: "main" },
      { key: "top100", label: "Top 100", icon: <Crown />, group: "more" },
      { key: "genres", label: "Chủ đề & Thể Loại", icon: <LayoutGrid />, group: "more" },
      { key: "new-chart", label: "BXH Nhạc Mới", icon: <Music2 />, group: "more" },

    ],
    []
  );

  const defaultPlaylists = useMemo(
    () => [
      { id: "late-night", name: "Late Night Drives" },
      { id: "morning", name: "Morning Focus" },
      { id: "rock", name: "Rock Classics" },
      { id: "vpop", name: "V-Pop Favorites" },
      { id: "summer", name: "Summer Vibes" },
    ],
    []
  );

  const b = brand ?? defaultBrand;
  const items = navItems ?? defaultNavItems;
  const pls = playlists ?? defaultPlaylists;

  const mainItems = items.filter((i) => i.group !== "more");
  const moreItems = items.filter((i) => i.group === "more");

  const safeAction = (fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[Sidebar] ${logTag}: Missing handler`);
        return;
      }
      fn();
      if (okMsg) toast.success(okMsg);
    } catch (err) {
      console.error(`[Sidebar] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const handleNavClick = (key, label) => {
    safeAction(() => onNavigate?.(key), null, `Không thể điều hướng tới: ${label}`, `Navigate(${key})`);
  };

  const handlePlaylistClick = (id, name) => {
    safeAction(() => onSelectPlaylist?.(id), null, `Không thể mở playlist: ${name}`, `SelectPlaylist(${id})`);
  };

  return (
    <div className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          {b.logoUrl ? (
            <img src={b.logoUrl} alt="logo" />
          ) : (
            <Music2 />
          )}
        </div>
        <div className="sidebar__brand-name">{b.name}</div>
      </div>

      <div className="sidebar__divider" />

      {/* Scrollable Nav Area */}
      <div className="sidebar__scroll">
        <nav className="sidebar__nav">
          {mainItems.map((it) => (
            <button
              key={it.key}
              type="button"
              className={cn("sidebar__item", activeNavKey === it.key && "sidebar__item--active")}
              onClick={() => handleNavClick(it.key, it.label)}
            >
              <div className="sidebar__item-icon">{it.icon}</div>
              <span className="sidebar__item-label">{it.label}</span>
              {it.live && (
                <span className="sidebar__item-badge">LIVE</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar__divider" />

        <nav className="sidebar__nav">
          {moreItems.map((it) => (
            <button
              key={it.key}
              type="button"
              className={cn("sidebar__item", activeNavKey === it.key && "sidebar__item--active")}
              onClick={() => handleNavClick(it.key, it.label)}
            >
              <div className="sidebar__item-icon">{it.icon}</div>
              <span className="sidebar__item-label">{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__divider" />

        {/* Playlists */}
        <div className="sidebar__playlists">
          <div className="sidebar__nav-label">PLAYLISTS</div>
          {pls.map((p) => (
            <button
              key={p.id}
              type="button"
              className={cn("sidebar__playlist-item", activePlaylistId === p.id && "sidebar__playlist-item--active")}
              onClick={() => handlePlaylistClick(p.id, p.name)}
            >
              <div className="sidebar__playlist-dot" />
              <span className="sidebar__playlist-name">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Premium upgrade pinned box */}
      <div className="sidebar__premium">
        <div className="sidebar__premium-title">
          Tận hưởng âm nhạc chất lượng cao nhất
        </div>
        <button
          className="sidebar__premium-btn"
          onClick={() => safeAction(onUpgradeClick, null, "Chưa cấu hình nâng cấp tài khoản.", "UpgradeClick")}
        >
          NÂNG CẤP
        </button>
      </div>
    </div>
  );
}
