import { create } from "zustand";

/**
 * authStore
 * Teamwork Note: Quản lý trạng thái user (thông tin user, loading, session).
 * Giúp các component check auth dễ dàng mà không cần pass props (prop drilling).
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthLoading: false,

  setUser: (user) => set({ user }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null });
  },
}));
