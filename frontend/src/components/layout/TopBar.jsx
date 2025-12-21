import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Settings,
  Crown,
  Moon,
  Sun,
  User2,
  LogOut,
} from "lucide-react";

import useTheme from "@/hooks/useTheme";
import { http } from "@/lib/http";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * TopBar
 * - Thanh top gồm: Search + action buttons + login/register hoặc user dropdown
 * - Search call API: GET /songs (params: q, page, limit)
 * - Toggle Light/Dark mode bằng hook useTheme
 *
 * Props:
 * - user?: { username?: string, email?: string, avatar_url?: string }
 * - onLoginClick?(): void
 * - onRegisterClick?(): void
 * - onLogoutClick?(): void
 * - onUpgradeClick?(): void
 * - onDownloadClick?(): void
 * - onSettingsClick?(): void
 * - onProfileClick?(): void
 * - onSelectSong?(song): void
 */
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

  const { theme, toggleTheme } = useTheme();

  const hasQuery = useMemo(() => q.trim().length > 0, [q]);

  const normalizeSongLabel = (song) => {
    const title = song?.title ?? song?.name ?? "Không rõ tên";
    const artists = Array.isArray(song?.artists)
      ? song.artists
          .map((a) => a?.name ?? a)
          .filter(Boolean)
          .join(", ")
      : (song?.artist ?? song?.artist_name ?? "");

    return { title, artists: artists || "" };
  };

  const handleClickSafe = useCallback((fn, okMsg, failMsg, logTag) => {
    try {
      if (typeof fn !== "function") {
        toast.error(failMsg);
        console.error(`[TopBar] ${logTag}: Missing handler`);
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
    if (!hasQuery) {
      toast.error("Vui lòng nhập từ khóa để tìm kiếm.");
      return;
    }

    setLoading(true);
    try {
      const res = await http.get("/songs", {
        params: { page: 1, limit: 8, q: q.trim() },
      });

      const payload = res?.data;
      const data = Array.isArray(payload?.data) ? payload.data : [];

      setResults(data);
      setOpen(true);

      toast.success(`Tìm thấy ${data.length} kết quả.`);
    } catch (err) {
      console.error("[TopBar] Search songs failed:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      toast.error("Tìm kiếm thất bại. Vui lòng thử lại.");
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [hasQuery, q]);

  const handleSelectSong = useCallback(
    (song) => {
      const { title } = normalizeSongLabel(song);

      try {
        onSelects;
        onSelectSong?.(song);
        toast.success(`Đã chọn: ${title}`);
      } catch (err) {
        console.error("[TopBar] onSelectSong callback failed:", err);
        toast.error("Chọn bài hát thất bại.");
      } finally {
        setOpen(false);
      }
    },
    [onSelectSong]
  );

  const handleToggleTheme = useCallback(() => {
    try {
      const next = theme === "dark" ? "light" : "dark";
      toggleTheme();
      toast.success(
        `Đã chuyển sang ${next === "dark" ? "Dark" : "Light"} mode.`
      );
    } catch (err) {
      console.error("[TopBar] Toggle theme failed:", err);
      toast.error("Chuyển theme thất bại.");
    }
  }, [theme, toggleTheme]);

  const handleLogout = useCallback(() => {
    try {
      // tuỳ bạn lưu token kiểu gì, đây là ví dụ phổ biến:
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      onLogoutClick?.();
      toast.success("Đã đăng xuất.");
    } catch (err) {
      console.error("[TopBar] Logout failed:", err);
      toast.error("Đăng xuất thất bại.");
    }
  }, [onLogoutClick]);

  const displayName = user?.username || user?.email || "User";
  const fallbackChar = (displayName?.[0] || "U").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <form
            className="relative flex w-full max-w-[680px] items-center"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <Search className="pointer-events-none absolute left-3 size-4 opacity-70" />

            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
              className="h-10 rounded-full pl-9 pr-11"
              onKeyDown={(e) => {
                if (e.key === "Escape") setOpen(false);
              }}
            />

            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-2 h-8 w-8 rounded-full"
              disabled={loading}
              aria-label="Search"
              title="Tìm kiếm"
            >
              <Search className="size-4" />
            </Button>
          </form>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[680px] p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="text-sm font-medium">Kết quả</div>
            <div className="text-xs opacity-70">
              {loading ? "Đang tìm..." : `${results.length} mục`}
            </div>
          </div>

          <Separator className="my-2" />

          {results.length === 0 ? (
            <div className="px-2 py-6 text-sm opacity-70">
              {loading
                ? "Đang tải dữ liệu..."
                : "Không có kết quả. Thử từ khóa khác nhé."}
            </div>
          ) : (
            <ScrollArea className="h-[260px] pr-2">
              <div className="space-y-1">
                {results.map((song) => {
                  const key = song?.id ?? song?.audio_public_id ?? song?.title;
                  const { title, artists } = normalizeSongLabel(song);

                  return (
                    <button
                      key={key}
                      type="button"
                      className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-accent"
                      onClick={() => handleSelectSong(song)}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {title}
                        </div>
                        {artists ? (
                          <div className="truncate text-xs opacity-70">
                            {artists}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() =>
            handleClickSafe(
              onDownloadClick,
              "Đang mở trang tải bản Windows.",
              "Chưa cấu hình hành động tải bản Windows.",
              "DownloadClick"
            )
          }
        >
          Tải bản Windows
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={handleToggleTheme}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Chuyển Light mode" : "Chuyển Dark mode"}
        >
          {theme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() =>
            handleClickSafe(
              onSettingsClick,
              "Mở cài đặt.",
              "Chưa cấu hình cài đặt.",
              "SettingsClick"
            )
          }
          aria-label="Settings"
          title="Cài đặt"
        >
          <Settings className="size-5" />
        </Button>

        <Button
          className="rounded-full bg-yellow-400 text-black hover:bg-yellow-300"
          onClick={() =>
            handleClickSafe(
              onUpgradeClick,
              "Đi tới nâng cấp tài khoản.",
              "Chưa cấu hình nâng cấp.",
              "UpgradeClick"
            )
          }
        >
          <Crown className="mr-2 size-4" />
          Nâng cấp tài khoản
        </Button>

        {/* AUTH AREA */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 rounded-full px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || ""} alt={displayName} />
                  <AvatarFallback>{fallbackChar}</AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden max-w-[140px] truncate sm:inline">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <div className="truncate">{user?.username || "Tài khoản"}</div>
                {user?.email ? (
                  <div className="truncate text-xs font-normal opacity-70">
                    {user.email}
                  </div>
                ) : null}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  handleClickSafe(
                    onProfileClick,
                    "",
                    "Chưa cấu hình trang hồ sơ.",
                    "ProfileClick"
                  )
                }
              >
                <User2 className="mr-2 size-4" />
                Hồ sơ
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  handleClickSafe(
                    onSettingsClick,
                    "",
                    "Chưa cấu hình cài đặt.",
                    "SettingsClick"
                  )
                }
              >
                <Settings className="mr-2 size-4" />
                Cài đặt
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 focus:text-red-500"
              >
                <LogOut className="mr-2 size-4" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() =>
                handleClickSafe(
                  onRegisterClick,
                  "Đi tới đăng ký.",
                  "Chưa cấu hình đăng ký.",
                  "RegisterClick"
                )
              }
            >
              Đăng ký
            </Button>

            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() =>
                handleClickSafe(
                  onLoginClick,
                  "Đi tới đăng nhập.",
                  "Chưa cấu hình đăng nhập.",
                  "LoginClick"
                )
              }
            >
              Đăng nhập
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
