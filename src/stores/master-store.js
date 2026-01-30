import { create } from "zustand";

export const useMasterStore = create((set) => ({
  prodects: [],
  tasks: [],
  tools: [],
  accounts: [],

  setProdects: (prodects) => set({ prodects }),
  setTasks: (tasks) => set({ tasks }),
  setTools: (tools) => set({ tools }),
  setAccounts: (accounts) => set({ accounts }),

  setAll: ({ products, tasks, tools, accounts }) =>
    set({
      products,
      tasks,
      tools,
      accounts,
    }),
}));
