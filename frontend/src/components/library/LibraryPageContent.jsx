// FILE: src/components/library/LibraryPageContent.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, RefreshCcw, LogIn } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { http } from "@/lib/http";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tabs theo UI của bạn
const TABS = [
  { key: "liked", label: "Bài hát yêu thích" },
  { key: "playlists", label: "Playlist" },
  { key: "history", label: "Nghe gần đây" },
  { key: "uploads", label: "Đã tải lên" },
];

/**
 * LibraryPageContent
 * - Gộp Playlist vào Library (gợi ý 1)
 * - Fix gọi sai endpoint (404) bằng cách thử nhiều endpoint
 * - Token realtime (không bị “đóng băng”) + tự refresh khi login/logout nếu App dispatch event
 * - Thêm flow tạo playlist: mở dialog -> POST create -> reload tab playlists
 *
 * Props:
 * - onPlaySong?(song)
 * - onSelectSong?(song)
 * - onSelectPlaylist?(playlist)
 * - onLogin?() // mở login dialog
 */
export default function LibraryPageContent({
  onPlaySong,
  onSelectSong,
  onSelectPlaylist,
  onLogin,
  className,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const getValidTab = (t) => (TABS.some((x) => x.key === t) ? t : "liked");

  const [tab, setTab] = useState(() => getValidTab(searchParams.get("tab")));

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [historySongs, setHistorySongs] = useState([]);
  const [uploadedSongs, setUploadedSongs] = useState([]);

  const errorToastedRef = useRef(false);

  // ✅ endpoint cache: khi tìm được endpoint đúng thì nhớ lại (đỡ thử lại nhiều lần)
  const resolvedEndpointRef = useRef({
    liked: null,
    playlists: null,
    history: null,
    uploads: null,
  });

  // ✅ token state (realtime hơn so với Boolean(localStorage.getItem()) đơn thuần)
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const hasToken = Boolean(token);

  // Nếu App.jsx có dispatch event khi login/logout thì Library tự cập nhật:
  // window.dispatchEvent(new Event("auth:changed"))
  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("accessToken"));

    const onStorage = (e) => {
      if (e.key === "accessToken") syncToken();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", syncToken);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", syncToken);
    };
  }, []);

  // ========= QUAN TRỌNG: tránh double /api/v1 =========
  const safePath = (path) => {
    const p = String(path || "").trim();
    if (!p) return "";

    const base = String(http?.defaults?.baseURL || "");
    const baseHasV1 = base.includes("/api/v1");
    const pathHasV1 = p.startsWith("/api/v1");

    if (baseHasV1 && pathHasV1) return p.replace(/^\/api\/v1/, "") || "/";
    if (!baseHasV1 && !pathHasV1) {
      return `/api/v1${p.startsWith("/") ? p : `/${p}`}`;
    }
    return p.startsWith("/") ? p : `/${p}`;
  };

  // ✅ Danh sách endpoint thử theo TAB (ưu tiên /me/... vì dự án bạn dùng nhiều)
  const ENDPOINTS = useMemo(
    () => ({
      liked: [
        // ✅ backend chuẩn của dự án: GET /favorites/me
        "/favorites/me",
        "/me/favorites/songs",
        "/me/favorites",
        "/favorites/songs",
        "/favorite-songs",
      ],
      playlists: ["/playlists/me", "/playlists"],

      history: [
        // ✅ backend chuẩn của dự án: GET /history/me
        "/history/me",
        "/me/history",
        "/history",
      ],
      uploads: ["/me/uploads", "/songs/me", "/me/songs", "/uploads"],
    }),
    []
  );

  // ✅ endpoint tạo playlist: backend bạn có POST /playlists (ổn định)
  // Nếu bạn đang chỉnh backend thêm POST /playlists/me thì file vẫn chạy vì sẽ thử lần lượt.
  const CREATE_PLAYLIST_ENDPOINTS = useMemo(
    () => ["/playlists/me", "/playlists"],
    []
  );

  // --- Helpers: xử lý data trả về có thể là Array hoặc { rows, total } ---
  function normalizeRows(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  const normalizeSong = (s) => {
    // ✅ id phải là songId (tránh history row id)
    const id = s?.song_id ?? s?.songId ?? s?.id ?? null;

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

    // ✅ quan trọng: App.jsx đang check song.audio_url để phát
    const audio_url =
      s?.audio_url ?? s?.file_url ?? s?.url ?? s?.song_url ?? "";

    return {
      ...s,
      id,
      title,
      artist,
      coverUrl,
      audio_url,
      audioUrl: audio_url,
      cover_url: s?.cover_url ?? coverUrl,
    };
  };

  const normalizePlaylist = (p) => {
    const title = p?.name ?? p?.title ?? "Untitled";
    const subtitle =
      p?.description ??
      p?.subtitle ??
      (typeof p?.songs_count === "number"
        ? `${p.songs_count} bài`
        : p?.type
          ? `Loại: ${p.type}`
          : "");

    const coverUrl =
      p?.cover_url ?? p?.image_url ?? p?.thumbnail ?? p?.coverUrl ?? "";

    return { ...p, title, subtitle, coverUrl };
  };

  // ✅ Thử lần lượt endpoint cho 1 tab. Gặp 404 thì thử endpoint khác.
  const requestFirstWorkingEndpoint = async (tabKey, params) => {
    const cached = resolvedEndpointRef.current?.[tabKey];
    const candidates = cached ? [cached] : (ENDPOINTS[tabKey] ?? []);
    let lastErr = null;

    for (const ep of candidates) {
      try {
        const url = safePath(ep);
        const res = await http.get(url, { params });
        resolvedEndpointRef.current[tabKey] = ep;
        return res;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;

        if (status === 401 || status === 403) throw err;
        if (status === 404) continue;

        throw err;
      }
    }

    // Nếu cached fail 404 và candidates chỉ có cached -> thử full list
    if (cached) {
      for (const ep of ENDPOINTS[tabKey] ?? []) {
        if (ep === cached) continue;
        try {
          const url = safePath(ep);
          const res = await http.get(url, { params });
          resolvedEndpointRef.current[tabKey] = ep;
          return res;
        } catch (err) {
          lastErr = err;
          const status = err?.response?.status;
          if (status === 401 || status === 403) throw err;
          if (status === 404) continue;
          throw err;
        }
      }
    }

    throw lastErr;
  };

  const fetchTabData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      setRefreshing(true);

      // tab nào cũng cần auth trong UI của bạn
      if (!hasToken) {
        errorToastedRef.current = false;
        if (!silent) toast.message("Đăng nhập để xem Thư viện.");
        setLikedSongs([]);
        setPlaylists([]);
        setHistorySongs([]);
        setUploadedSongs([]);
        return;
      }

      const params = { page: 1, limit: 50 };

      const res = await requestFirstWorkingEndpoint(tab, params);
      const payload = res?.data;

      // backend chuẩn dự án bạn: { success, data, meta? }
      const raw = payload?.data;
      const finalList = normalizeRows(raw);

      if (tab === "liked") setLikedSongs(finalList.map(normalizeSong));
      if (tab === "history") setHistorySongs(finalList.map(normalizeSong));
      if (tab === "uploads") setUploadedSongs(finalList.map(normalizeSong));
      if (tab === "playlists") setPlaylists(finalList.map(normalizePlaylist));

      errorToastedRef.current = false;
    } catch (err) {
      console.error("[LibraryPageContent] Fetch failed:", {
        tab,
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        baseURL: http?.defaults?.baseURL,
        triedResolved: resolvedEndpointRef.current?.[tab] ?? null,
      });

      const status = err?.response?.status;

      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onLogin?.();
        return;
      }

      if (!errorToastedRef.current) {
        errorToastedRef.current = true;
        toast.error("Tải dữ liệu thư viện thất bại. Vui lòng thử lại.");
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // sync tab <-> query param
  useEffect(() => {
    const urlTab = getValidTab(searchParams.get("tab"));
    if (urlTab !== tab) setTab(urlTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // cập nhật URL khi đổi tab (để /library?tab=playlists hoạt động ổn)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });

    fetchTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, hasToken]);

  const handleRefresh = async () => {
    errorToastedRef.current = false;
    await fetchTabData({ silent: true });
    toast.success("Đã làm mới.");
  };

  const handleLogin = () => {
    toast.message("Bạn cần đăng nhập.");
    onLogin?.();
  };

  // =========================
  // CREATE PLAYLIST (Frontend)
  // =========================
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);

  const createPlaylistRequest = async (name) => {
    let lastErr = null;

    for (const ep of CREATE_PLAYLIST_ENDPOINTS) {
      try {
        const url = safePath(ep);
        const res = await http.post(url, { name });
        // chuẩn response: { success, data }
        return res?.data?.data;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;

        if (status === 401 || status === 403) throw err;
        if (status === 404) continue;

        throw err;
      }
    }

    throw lastErr;
  };

  const handleCreatePlaylist = async () => {
    const name = createName.trim();
    if (!name) {
      toast.error("Tên playlist không được để trống.");
      return;
    }
    if (name.length > 100) {
      toast.error("Tên playlist tối đa 100 ký tự.");
      return;
    }
    if (!hasToken) {
      toast.error("Bạn cần đăng nhập để tạo playlist.");
      onLogin?.();
      return;
    }

    setCreating(true);
    try {
      const created = await createPlaylistRequest(name);
      toast.success("Tạo playlist thành công!");
      setCreateOpen(false);
      setCreateName("");

      // Nếu đang ở tab playlists -> reload để thấy ngay
      if (tab === "playlists") {
        await fetchTabData({ silent: true });
      } else {
        // nếu không ở tab playlists, vẫn có thể cập nhật nhanh state (không bắt buộc)
        setPlaylists((prev) => [normalizePlaylist(created), ...(prev ?? [])]);
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onLogin?.();
        return;
      }
      toast.error(err?.response?.data?.message ?? "Tạo playlist thất bại.");
      console.error("[LibraryPageContent] create playlist failed:", err);
    } finally {
      setCreating(false);
    }
  };

  const currentList = useMemo(() => {
    if (tab === "liked") return likedSongs;
    if (tab === "history") return historySongs;
    if (tab === "uploads") return uploadedSongs;
    if (tab === "playlists") return playlists;
    return [];
  }, [tab, likedSongs, historySongs, uploadedSongs, playlists]);

  const renderEmpty = () => {
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

    if (tab === "playlists") {
      return (
        <div className="rounded-2xl border border-border/60 bg-card/30 p-8">
          <div className="text-lg font-semibold">Chưa có playlist</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Tạo playlist để lưu các bài hát bạn thích.
          </div>
          <div className="mt-4">
            <Button
              onClick={() => setCreateOpen(true)}
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

    // songs (liked/history/uploads)
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
              onClick={() => onPlaySong?.(song)}
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

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {tab === "playlists" && hasToken ? (
            <Button
              type="button"
              variant="secondary"
              className="rounded-full gap-2"
              onClick={() => setCreateOpen(true)}
              title="Tạo playlist"
            >
              <Plus className="h-4 w-4" />
              Tạo
            </Button>
          ) : null}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={handleRefresh}
            title="Làm mới"
            aria-label="Refresh"
          >
            <RefreshCcw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Create Playlist Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Tạo playlist</DialogTitle>
            <DialogDescription>
              Nhập tên playlist (tối đa 100 ký tự).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Ví dụ: Nhạc học bài"
              disabled={creating}
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
              >
                Huỷ
              </Button>
              <Button
                type="button"
                className="rounded-full"
                onClick={handleCreatePlaylist}
                disabled={creating}
              >
                {creating ? "Đang tạo..." : "Tạo playlist"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
