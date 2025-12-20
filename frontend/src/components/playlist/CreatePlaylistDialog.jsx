// FILE: src/components/playlists/CreatePlaylistDialog.jsx
// CHÚ THÍCH:
// - Dialog tạo playlist mới (Tên + Mô tả).
// - KHÔNG fetch API. Khi submit sẽ gọi onCreate(payload).
// - Tự validate "name" bắt buộc và hiển thị lỗi inline (không toast để tránh spam).
// - Reset form khi đóng dialog.

import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - onCreate?: ({ name, description }) => void | Promise<void>
 * - className?: string
 */
export default function CreatePlaylistDialog({
  open,
  onOpenChange,
  onCreate,
  className,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return name.trim().length > 0 && !submitting;
  }, [name, submitting]);

  // Reset khi đóng dialog
  useEffect(() => {
    if (!open) {
      setName("");
      setDescription("");
      setError("");
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const cleanName = name.trim();
    const cleanDesc = description.trim();

    if (!cleanName) {
      setError("Vui lòng nhập tên playlist.");
      return;
    }

    if (typeof onCreate !== "function") {
      setError("Chưa cấu hình hành động tạo playlist (onCreate).");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onCreate({ name: cleanName, description: cleanDesc });
      onOpenChange?.(false);
    } catch (err) {
      console.error("[CreatePlaylistDialog] onCreate failed:", err);
      setError("Tạo playlist thất bại. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[520px]", className)}>
        <DialogHeader>
          <DialogTitle>Tạo playlist mới</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pl-name">Tên playlist</Label>
            <Input
              id="pl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên playlist"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pl-desc">Mô tả (không bắt buộc)</Label>
            <Textarea
              id="pl-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả (không bắt buộc)"
              className="min-h-[96px]"
              disabled={submitting}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange?.(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Đang tạo..." : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
