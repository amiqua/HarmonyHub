// FILE: src/components/genres/GenresPageContent.jsx
// Trang "Chủ đề & Thể loại"
// - Fetch GET /api/v1/genres
// - Admin: bấm vào "Sửa ảnh" trên mỗi card để upload/đổi ảnh

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Image as ImageIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listGenres,
  updateGenre,
  createGenre,
  deleteGenre,
} from "@/services/genres.api";
import { useAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import GenresHero from "@/components/genres/hero/GenresHero";
import GenresSection from "@/components/genres/sections/GenresSection";

function AdminGenreCard({ item, onSelect, isAdmin, onEdit, onDelete }) {
  return (
    <div className="group relative h-[160px] w-full overflow-hidden rounded-2xl border border-border/60 bg-card/30 md:h-[180px]">
      <button
        type="button"
        onClick={() => onSelect?.(item)}
        className="absolute inset-0 z-0 text-left focus:outline-none"
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/30 via-emerald-500/20 to-sky-500/30">
            <ImageIcon className="h-10 w-10 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-4">
          <div className="text-lg font-semibold tracking-tight text-white md:text-xl">
            {item.name}
          </div>
          {item.description ? (
            <div className="mt-1 line-clamp-2 text-xs text-white/70">
              {item.description}
            </div>
          ) : null}
        </div>
      </button>

      {isAdmin && (
        <div className="absolute right-2 top-2 z-20 flex gap-1.5 opacity-90">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
            className="rounded-full bg-white/95 p-1.5 text-foreground shadow hover:bg-white"
            title="Sửa thể loại"
            aria-label="Sửa thể loại"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Xoá thể loại "${item.name}"?`)) onDelete?.(item);
            }}
            className="rounded-full bg-red-500/95 p-1.5 text-white shadow hover:bg-red-600"
            title="Xoá"
            aria-label="Xoá thể loại"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function GenreEditDialog({ open, onOpenChange, genre, onSubmit, busy }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setName(genre?.name ?? "");
      setDescription(genre?.description ?? "");
      setImageFile(null);
      setPreview(genre?.image_url ?? "");
    }
  }, [open, genre]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận ảnh.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ảnh quá lớn (tối đa 5MB).");
      return;
    }
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Tên thể loại không được để trống.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      imageFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {genre ? "Sửa thể loại" : "Tạo thể loại"}
          </DialogTitle>
          <DialogDescription>
            Đổi tên, mô tả, hoặc ảnh đại diện cho chủ đề/thể loại.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tên thể loại</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Lo-fi"
              maxLength={50}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ngắn gọn về thể loại này..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ảnh đại diện</label>
            <div className="flex items-start gap-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFile}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full"
                >
                  Chọn ảnh
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG/PNG/WebP, tối đa 5MB.
                </p>
                {imageFile && (
                  <p className="text-xs text-emerald-500">
                    {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            {busy ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function GenresPageContent({ onSelectGenre }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const qc = useQueryClient();

  const { data: genres = [], isLoading } = useQuery({
    queryKey: ["genres"],
    queryFn: () => listGenres(),
    staleTime: 30_000,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSelect = (it) => {
    onSelectGenre?.(it);
    toast.message(`Đã chọn: ${it?.name ?? "Thể loại"}`);
  };

  const openCreate = () => {
    setEditing(null);
    setEditOpen(true);
  };
  const openEdit = (g) => {
    setEditing(g);
    setEditOpen(true);
  };

  const handleSubmit = async (data) => {
    setBusy(true);
    try {
      if (editing) {
        await updateGenre(editing.id, data);
        toast.success("Đã cập nhật thể loại.");
      } else {
        await createGenre(data);
        toast.success("Đã tạo thể loại mới.");
      }
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ["genres"] });
    } catch (err) {
      console.error("[Genres] save failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể lưu thể loại.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (g) => {
    try {
      await deleteGenre(g.id);
      toast.success("Đã xoá thể loại.");
      qc.invalidateQueries({ queryKey: ["genres"] });
    } catch (err) {
      console.error("[Genres] delete failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xoá thể loại.";
      toast.error(msg);
    }
  };

  const heroGenre = useMemo(
    () => genres.find((g) => g.image_url) ?? genres[0],
    [genres]
  );

  return (
    <div className="space-y-8">
      <GenresHero
        title={heroGenre?.name ?? "Chủ đề & Thể loại"}
        subtitle={
          heroGenre?.description ||
          "Khám phá các chủ đề và thể loại âm nhạc đa dạng."
        }
        imageUrl={heroGenre?.image_url}
      />

      <GenresSection
        title="Tất cả thể loại"
        actionLabel={isAdmin ? "+ Tạo mới" : null}
        onAction={isAdmin ? openCreate : undefined}
      >
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[160px] w-full animate-pulse rounded-2xl bg-muted md:h-[180px]"
              />
            ))}
          </div>
        ) : genres.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card/30 p-8 text-center text-sm text-muted-foreground">
            Chưa có thể loại nào.
            {isAdmin && (
              <div className="mt-3">
                <Button onClick={openCreate} className="gap-2 rounded-full">
                  <Plus className="h-4 w-4" /> Tạo thể loại
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {genres.map((g) => (
              <AdminGenreCard
                key={g.id}
                item={g}
                onSelect={handleSelect}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </GenresSection>

      {isAdmin && (
        <GenreEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          genre={editing}
          onSubmit={handleSubmit}
          busy={busy}
        />
      )}
    </div>
  );
}
