import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * authStore
 * Quản lý trạng thái user (thông tin user, loading, session).
 * Giúp các component check auth dễ dàng mà không cần pass props (prop drilling).
 * Sử dụng persist middleware để lưu state vào localStorage
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthLoading: false,

      setUser: (user) => set({ user }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),
      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user }),
    }
  )
);

