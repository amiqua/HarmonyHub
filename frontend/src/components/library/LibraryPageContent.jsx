import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCcw, LogIn } from "lucide-react";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Tabs theo UI của bạn
const TABS = [
  { key: "liked", label: "Bài hát yêu thích" },
  { key: "playlists", label: "Playlist" },
  { key: "history", label: "Nghe gần đây" },
  { key: "uploads", label: "Đã tải lên" },
];

/**
 * LibraryPageContent
 * - Gắn API thật cho trang Thư viện (4 tab)
 * - Không đổi .env
 * - Tránh lỗi /api/v1/api/v1 bằng safePath()
 *
 * Props:
 * - onPlaySong?(song)
 * - onSelectSong?(song)
 * - onSelectPlaylist?(playlist)
 * - onLogin?()             // nếu muốn bật login dialog
 *
 * OPTIONAL: nếu backend bạn khác endpoint, sửa trong DEFAULT_API bên dưới.
 */
export default function LibraryPageContent({
  onPlaySong,
  onSelectSong,
  onSelectPlaylist,
  onLogin,
  className,
}) {
  const [tab, setTab] = useState("playlists");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);
  const [uploadedSongs, setUploadedSongs] = useState([]);

  const errorToastedRef = useRef(false);

  const hasToken = useMemo(
    () => Boolean(localStorage.getItem("accessToken")),
    []
  );

  // ========= QUAN TRỌNG: tránh double /api/v1 =========
  const safePath = (path) => {
    const p = String(path || "").trim();
    if (!p) return "";

    // baseURL của axios instance (nếu có)
    const base = String(http?.defaults?.baseURL || "");

    const baseHasV1 = base.includes("/api/v1");
    const pathHasV1 = p.startsWith("/api/v1");

    // Nếu baseURL đã có /api/v1, thì KHÔNG được truyền /api/v1 nữa
    if (baseHasV1 && pathHasV1) return p.replace(/^\/api\/v1/, "") || "/";

    // Nếu baseURL KHÔNG có /api/v1, mà path chưa có, thì thêm vào
    if (!baseHasV1 && !pathHasV1) {
      return `/api/v1${p.startsWith("/") ? p : `/${p}`}`;
    }

    // Còn lại giữ nguyên
    return p.startsWith("/") ? p : `/${p}`;
  };

  // ========= DEFAULT API (bạn đổi lại nếu backend khác) =========
  const DEFAULT_API = useMemo(
    () => ({
      // Gợi ý phổ biến:
      // - liked:   GET /favorites/songs  (auth)
      // - history: GET /history          (auth)
      // - uploads: GET /songs/me         (auth)
      //
      // Nếu backend bạn đang có endpoint khác, chỉ cần sửa 4 dòng này.
      liked: "/favorites/songs",
      playlists: "/playlists", // hoặc "/playlists/me"
      history: "/history",
      uploads: "/songs/me",
    }),
    []
  );

  const normalizeSong = (s) => {
    const title = s?.title ?? s?.name ?? "Untitled";
    const artist =
      s?.artist ??
      s?.artist_name ??
      (Array.isArray(s?.artists)
        ? s.artists
            .map((a) => a?.name ?? a)
            .filter(Boolean)
            .join(", ")
        : "") ??
      "";

    const coverUrl =
      s?.cover_url ?? s?.image_url ?? s?.thumbnail ?? s?.thumbnail_url ?? "";

    // audio url (tuỳ backend)
    const audioUrl = s?.audio_url ?? s?.file_url ?? s?.url ?? s?.song_url ?? "";

    return { ...s, title, artist, coverUrl, audioUrl };
  };

  const normalizePlaylist = (p) => {
    const title = p?.title ?? p?.name ?? "Untitled";
    const subtitle =
      p?.subtitle ??
      p?.description ??
      (typeof p?.songs_count === "number"
        ? `${p.songs_count} bài`
        : (p?.type ?? ""));
    const coverUrl =
      p?.cover_url ?? p?.image_url ?? p?.thumbnail ?? p?.coverUrl ?? "";
    return { ...p, title, subtitle, coverUrl };
  };

  const fetchTabData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      // Nếu tab cần auth mà chưa có token => show empty + nút login
      const needAuthTabs = ["liked", "playlists", "history", "uploads"];
      if (needAuthTabs.includes(tab) && !hasToken) {
        // Không coi là lỗi
        errorToastedRef.current = false;
        if (!silent) toast.message("Đăng nhập để xem Thư viện.");
        return;
      }

      let path = "";
      let params = { page: 1, limit: 50 };

      if (tab === "liked") path = DEFAULT_API.liked;
      if (tab === "playlists") path = DEFAULT_API.playlists;
      if (tab === "history") path = DEFAULT_API.history;
      if (tab === "uploads") path = DEFAULT_API.uploads;

      const res = await http.get(safePath(path), { params });
      const payload = res?.data;

      const list = Array.isArray(payload?.data) ? payload.data : [];

      if (tab === "liked") setLikedSongs(list.map(normalizeSong));
      if (tab === "history") setHistorySongs(list.map(normalizeSong));
      if (tab === "uploads") setUploadedSongs(list.map(normalizeSong));
      if (tab === "playlists") setPlaylists(list.map(normalizePlaylist));

      errorToastedRef.current = false;
    } catch (err) {
      console.error("[LibraryPageContent] Fetch failed:", {
        tab,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        baseURL: http?.defaults?.baseURL,
      });

      if (!errorToastedRef.current) {
        errorToastedRef.current = true;
        toast.error("Tải dữ liệu thư viện thất bại. Vui lòng thử lại.");
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleRefresh = async () => {
    errorToastedRef.current = false;
    await fetchTabData({ silent: true });
    toast.success("Đã làm mới.");
  };

  const handleLogin = () => {
    toast.message("Bạn cần đăng nhập.");
    onLogin?.();
  };

  const handleCreatePlaylist = () => {
    // TODO: nếu backend có POST /playlists thì bạn gắn vào đây
    toast.message("TODO: Mở modal tạo playlist.");
    console.log("[Library] create playlist");
  };

  const currentList = useMemo(() => {
    if (tab === "liked") return likedSongs;
    if (tab === "history") return historySongs;
    if (tab === "uploads") return uploadedSongs;
    if (tab === "playlists") return playlists;
    return [];
  }, [tab, likedSongs, historySongs, uploadedSongs, playlists]);

  const renderEmpty = () => {
    // chưa đăng nhập
    if (!hasToken) {
      return (
        <div className="rounded-2xl border border-border/60 bg-card/30 p-8">
          <div className="text-lg font-semibold">Bạn chưa đăng nhập</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Đăng nhập để xem và quản lý Thư viện của bạn.
          </div>
          <div className="mt-4">
            <Button onClick={handleLogin} className="gap-2 rounded-full">
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </Button>
          </div>
        </div>
      );
    }

    // playlist rỗng => có nút tạo
    if (tab === "playlists") {
      return (
        <div className="rounded-2xl border border-border/60 bg-card/30 p-8">
          <div className="text-lg font-semibold">Chưa có playlist</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Tạo playlist để lưu các bài hát bạn thích.
          </div>
          <div className="mt-4">
            <Button
              onClick={handleCreatePlaylist}
              className="gap-2 rounded-full"
            >
              <Plus className="h-4 w-4" />
              Tạo playlist
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-border/60 bg-card/30 p-8 text-sm text-muted-foreground">
        Không có dữ liệu.
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      );
    }

    if (!Array.isArray(currentList) || currentList.length === 0) {
      return renderEmpty();
    }

    // render playlists
    if (tab === "playlists") {
      return (
        <div className="space-y-2">
          {currentList.map((pl, idx) => (
            <button
              key={pl?.id ?? `pl-${idx}`}
              type="button"
              className={cn(
                "w-full text-left rounded-2xl border border-border/60 bg-card/30 px-4 py-3",
                "hover:bg-accent/40 transition"
              )}
              onClick={() => onSelectPlaylist?.(pl)}
              title={pl?.title}
            >
              <div className="font-semibold truncate">
                {pl?.title ?? "Untitled"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {pl?.subtitle ?? "Playlist"}
              </div>
            </button>
          ))}
        </div>
      );
    }

    // render songs (liked/history/uploads)
    return (
      <div className="space-y-2">
        {currentList.map((song, idx) => (
          <div
            key={song?.id ?? `song-${idx}`}
            className={cn(
              "rounded-2xl border border-border/60 bg-card/30 px-4 py-3",
              "flex items-center justify-between gap-3"
            )}
          >
            <button
              type="button"
              className="min-w-0 text-left"
              onClick={() => onSelectSong?.(song)}
              title={song?.title}
            >
              <div className="truncate font-semibold">
                {song?.title ?? "Untitled"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {song?.artist ?? ""}
              </div>
            </button>

            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => {
                // quan trọng: onPlaySong phải nhận được audioUrl nếu player cần
                onPlaySong?.(song);
              }}
            >
              Phát
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">Thư Viện</h1>

          {/* Tabs */}
          <div className="mt-4 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Button
                  key={t.key}
                  type="button"
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "rounded-xl",
                    active && "ring-1 ring-border/60"
                  )}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Refresh */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={handleRefresh}
          title="Làm mới"
          aria-label="Refresh"
        >
          <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Content */}
      {renderContent()}
    </section>
  );
}
