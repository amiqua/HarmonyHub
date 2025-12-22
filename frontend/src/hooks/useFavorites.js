// FILE: src/hooks/useFavorites.js
// CHÚ THÍCH:
// - Hook dùng chung cho tính năng "Yêu thích" trên toàn app.
// - Fetch danh sách ID bài hát yêu thích của user: GET /favorites/me
// - Toggle yêu thích: POST /favorites/:songId, DELETE /favorites/:songId
// - Sau khi thay đổi sẽ phát event "favorites:changed" để các page không dùng React Query (vd: Library) sync lại.

import { useEffect, useMemo, useCallback, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMyFavoriteSongs,
  addFavoriteSong,
  removeFavoriteSong,
} from "@/services/favorites.api";

const FAVORITES_CHANGED_EVENT = "favorites:changed";

function emitFavoritesChanged() {
  try {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  } catch {
    // ignore
  }
}

function normalizeSongId(it) {
  return it?.id ?? it?.song_id ?? it?.songId ?? null;
}

/**
 * useFavorites
 * @param {{ onRequireLogin?: ()=>void, limit?: number }} opts
 */
export default function useFavorites(opts = {}) {
  const { onRequireLogin, limit = 200 } = opts;

  const qc = useQueryClient();

  // token state để hook re-render khi login/logout trong cùng tab
  const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
  const hasToken = Boolean(token);

  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("accessToken"));

    const onStorage = (e) => {
      if (e.key === "accessToken") syncToken();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth:changed", syncToken);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth:changed", syncToken);
    };
  }, []);

  // Query chỉ lấy Set ids (đủ để render icon tim nhanh)
  const qIds = useQuery({
    queryKey: ["favorites", "ids"],
    enabled: hasToken,
    retry: false,
    staleTime: 30_000,
    queryFn: async () => {
      const res = await getMyFavoriteSongs({ page: 1, limit });
      const list = Array.isArray(res?.data) ? res.data : [];
      const ids = new Set();
      for (const it of list) {
        const id = normalizeSongId(it);
        if (id != null) ids.add(id);
      }
      return ids;
    },
    initialData: () => new Set(),
  });

  // Khi nơi khác toggle favorites (vd: Library), các page dùng hook sẽ refetch
  useEffect(() => {
    const onChanged = () => {
      qc.invalidateQueries({ queryKey: ["favorites", "ids"] });
    };
    window.addEventListener(FAVORITES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, onChanged);
  }, [qc]);

  const favoriteIds = useMemo(() => qIds.data ?? new Set(), [qIds.data]);

  const isFavorite = useCallback(
    (songOrId) => {
      const id =
        typeof songOrId === "object" ? normalizeSongId(songOrId) : songOrId;
      if (id == null) return false;
      return favoriteIds.has(id);
    },
    [favoriteIds]
  );

  const ensureLogin = useCallback(() => {
    const t = localStorage.getItem("accessToken");
    if (t) return true;
    toast.error("Bạn cần đăng nhập để dùng yêu thích.");
    onRequireLogin?.();
    return false;
  }, [onRequireLogin]);

  const mAdd = useMutation({
    mutationFn: (songId) => addFavoriteSong(songId),
    onSuccess: (_data, songId) => {
      qc.setQueryData(["favorites", "ids"], (prev) => {
        const next = new Set(prev ?? []);
        next.add(songId);
        return next;
      });
      emitFavoritesChanged();
    },
    onError: (e) => {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onRequireLogin?.();
        return;
      }
      if (status === 409) {
        // đã tồn tại -> coi như OK
        return;
      }
      toast.error(e?.response?.data?.message ?? "Thêm vào yêu thích thất bại.");
    },
  });

  const mRemove = useMutation({
    mutationFn: (songId) => removeFavoriteSong(songId),
    onSuccess: (_data, songId) => {
      qc.setQueryData(["favorites", "ids"], (prev) => {
        const next = new Set(prev ?? []);
        next.delete(songId);
        return next;
      });
      emitFavoritesChanged();
    },
    onError: (e) => {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        onRequireLogin?.();
        return;
      }
      toast.error(e?.response?.data?.message ?? "Bỏ yêu thích thất bại.");
    },
  });

  const toggleFavorite = useCallback(
    (songOrId, songTitle) => {
      if (!ensureLogin()) return;

      const songId =
        typeof songOrId === "object" ? normalizeSongId(songOrId) : songOrId;
      if (songId == null) {
        toast.error("Thiếu songId.");
        return;
      }

      const currentlyFav = favoriteIds.has(songId);
      if (currentlyFav) {
        mRemove.mutate(songId);
        if (songTitle) toast.success(`Đã bỏ yêu thích: ${songTitle}`);
      } else {
        mAdd.mutate(songId);
        if (songTitle) toast.success(`Đã thêm yêu thích: ${songTitle}`);
      }
    },
    [ensureLogin, favoriteIds, mAdd, mRemove]
  );

  const refreshFavorites = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["favorites", "ids"] });
  }, [qc]);

  return {
    hasToken,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
    isLoading: qIds.isLoading,
    isMutating: Boolean(mAdd.isPending || mRemove.isPending),
  };
}
