import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, FileAudio, X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { http } from "@/lib/http";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

/**
 * UploadSongCard
 * API: POST /api/v1/songs (multipart/form-data)
 * fields: audio(file) + title(string) + release_date?(YYYY-MM-DD)
 *
 * Props:
 * - onUploaded?: (newSong) => void
 * - onRequireLogin?: () => void
 */
export default function UploadSongCard({ onUploaded, onRequireLogin }) {
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [releaseDate, setReleaseDate] = useState(""); // YYYY-MM-DD

  const fileMeta = useMemo(() => {
    if (!file) return null;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return { name: file.name, sizeMB, type: file.type || "unknown" };
  }, [file]);

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setReleaseDate("");
    setProgress(0);
    setDragging(false);
    abortRef.current = null;
  };

  const pickFile = () => {
    if (mutation.isPending) return;
    inputRef.current?.click();
  };

  const validateAndSetFile = async (picked) => {
    if (!picked) return;

    // Validate type (basic)
    if (!picked.type?.startsWith("audio/")) {
      toast.error(
        "File không phải định dạng audio. Vui lòng chọn mp3/wav/ogg..."
      );
      console.error("[UploadSongCard] Invalid file type:", picked.type, picked);
      return;
    }

    setFile(picked);

    if (!title) {
      const nameNoExt = picked.name.replace(/\.[^/.]+$/, "");
      setTitle(nameNoExt);
    }
  };

  // ---- Drag & Drop handlers ----
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mutation.isPending) setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (mutation.isPending) return;

    const dropped = e.dataTransfer?.files?.[0];
    await validateAndSetFile(dropped);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        toast.error("Bạn chưa chọn file audio.");
        throw new Error("Missing audio file");
      }
      if (!title.trim()) {
        toast.error("Vui lòng nhập tiêu đề (title).");
        throw new Error("Missing title");
      }

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("Bạn cần đăng nhập để upload.");
        onRequireLogin?.();
        throw new Error("Missing accessToken");
      }

      const form = new FormData();
      form.append("audio", file); // required
      form.append("title", title.trim()); // required

      // ✅ FIX: Không gửi duration (backend có thể validate number strict)
      // Optional: release_date đúng YYYY-MM-DD
      if (releaseDate) form.append("release_date", releaseDate);

      // Debug payload (rất hữu ích)
      for (const [k, v] of form.entries()) {
        console.log("[Upload payload]", k, v);
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setProgress(0);

      const res = await http.post("/songs", form, {
        signal: controller.signal,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const pct = Math.round((evt.loaded * 100) / evt.total);
          setProgress(pct);
        },
      });

      return res.data?.data;
    },
    onSuccess: (newSong) => {
      toast.success("Upload bài hát thành công!");
      console.log("[UploadSongCard] Upload success:", newSong);
      onUploaded?.(newSong);
      resetForm();
    },
    onError: (err) => {
      const isCanceled =
        err?.name === "CanceledError" ||
        err?.code === "ERR_CANCELED" ||
        err?.message?.toLowerCase?.().includes("canceled");

      if (isCanceled) {
        toast.message("Đã hủy upload.");
        console.warn("[UploadSongCard] Upload canceled:", err);
      } else {
        const apiMsg = err?.response?.data?.message;
        toast.error(apiMsg || "Upload thất bại. Vui lòng thử lại.");
        console.error("[UploadSongCard] Upload failed:", {
          status: err?.response?.status,
          data: err?.response?.data,
          err,
        });
      }

      setProgress(0);
      abortRef.current = null;
    },
    onSettled: () => {
      abortRef.current = null;
    },
  });

  const startUpload = () => mutation.mutate();
  const cancelUpload = () => abortRef.current?.abort?.();

  useEffect(() => {
    return () => abortRef.current?.abort?.();
  }, []);

  return (
    <Card className="border-border/60 bg-card/40">
      <CardHeader>
        <CardTitle className="text-2xl">Uploads</CardTitle>
        <CardDescription>Manage your uploaded songs.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Dropzone */}
        <div
          className={[
            "rounded-xl border border-dashed p-8",
            "flex flex-col items-center justify-center text-center",
            "min-h-[260px] transition",
            dragging
              ? "border-primary/70 bg-primary/5"
              : "border-border/60 bg-background/20",
            mutation.isPending ? "opacity-80" : "",
          ].join(" ")}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onClick={pickFile}
          onKeyDown={(e) =>
            e.key === "Enter" || e.key === " " ? pickFile() : null
          }
        >
          <UploadCloud className="h-12 w-12 opacity-70" />
          <div className="mt-4 text-lg font-semibold">
            Kéo và thả tệp của bạn vào đây
          </div>
          <div className="text-sm text-muted-foreground">hoặc</div>

          <div className="mt-4">
            <Button
              type="button"
              onClick={pickFile}
              disabled={mutation.isPending}
            >
              Chọn tệp
            </Button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={async (e) => {
              const picked = e.target.files?.[0];
              await validateAndSetFile(picked);
              e.target.value = "";
            }}
            disabled={mutation.isPending}
          />

          {/* Selected file */}
          {fileMeta && (
            <div className="mt-6 w-full max-w-2xl rounded-xl border border-border/60 bg-background/30 p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FileAudio className="mt-0.5 h-5 w-5 opacity-80" />
                  <div>
                    <div className="font-medium">{fileMeta.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {fileMeta.type} • {fileMeta.sizeMB} MB
                    </div>
                  </div>
                </div>

                {!mutation.isPending && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setProgress(0);
                    }}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {mutation.isPending && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Đang upload...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metadata form */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="song-title">Tiêu đề (title) *</Label>
            <Input
              id="song-title"
              placeholder="Nhập tên bài hát"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="song-release">Ngày phát hành (release_date)</Label>
            <Input
              id="song-release"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={mutation.isPending}
          >
            Reset
          </Button>

          {mutation.isPending ? (
            <Button type="button" variant="destructive" onClick={cancelUpload}>
              Hủy upload
            </Button>
          ) : (
            <Button
              type="button"
              onClick={startUpload}
              disabled={!file || !title.trim()}
            >
              Upload
            </Button>
          )}

          {mutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
