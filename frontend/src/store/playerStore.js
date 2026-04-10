import { create } from "zustand";

/**
 * playerStore
 * Teamwork Note: Quản lý trạng thái bài hát đang phát (now playing).
 * Tách khỏi App.jsx để tránh re-render toàn bộ app khi đổi bài.
 */
export const usePlayerStore = create((set) => ({
  nowPlaying: null,
  isPlaying: false,

  setNowPlaying: (song) => set({ nowPlaying: song, isPlaying: true }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  clearPlayer: () => set({ nowPlaying: null, isPlaying: false }),
}));
