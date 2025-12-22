import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { http } from "@/lib/http";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Download,
  Heart,
  MoreHorizontal,
  Mic,
  Trash2,
  RefreshCcw,
} from "lucide-react";

/**
 * UploadsSongsList
 * - Danh sách bài hát đã tải lên của user hiện tại (lọc theo user_id)
 *
 * API sử dụng:
 * - GET /api/v1/auth/me (Auth) để lấy user.id:contentReference[oaicite:3]{index=3}
 * - GET /api/v1/songs (Public) để lấy list bài hát (có user_id):contentReference[oaicite:4]{index=4}
 * - DELETE /api/v1/songs/:id (Auth + owner) để xoá bài:contentReference[oaicite:5]{index=5}
 *
 */
export default function UploadsSongsList({
  accessToken,
  pageSize = 20,
  className,
  selectedSongId,
  onSelectSong,
  onPlaySong,
  onDeleted,
  onRequireLogin, // optional: gọi khi user chưa đăng nhập mà muốn thao tác
}) {

  const token = useMemo(() => {
    return (
      accessToken ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      ""
    );
  }, [accessToken]);

  const [me, setMe] = useState(null);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | title_asc | title_desc (theo doc)
  const [page, setPage] = useState(1);

  const [songs, setSongs] = useState([]);
  const [meta, setMeta] = useState(null);

  const [loadingMe, setLoadingMe] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);

  const hasLogin = !!token;

  const mySongs = useMemo(() => {
    if (!me) return [];
    return songs.filter((s) => Number(s.user_id) === Number(me.id));
  }, [songs, me]);

  function formatDuration(seconds) {
    const s = Number(seconds || 0);
    if (!Number.isFinite(s) || s <= 0) return "--:--";
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  }

  async function fetchMe() {
    if (!token) return null;
    setLoadingMe(true);
    try {
      const res = await http.get("/auth/me", token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      // Doc trả về: { success: true, data: { user: {...} } }
      const user = res?.data?.data?.user;
      setMe(user || null);
      return user || null;
    } catch (err) {
      console.error("[UploadsSongsList] fetchMe error:", err);
      toast.error(
        "Không lấy được thông tin đăng nhập. Vui lòng đăng nhập lại."
      );
      setMe(null);
      return null;
    } finally {
      setLoadingMe(false);
    }
  }

  async function fetchSongs({ pageToLoad = 1, append = false } = {}) {
    setLoadingSongs(true);
    try {
      const res = await http.get("/songs", {
        params: {
          page: pageToLoad,
          limit: pageSize,
          q: q?.trim() || undefined,
          sort,
        },
      });

      // Doc: { success: true, data: [...], meta: {...} }
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      const m = res?.data?.meta || null;

      setMeta(m);
      setSongs((prev) => (append ? [...prev, ...data] : data));
      return { data, meta: m };
    } catch (err) {
      console.error("[UploadsSongsList] fetchSongs error:", err);
      toast.error("Tải danh sách bài hát thất bại.");
      return { data: [], meta: null };
    } finally {
      setLoadingSongs(false);
    }
  }

  async function refreshAll() {
    toast.message("Đang làm mới danh sách...");
    const u = await fetchMe();
    await fetchSongs({ pageToLoad: 1, append: false });
    setPage(1);

    if (u) toast.success("Đã làm mới danh sách.");
  }

  useEffect(() => {
    // Load lần đầu
    (async () => {

      // Không bắt buộc login để gọi /songs, nhưng muốn lọc "uploads của tôi" thì phải có /auth/me
      if (hasLogin) {
        await fetchMe();
      } else {
        setMe(null);
      }
      await fetchSongs({ pageToLoad: 1, append: false });
      setPage(1);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLogin]);

  useEffect(() => {
    // Khi search/sort đổi -> load lại page 1
    (async () => {
      await fetchSongs({ pageToLoad: 1, append: false });
      setPage(1);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  function handleSelect(song) {
    onSelectSong?.(song);
  }

  function handlePlay(song) {
    onPlaySong?.(song);
    toast.success(`Phát: ${song?.title || "Bài hát"}`);
  }

  function handleDownload(song) {
    const url = song?.audio_url;
    if (!url) {
      toast.error("Không có audio_url để tải.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("Đang mở link tải âm thanh.");
  }

  function handleLyrics(song) {
    // Placeholder (chưa có API lyrics trong doc bạn gửi)
    toast.message(`Lyrics chưa được hỗ trợ: ${song?.title || ""}`);
  }

  async function handleCopyLink(song) {
    try {
      const url = song?.audio_url || "";
      if (!url) {
        toast.error("Không có audio_url để copy.");
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Đã copy link audio.");
    } catch (err) {
      console.error("[UploadsSongsList] copyLink error:", err);
      toast.error("Copy link thất bại (trình duyệt chặn clipboard).");
    }
  }

  async function handleToggleLike(song) {
    // Placeholder: vì bạn chưa xác nhận endpoint Favorites trong luồng Uploads.
    // Nếu bạn muốn nối API favorites thật, gửi mình phần doc favorites trong api_document_final.
    toast.message("Chưa nối API yêu thích (favorites) cho Uploads.");
  }

  function askDelete(song) {
    if (!hasLogin) {
      toast.error("Bạn cần đăng nhập để xoá bài hát.");
      onRequireLogin?.();
      return;
    }
    setSongToDelete(song);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!songToDelete?.id) return;
    if (!hasLogin) return;

    setDeleting(true);
    try {
      // DELETE /songs/:id (Auth + owner):contentReference[oaicite:6]{index=6}
      await http.delete(`/songs/${songToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Xoá bài hát thành công.");
      setSongs((prev) => prev.filter((s) => s.id !== songToDelete.id));
      onDeleted?.(songToDelete);
    } catch (err) {
      console.error("[UploadsSongsList] deleteSong error:", err);
      const msg =
        err?.response?.data?.message ||
        "Xoá bài hát thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setSongToDelete(null);
    }
  }

  async function loadMore() {
    const next = page + 1;
    await fetchSongs({ pageToLoad: next, append: true });
    setPage(next);
    toast.success("Đã tải thêm.");
  }

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return Number(meta.page) < Number(meta.totalPages);
  }, [meta]);

  const showList = hasLogin ? mySongs : [];

  return (
    <section className={cn("w-full", className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bài hát đã tải lên</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý các bài hát bạn đã upload.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="w-full sm:w-[320px]">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm trong uploads theo tên bài hát..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  toast.message("Đang tìm kiếm...");
                  fetchSongs({ pageToLoad: 1, append: false });
                  setPage(1);
                }
              }}
            />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                onClick={() => {
                  setSort((prev) =>
                    prev === "newest" ? "title_asc" : "newest"
                  );
                  toast.success("Đã đổi sắp xếp.");
                }}
              >
                Sort
              </Button>
            </TooltipTrigger>
            <TooltipContent>Đổi sort: newest ↔ title_asc</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={refreshAll}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lấy lại /users/me và /songs</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {!hasLogin ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="text-base font-medium">Bạn chưa đăng nhập</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng nhập để xem và quản lý danh sách bài hát đã upload.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => {
                toast.error("Vui lòng đăng nhập.");
                onRequireLogin?.();
              }}
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card">
          <ScrollArea className="h-[520px]">
            <div className="divide-y">
              {(loadingMe || loadingSongs) && showList.length === 0 ? (
                <div className="p-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-[40%]" />
                        <Skeleton className="mt-2 h-3 w-[25%]" />
                      </div>
                      <Skeleton className="h-4 w-[90px]" />
                      <Skeleton className="h-8 w-[120px]" />
                    </div>
                  ))}
                </div>
              ) : showList.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-base font-medium">
                    Chưa có bài hát upload
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hãy upload bài hát đầu tiên của bạn.
                  </p>
                </div>
              ) : (
                showList.map((song) => {
                  const active = Number(selectedSongId) === Number(song.id);

                  // “album” trong list có thể không có. Nếu backend trả album.title thì sẽ hiển thị.
                  const albumTitle =
                    song?.album?.title ||
                    song?.album_title ||
                    song?.albumTitle ||
                    "—";

                  const subtitle =
                    song?.artists
                      ?.map?.((a) => a?.name)
                      .filter(Boolean)
                      .join(", ") || `Song #${song.id}`;

                  const coverUrl =
                    song?.cover_url ??
                    song?.image_url ??
                    song?.thumbnail ??
                    song?.thumbnail_url ??
                    song?.coverUrl ??
                    "";

                  return (
                    <div
                      key={song.id}
                      className={cn(
                        "group flex items-center gap-4 px-4 py-4 transition-colors",
                        "hover:bg-muted/40",
                        active && "bg-muted/60"
                      )}
                    >
                      {/* Left: thumb + title */}
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                        onClick={() => handleSelect(song)}
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={song?.title || "cover"}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                              {String(song?.title || "?")
                                .trim()
                                .slice(0, 1)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold">
                            {song?.title || "Untitled"}
                          </div>
                          <div className="truncate text-sm text-muted-foreground">
                            {subtitle}
                          </div>
                        </div>
                      </button>

                      {/* Middle: album */}
                      <div className="hidden w-[280px] shrink-0 truncate text-sm text-muted-foreground md:block">
                        {albumTitle}
                      </div>

                      {/* Right: duration */}
                      <div className="w-[70px] shrink-0 text-right text-sm text-muted-foreground">
                        {formatDuration(song?.duration)}
                      </div>

                      {/* Actions */}
                      <div className="ml-2 flex shrink-0 items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownload(song)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Tải xuống</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleLyrics(song)}
                            >
                              <Mic className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Lyrics (placeholder)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleToggleLike(song)}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Yêu thích</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handlePlay(song)}>
                              Phát
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyLink(song)}
                            >
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => askDelete(song)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xoá
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="flex items-center justify-between gap-3 border-t p-4">
            <div className="text-sm text-muted-foreground">
              {meta ? (
                <>
                  Trang {meta.page}/{meta.totalPages} • Tổng {meta.total}
                </>
              ) : (
                "—"
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  toast.message("Đang tìm kiếm...");
                  fetchSongs({ pageToLoad: 1, append: false });
                  setPage(1);
                }}
                disabled={loadingSongs}
              >
                Tìm
              </Button>

              <Button
                onClick={loadMore}
                disabled={!canLoadMore || loadingSongs}
              >
                Tải thêm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài hát?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xoá{" "}
              <span className="font-semibold">
                {songToDelete?.title || "bài hát này"}
              </span>
              ? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
            >
              {deleting ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
