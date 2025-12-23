// FILE: src/components/playlist/AddToPlaylistDialog.jsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  listMyPlaylists,
  createMyPlaylist,
  addSongToPlaylist,
} from "@/services/playlists.api";

function getSongId(song) {
  return song?.song_id ?? song?.songId ?? song?.id ?? null;
}

export default function AddToPlaylistDialog({ onRequireLogin }) {
  const [open, setOpen] = useState(false);
  const [song, setSong] = useState(null);

  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasToken = Boolean(localStorage.getItem("accessToken"));

  // Lắng nghe event global để mở dialog
  useEffect(() => {
    const handler = (e) => {
      const s = e?.detail?.song;
      if (!s) return;

      if (!localStorage.getItem("accessToken")) {
        toast.error("Bạn cần đăng nhập để dùng playlist.");
        onRequireLogin?.();
        return;
      }

      setSong(s);
      setSelectedPlaylistId("");
      setNewName("");
      setOpen(true);
    };

    window.addEventListener("playlist:addSong", handler);
    return () => window.removeEventListener("playlist:addSong", handler);
  }, [onRequireLogin]);

  const songTitle = useMemo(() => {
    return song?.title ?? song?.name ?? "Bài hát";
  }, [song]);

  const fetchMyPlaylists = async () => {
    if (!hasToken) return;

    setLoading(true);
    try {
      const res = await listMyPlaylists({ page: 1, limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : [];
      setPlaylists(list);
    } catch (err) {
      const st = err?.response?.status;
      if (st === 401 || st === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onRequireLogin?.();
        setOpen(false);
        return;
      }
      toast.error(err?.response?.data?.message ?? "Không tải được playlist.");
    } finally {
      setLoading(false);
    }
  };

  // Mở dialog thì tải playlist
  useEffect(() => {
    if (open) fetchMyPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return toast.error("Tên playlist không được để trống.");
    if (name.length > 100) return toast.error("Tên playlist tối đa 100 ký tự.");
    if (!localStorage.getItem("accessToken")) {
      toast.error("Bạn cần đăng nhập để tạo playlist.");
      onRequireLogin?.();
      return;
    }

    setCreating(true);
    try {
      const created = await createMyPlaylist({ name });
      toast.success("Tạo playlist thành công!");
      setNewName("");

      // refresh list
      await fetchMyPlaylists();

      // auto chọn playlist mới nếu backend trả id
      const newId = created?.id;
      if (newId != null) setSelectedPlaylistId(String(newId));
    } catch (err) {
      const st = err?.response?.status;
      if (st === 401 || st === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onRequireLogin?.();
        setOpen(false);
        return;
      }
      toast.error(err?.response?.data?.message ?? "Tạo playlist thất bại.");
    } finally {
      setCreating(false);
    }
  };

  const handleAdd = async () => {
    const playlistId = selectedPlaylistId;
    const songId = getSongId(song);

    if (!playlistId) return toast.error("Bạn chưa chọn playlist.");
    if (!songId) return toast.error("Thiếu songId (không nhận ra ID bài hát).");
    if (!localStorage.getItem("accessToken")) {
      toast.error("Bạn cần đăng nhập để thêm bài.");
      onRequireLogin?.();
      return;
    }

    setAdding(true);
    try {
      await addSongToPlaylist(playlistId, { songId });
      toast.success("Đã thêm bài hát vào playlist!");
      setOpen(false);
    } catch (err) {
      const st = err?.response?.status;
      if (st === 401 || st === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onRequireLogin?.();
        setOpen(false);
        return;
      }
      toast.error(
        err?.response?.data?.message ?? "Thêm vào playlist thất bại."
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Thêm vào playlist</DialogTitle>
          <DialogDescription>
            Chọn playlist để thêm:{" "}
            <span className="font-medium">{songTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* List playlists */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Playlist của bạn</div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Đang tải...</div>
            ) : playlists.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Bạn chưa có playlist nào. Tạo mới bên dưới.
              </div>
            ) : (
              <div className="max-h-[220px] overflow-auto rounded-xl border border-border/60">
                {playlists.map((pl) => {
                  const id = pl?.id;
                  const name = pl?.name ?? pl?.title ?? `Playlist #${id}`;
                  const active = String(id) === String(selectedPlaylistId);

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedPlaylistId(String(id))}
                      className={[
                        "w-full text-left px-3 py-2 text-sm transition",
                        "border-b border-border/40 last:border-b-0",
                        active ? "bg-accent/50" : "hover:bg-accent/30",
                      ].join(" ")}
                      title={name}
                    >
                      <div className="font-medium truncate">{name}</div>
                      {pl?.description ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {pl.description}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create playlist */}
          <div className="rounded-xl border border-border/60 p-3 space-y-2">
            <div className="text-sm font-medium">Tạo playlist mới</div>
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ví dụ: Nhạc học bài"
                disabled={creating}
              />
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Đang tạo..." : "Tạo"}
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={adding}
            >
              Huỷ
            </Button>
            <Button onClick={handleAdd} disabled={adding}>
              {adding ? "Đang thêm..." : "Thêm vào playlist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
