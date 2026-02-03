import { create } from "zustand";

export const useStomp = create((set) => ({
  stomp: null,
  totalUnreadCount: 0,

  clearStomp: () => set({ stomp: null }),

  setStomp: (newStomp) => set({ stomp: newStomp }),

  setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
}));
