// FILE: src/components/history/HistoryTabs.jsx
// CHÚ THÍCH: Tabs lọc cho trang "Phát gần đây" (Bài hát / Playlist / MV / Phòng nhạc).
// - Controlled component: value + onChange.
// - Chỉ lo UI, không fetch, không router.

import { cn } from "@/lib/utils";

const TABS = [{ key: "songs", label: "BÀI HÁT" }];

export default function HistoryTabs({ value = "songs", onChange, className }) {
  return (
    <div className={cn("flex items-center justify-end gap-5", className)}>
      {TABS.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange?.(t.key)}
            className={cn(
              "relative text-sm font-semibold tracking-wide text-muted-foreground transition hover:text-foreground",
              active && "text-purple-400"
            )}
          >
            {t.label}
            {active ? (
              <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[2px] w-full rounded-full bg-purple-500" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
