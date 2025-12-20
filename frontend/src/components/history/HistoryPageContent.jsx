import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryTabs from "@/components/history/HistoryTabs";
import HistoryGrid from "@/components/history/HistoryGrid";

import { getMyHistory, addSongToHistory } from "@/services/history.api";

const TABS = [{ key: "songs", label: "BÀI HÁT" }];

function mapHistoryToCard(it) {
  return {
    id: it.song_id ?? it.id,
    title: it.title ?? "Bài hát",
    subtitle: it.release_date ? `Phát hành: ${it.release_date}` : "",
    cover: "",
    _raw: it,
  };
}

export default function HistoryPageContent({ onRequireLogin }) {
  const [tab] = useState("songs");
  const qc = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["history", "me", tab, 1, 20],
    queryFn: () => getMyHistory({ type: tab, page: 1, limit: 20 }),
    retry: false,
  });

  const { data, isLoading, error } = historyQuery;

  const items = useMemo(() => {
    const raw = data ?? [];
    return Array.isArray(raw) ? raw.map(mapHistoryToCard) : [];
  }, [data]);

  const mAdd = useMutation({
    mutationFn: (songId) => addSongToHistory(songId),
    onSuccess: () => {
      // reload list lịch sử
      qc.invalidateQueries({ queryKey: ["history", "me"] });
    },
    onError: (e) => {
      const status = e?.response?.status;
      if (status === 401) {
        toast.error("Bạn cần đăng nhập để xem lịch sử.");
        onRequireLogin?.();
      } else {
        toast.error(e?.response?.data?.message ?? "Cập nhật lịch sử thất bại.");
      }
    },
  });

  const handleSelect = (it) => {
    // ✅ Gọi trực tiếp API thêm vào nghe gần đây
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Bạn cần đăng nhập để dùng nghe gần đây.");
      onRequireLogin?.();
      return;
    }

    const songId = it?.id;
    if (!songId) {
      toast.error("Thiếu songId.");
      return;
    }

    mAdd.mutate(songId);
    toast.success(`Đã thêm vào nghe gần đây: ${it?.title ?? "Bài hát"}`);
  };

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
          emptyText={
            error ? "Không tải được dữ liệu." : "Chưa có dữ liệu nghe gần đây."
          }
          onRequireLogin={onRequireLogin}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
