import { create } from "zustand";

export const useStomp = create(
  function (set) {
    return {
      stomp: null,

      clearStomp: function () {
        set({ stomp: null });
      },

      setStomp: function (newStomp) {
        set({ stomp: newStomp });
      },
    };
  },
  {
    name: "stomp",
  },
);
