import { create } from "zustand";

export const useStomp = create((set, get) => ({
  stomp: null,

  totalUnreadCount: 0,

  hasUnread: {
    "/chat/chat-list": false,
  },

  currentChatId: null,

  /* =========================
     현재 보고 있는 채팅방
  ========================= */
  setCurrentChatId: (id) => set({ currentChatId: id }),

  /* =========================
     🔥 refresh 전용
  ========================= */
  markChatUnread: () =>
    set((state) => ({
      hasUnread: {
        ...state.hasUnread,
        "/chat/chat-list": true,
      },
    })),

  /* =========================
     🔥 실제 메시지 전용
  ========================= */
  increaseUnreadIfNeeded: (msg, myUserId) => {
    const { currentChatId, totalUnreadCount, hasUnread } = get();

    if (!msg?.chatId) return;
    if (msg.type === "LEAVE") return;
    if (String(msg.talker?.userId) === String(myUserId)) return;
    if (String(msg.chatId) === String(currentChatId)) return;

    set({
      totalUnreadCount: totalUnreadCount + 1,
      hasUnread: {
        ...hasUnread,
        "/chat/chat-list": true,
      },
    });
  },

  /* =========================
     초기화 / 제어
  ========================= */
  clearUnread: (path) =>
    set((state) => ({
      hasUnread: {
        ...state.hasUnread,
        [path]: false,
      },
    })),

  setTotalUnreadCount: (count) =>
    set({
      totalUnreadCount: count,
      hasUnread: {
        "/chat/chat-list": count > 0,
      },
    }),

  setStomp: (client) => set({ stomp: client }),
  clearStomp: () => set({ stomp: null }),
}));
