// FILE: src/components/history/HistoryPageContent.jsx
// Mục tiêu:
// - Hiển thị lịch sử nghe gần đây (GET /me/history)
// - Không gọi API khi chưa login (enabled: isAuthed)
// - Không trùng lặp: backend đã UNIQUE(user_id, song_id) + UPSERT
// - Realtime: khi bạn play ở trang khác -> App.jsx dispatchEvent("history:played")
//   -> HistoryPageContent nghe event và đẩy bài lên đầu ngay (optimistic UI)

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryTabs from "@/components/history/HistoryTabs";
import HistoryGrid from "@/components/history/HistoryGrid";

import { getMyHistory, addSongToHistory } from "@/services/history.api";

const TABS = [{ key: "songs", label: "BÀI HÁT" }];

// --- Helpers: xử lý data trả về có thể là Array hoặc { rows, total } ---
function normalizeRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

function rebuildDataLikeOld(oldData, nextRows) {
  if (Array.isArray(oldData)) return nextRows;
  if (oldData && typeof oldData === "object") {
    return { ...oldData, rows: nextRows };
  }
  return nextRows;
}

// --- Helpers: lấy songId từ row history (đừng dùng row.id vì có thể là history id) ---
function getSongIdFromRow(row) {
  return row?.song?.id ?? row?.song_id ?? null;
}

// --- Move to top + patch played_at ---
function moveSongToTop(rows, songId, patchRow) {
  if (!songId) return Array.isArray(rows) ? rows : [];

  const arr = Array.isArray(rows) ? rows : [];
  const idx = arr.findIndex((r) => getSongIdFromRow(r) === songId);

  if (idx >= 0) {
    const current = arr[idx];
    const next = {
      ...current,
      ...(patchRow ?? {}),
      played_at: patchRow?.played_at ?? new Date().toISOString(),
    };
    const rest = arr.filter((_, i) => i !== idx);
    return [next, ...rest];
  }

  if (patchRow) return [patchRow, ...arr];
  return arr;
}

function mapHistoryToCard(it) {
  // Backend listMine của bạn đang trả flat: { id, played_at, song_id, title, audio_url, release_date, ... }
  // Nhưng vẫn support dạng nested: { song: {...} } nếu sau này đổi API.
  const song = it?.song ?? it?.song_data ?? it?.track ?? null;

  const id = song?.id ?? it?.song_id ?? it?.id; // id dùng cho UI (ưu tiên song.id)
  const title = song?.title ?? it?.title ?? "Bài hát";

  const playedAt =
    it?.played_at ?? it?.playedAt ?? it?.created_at ?? it?.createdAt;
  const releaseDate = song?.release_date ?? it?.release_date;

  const subtitle = playedAt
    ? `Nghe lúc: ${new Date(playedAt).toLocaleString()}`
    : releaseDate
      ? `Phát hành: ${releaseDate}`
      : "";

  const cover =
    song?.cover_url ??
    song?.image_url ??
    song?.thumbnail ??
    it?.cover_url ??
    it?.image_url ??
    "";

  return {
    id,
    title,
    subtitle,
    cover,
    _raw: it,
  };
}

