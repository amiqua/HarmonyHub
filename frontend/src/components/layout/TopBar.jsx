import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Search, Settings, Crown, Moon, Sun, User2, LogOut } from "lucide-react";
import useTheme from "@/hooks/useTheme";
import { http } from "@/lib/http";

export default function TopBar({
  user,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  onUpgradeClick,
  onDownloadClick,
  onSettingsClick,
  onProfileClick,
  onSelectSong,
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { theme, toggleTheme } = useTheme();
  const hasQuery = useMemo(() => q.trim().length > 0, [q]);

  // Click outside listener for menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickSafe = useCallback((fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        return;
      }
      fn();
      if (okMsg) toast.success(okMsg);
    } catch (err) {
      console.error(`[TopBar] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  }, []);

  const submitSearch = useCallback(async () => {
    if (!hasQuery) return;
    setLoading(true);
    setOpen(true);
    try {
      const res = await http.get("/songs", { params: { page: 1, limit: 8, q: q.trim() } });
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setResults(data);
    } catch (err) {
      toast.error("Tìm kiếm thất bại.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [hasQuery, q]);

  const handleSelectSong = (song) => {
    setOpen(false);
    setQ("");
    if (onSelectSong) onSelectSong(song);
  };

  const displayName = user?.username || user?.email || "User";
  const fallbackChar = (displayName?.[0] || "U").toUpperCase();

  return (
    <div className="topbar">
      
      {/* Search Bar */}
      <div className="topbar__search">
        <form onSubmit={(e) => { e.preventDefault(); submitSearch(); }}>
          <Search className="topbar__search-icon" />
          <input
            className="topbar__search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm bài hát, nghệ sĩ..."
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
          />
          <button type="submit" className="topbar__search-btn">
            <Search />
          </button>
        </form>

        {open && q.trim().length > 0 && (
          <div className="topbar__results" data-state="open">
            <div className="topbar__results-header">
              <span>Kết quả tìm kiếm cho "{q}"</span>
            </div>
            <div className="topbar__results-divider" />
            <div className="topbar__results-list">
              {loading ? (
                <div className="topbar__results-empty">Đang tìm kiếm...</div>
              ) : results.length === 0 ? (
                <div className="topbar__results-empty">Không tìm thấy bài hát.</div>
              ) : (
                results.map((song) => (
                  <button 
                    key={song.id} 
                    className="topbar__result-item"
                    onClick={() => handleSelectSong(song)}
                  >
                    <div className="topbar__result-info">
                      <div className="topbar__result-title">{song.title}</div>
                      <div className="topbar__result-artist">{song.artist}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="topbar__actions">
        <button 
          className="topbar__download-btn"
          onClick={() => handleClickSafe(onDownloadClick, null, "Chưa hỗ trợ.", "Download")}
        >
          Tải bản Windows
        </button>

        <button className="topbar__action-btn" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>

        <button className="topbar__action-btn" onClick={onSettingsClick}>
          <Settings />
        </button>

        <button 
          className="topbar__upgrade-btn"
          onClick={() => handleClickSafe(onUpgradeClick, null, "Chưa hỗ trợ.", "Upgrade")}
        >
          <Crown />
          <span>Premium</span>
        </button>

        <div className="topbar__auth">
          {user ? (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button className="topbar__user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="avatar avatar--sm">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" />
                  ) : (
                    <div className="avatar__fallback">{fallbackChar}</div>
                  )}
                </div>
                <span className="topbar__username">{displayName}</span>
              </button>

              {menuOpen && (
                <div className="dropdown-content" data-state="open" style={{ position: "absolute", right: 0, top: "48px" }}>
                  <div className="dropdown-label">{user?.email || "Account"}</div>
                  <div className="dropdown-separator" />
                  
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); if(onProfileClick) onProfileClick(); }}>
                    <User2 /> Hồ sơ
                  </button>
                  <button className="dropdown-item" onClick={() => { setMenuOpen(false); if(onSettingsClick) onSettingsClick(); }}>
                    <Settings /> Cài đặt
                  </button>
                  
                  <div className="dropdown-separator" />
                  
                  <button 
                    className="dropdown-item dropdown-item--danger" 
                    onClick={() => {
                      setMenuOpen(false);
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("refreshToken");
                      if(onLogoutClick) onLogoutClick();
                    }}
                  >
                    <LogOut /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="topbar__register-btn" onClick={onRegisterClick}>Đăng ký</button>
              <button className="topbar__login-btn" onClick={onLoginClick}>Đăng nhập</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
