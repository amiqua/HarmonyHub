// FILE: src/components/library/LibraryPlaylistEmpty.js
import { Plus, Search, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LibraryPlaylistEmpty({
  className,
  isAuthed = false,
  onCreatePlaylist,
  onExplore,
  onLogin,
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-card/30 p-8",
        "flex flex-col items-start gap-3",
        className
      )}
    >
      <div className="text-lg font-semibold">Chưa có playlist</div>
      <div className="text-sm text-muted-foreground">
        Tạo playlist để lưu và nghe lại các bài bạn thích.
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {isAuthed ? (
          <Button onClick={onCreatePlaylist} className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            Tạo playlist
          </Button>
        ) : (
          <Button onClick={onLogin} className="gap-2 rounded-full">
            <LogIn className="h-4 w-4" />
            Đăng nhập để tạo playlist
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onExplore}
          className="gap-2 rounded-full"
        >
          <Search className="h-4 w-4" />
          Khám phá nhạc
        </Button>
      </div>
    </div>
  );
}