export default function HistoryPageContent({ onRequireLogin }) {
  const [tab] = useState("songs"); // hiện chỉ có songs
  const qc = useQueryClient();

  const accessToken = localStorage.getItem("accessToken");
  const isAuthed = Boolean(accessToken);

  // Nếu user vào /history mà chưa login -> mở login (hướng A)
  useEffect(() => {
    if (!isAuthed) {
      toast.error("Bạn cần đăng nhập để xem lịch sử.");
      onRequireLogin?.();
    }
  }, [isAuthed, onRequireLogin]);

  const page = 1;
  const limit = 20;

  const historyKey = useMemo(
    () => ["history", "me", tab, page, limit],
    [tab, page, limit]
  );

  const historyQuery = useQuery({
    queryKey: historyKey,
    enabled: isAuthed, // ✅ không gọi API nếu chưa login
    queryFn: async () => {
      // ✅ API của bạn: GET /me/history (params: page, limit)
      return getMyHistory({ page, limit });
    },
    retry: false,
  });

  const { data, isLoading, error } = historyQuery;

  const items = useMemo(() => {
    const rows = normalizeRows(data);
    return rows.map(mapHistoryToCard);
  }, [data]);

  /**
   * ✅ Realtime reorder:
   * App.jsx khi play sẽ:
   * window.dispatchEvent(new CustomEvent("history:played", { detail: { songId, song, played_at } }))
   * -> Trang history đang mở sẽ nhảy bài lên đầu ngay, không cần chờ server.
   */
  useEffect(() => {
    const onPlayed = (e) => {
      const songId = e?.detail?.songId;
      const song = e?.detail?.song;
      const playedAt = e?.detail?.played_at ?? new Date().toISOString();
      if (!songId) return;

      qc.setQueriesData({ queryKey: ["history", "me"] }, (old) => {
        const rows = normalizeRows(old);

        const patchRow = {
          song_id: songId,
          played_at: playedAt,

          // flat fields (khớp listMine)
          title: song?.title ?? song?.name ?? "Bài hát",
          audio_url: song?.audio_url ?? null,
          release_date: song?.release_date ?? null,
          duration: song?.duration ?? null,

          // nested song (nếu mapHistoryToCard ưu tiên song.*)
          song: song
            ? {
                id: songId,
                title: song?.title ?? song?.name ?? "Bài hát",
                cover_url:
                  song?.cover_url ?? song?.image_url ?? song?.thumbnail ?? "",
                audio_url: song?.audio_url ?? null,
                release_date: song?.release_date ?? null,
                duration: song?.duration ?? null,
              }
            : null,
        };

        const nextRows = moveSongToTop(rows, songId, patchRow);
        return rebuildDataLikeOld(old, nextRows);
      });
    };

    window.addEventListener("history:played", onPlayed);
    return () => window.removeEventListener("history:played", onPlayed);
  }, [qc]);

  /**
   * (Tuỳ chọn) Click 1 item trong history -> gọi addSongToHistory để cập nhật played_at (UPSERT)
   * Nếu bạn muốn click chỉ để play, hãy chuyển onSelect sang gọi onPlaySong từ ngoài.
   */
  const mAdd = useMutation({
    mutationFn: async ({ songId }) => addSongToHistory(songId),

    // ✅ Optimistic: click trong history cũng nhảy lên đầu ngay
    onMutate: async ({ songId, rawRow }) => {
      if (!songId) return { prev: undefined };

      await qc.cancelQueries({ queryKey: historyKey });

      const prev = qc.getQueryData(historyKey);
      const prevRows = normalizeRows(prev);

      const patch = rawRow
        ? { ...rawRow, played_at: new Date().toISOString() }
        : { song_id: songId, played_at: new Date().toISOString() };

      const nextRows = moveSongToTop(prevRows, songId, patch);
      qc.setQueryData(historyKey, rebuildDataLikeOld(prev, nextRows));

      return { prev };
    },

    onError: (e, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(historyKey, ctx.prev);

      const status = e?.response?.status;
      if (status === 401) {
        toast.error("Bạn cần đăng nhập để dùng nghe gần đây.");
        onRequireLogin?.();
      } else {
        toast.error(e?.response?.data?.message ?? "Cập nhật lịch sử thất bại.");
      }
    },

    onSuccess: (_saved, { songId }) => {
      // Sau khi server thành công, refetch để lấy dữ liệu chuẩn (played_at chuẩn server)
      qc.invalidateQueries({ queryKey: ["history", "me"] });
    },
  });

  const handleSelect = (card) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Bạn cần đăng nhập để dùng nghe gần đây.");
      onRequireLogin?.();
      return;
    }

    const raw = card?._raw;
    const songId = raw?.song?.id ?? raw?.song_id ?? card?.id;
    if (!songId) {
      toast.error("Thiếu songId.");
      return;
    }

    mAdd.mutate({ songId, rawRow: raw });
    toast.success(`Đã cập nhật nghe gần đây: ${card?.title ?? "Bài hát"}`);
  };

  const emptyText = !isAuthed
    ? "Bạn cần đăng nhập để xem lịch sử."
    : error
      ? "Không tải được dữ liệu."
      : "Chưa có dữ liệu nghe gần đây.";

  return (
    <div className="space-y-6">
      <HistoryHeader
        title="Phát gần đây"
        onPlayAll={() => toast.success("Phát tất cả (demo).")}
      />

      <HistoryTabs tabs={TABS} value={tab} onChange={() => {}} />

      {isLoading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Đang tải...
        </div>
      ) : (
        <HistoryGrid
          items={items}
          emptyText={emptyText}
          onRequireLogin={onRequireLogin}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
