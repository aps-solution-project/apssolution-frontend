import { create } from "zustand";

export const useStomp = create((set, get) => ({
  stomp: null,
  totalUnreadCount: 0,
  hasUnread: false,
  currentChatId: null,

  setCurrentChatId: (id) => set({ currentChatId: id }),

  increaseUnreadIfNeeded: (msg, myUserId) => {
    const { currentChatId, totalUnreadCount } = get();

    // 퇴장 알림 메시지는 카운트하지 않음
    if (msg.type === "LEAVE") return;
    // 내가 보낸 메시지는 제외
    if (String(msg.talker?.userId) === String(myUserId)) return;
    // 현재 보고 있는 채팅방이면 제외
    if (String(msg.chatId) === String(currentChatId)) return;

    set({
      totalUnreadCount: totalUnreadCount + 1,
      hasUnread: true,
    });
  },

  clearStomp: () => set({ stomp: null }),

  setStomp: (newStomp) => set({ stomp: newStomp }),

  setTotalUnreadCount: (count) =>
    set({ totalUnreadCount: count, hasUnread: count > 0 }),
}));
