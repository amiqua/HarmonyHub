// FILE: src/components/layout/Sidebar.jsx
// CHÚ THÍCH:
// - Sửa lỗi click “Nghe gần đây” không chuyển trang do key bị lệch với navMap trong App.jsx.
// - App.jsx đang map route theo key: "history" -> "/history".
// - Sidebar trước đó dùng key "recent" nên onNavigate("recent") không tìm thấy route.
// ✅ Fix: đổi key "recent" -> "history" (chỉ thay đổi đúng 1 chỗ để hạn chế phát sinh vấn đề).

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
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      logoUrl: "", // bạn có thể truyền logo thật qua props
    }),
    []
  );

  const defaultNavItems = useMemo(
    () => [
      {
        key: "discover",
        label: "Khám Phá",
        icon: <Compass className="size-4" />,
        group: "main",
      },
      {
        key: "zingchart",
        label: "#zingchart",
        icon: <Hash className="size-4" />,
        group: "main",
      },
      {
        key: "radio",
        label: "Phòng Nhạc",
        icon: <Radio className="size-4" />,
        live: true,
        group: "main",
      },

      {
        key: "library",
        label: "Thư Viện",
        icon: <Library className="size-4" />,
        group: "main",
      },
      {
        // ✅ FIX: phải trùng với App.jsx navMap key "history"
        key: "history",
        label: "Nghe gần đây",
        icon: <Clock className="size-4" />,
        group: "main",
      },
      {
        key: "favorites",
        label: "Bài hát yêu thích",
        icon: <Heart className="size-4" />,
        group: "main",
      },

      {
        key: "uploads",
        label: "Đã tải lên",
        icon: <Upload className="size-4" />,
        group: "main",
      },

      {
        key: "new-chart",
        label: "BXH Nhạc Mới",
        icon: <Music2 className="size-4" />,
        group: "more",
      },
      {
        key: "genres",
        label: "Chủ đề & Thể Loại",
        icon: <LayoutGrid className="size-4" />,
        group: "more",
      },
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
      toast.success(okMsg);
    } catch (err) {
      console.error(`[Sidebar] ${logTag} failed:`, err);
      toast.error(failMsg);
    }
  };

  const handleNavClick = (key, label) => {
    safeAction(
      () => onNavigate?.(key),
      `Đã chọn: ${label}`,
      `Không thể điều hướng tới: ${label}`,
      `Navigate(${key})`
    );
  };

  const handlePlaylistClick = (id, name) => {
    safeAction(
      () => onSelectPlaylist?.(id),
      `Đã chọn playlist: ${name}`,
      `Không thể mở playlist: ${name}`,
      `SelectPlaylist(${id})`
    );
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="size-9 overflow-hidden rounded-full bg-muted">
          {b.logoUrl ? (
            <img
              src={b.logoUrl}
              alt="logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs opacity-70">
              Logo
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{b.name}</div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Scrollable content */}
      <ScrollArea className="flex-1 pr-2">
        {/* Main nav */}
        <nav className="space-y-1 px-1">
          {mainItems.map((it) => (
            <Button
              key={it.key}
              type="button"
              variant="ghost"
              className={cn(
                "h-10 w-full justify-start gap-2 rounded-xl",
                activeNavKey === it.key && "bg-accent"
              )}
              onClick={() => handleNavClick(it.key, it.label)}
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
              {it.live ? (
                <Badge
                  variant="secondary"
                  className="ml-auto bg-red-500/20 text-red-200"
                >
                  LIVE
                </Badge>
              ) : null}
            </Button>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* More nav */}
        <nav className="space-y-1 px-1">
          {moreItems.map((it) => (
            <Button
              key={it.key}
              type="button"
              variant="ghost"
              className={cn(
                "h-10 w-full justify-start gap-2 rounded-xl",
                activeNavKey === it.key && "bg-accent"
              )}
              onClick={() => handleNavClick(it.key, it.label)}
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
            </Button>
          ))}
        </nav>

        <Separator className="my-4" />

        {/* Playlists */}
        <div className="px-2 pb-4">
          <div className="mb-2 text-xs font-semibold tracking-wide opacity-70">
            PLAYLISTS
          </div>
          <div className="space-y-1">
            {pls.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="ghost"
                className={cn(
                  "h-9 w-full justify-start rounded-xl px-3 text-sm",
                  activePlaylistId === p.id && "bg-accent"
                )}
                onClick={() => handlePlaylistClick(p.id, p.name)}
              >
                <span className="truncate">{p.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Premium box pinned bottom */}
      <div className="mt-auto p-2">
        <div className="rounded-2xl bg-gradient-to-b from-purple-600/40 to-purple-600/20 p-4">
          <div className="text-sm font-semibold">
            Nghe nhạc không quảng cáo cũng kho nhạc PREMIUM
          </div>
          <Button
            className="mt-3 w-full rounded-xl bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={() =>
              safeAction(
                onUpgradeClick,
                "Đi tới nâng cấp tài khoản.",
                "Chưa cấu hình nâng cấp tài khoản.",
                "UpgradeClick"
              )
            }
          >
            NÂNG CẤP TÀI KHOẢN
          </Button>
        </div>
      </div>
    </div>
  );
}
