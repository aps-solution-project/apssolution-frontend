import { create } from "zustand";

export const useStomp = create((set, get) => ({
  stomp: null,

  totalUnreadCount: 0,

  // 메뉴/경로별 unread 상태
  hasUnread: {
    "/chat/chat-list": false,
  },

  currentChatId: null,

  setCurrentChatId: (id) => set({ currentChatId: id }),

  increaseUnreadIfNeeded: (msg, myUserId) => {
    const { currentChatId, totalUnreadCount, hasUnread } = get();

    if (msg.type === "LEAVE") return;
    if (String(msg.talker?.userId) === String(myUserId)) return;
    if (String(msg.chatId) === String(currentChatId)) return;

    set({
      totalUnreadCount: totalUnreadCount + 1,
      hasUnread: {
        ...hasUnread,
        "/chat/chat-list": true, // 채팅 메뉴에 배지
      },
    });
  },

  clearUnread: (path) =>
    set((state) => ({
      hasUnread: {
        ...state.hasUnread,
        [path]: false,
      },
    })),

  clearStomp: () => set({ stomp: null }),

  setStomp: (newStomp) => set({ stomp: newStomp }),

  setTotalUnreadCount: (count) =>
    set({
      totalUnreadCount: count,
      hasUnread: {
        "/chat/chat-list": count > 0,
      },
    }),
}));