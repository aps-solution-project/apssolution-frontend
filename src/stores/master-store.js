import { create } from "zustand";

export const useMasterStore = create((set) => ({
  products: [],
  tasks: [],
  tools: [],
  accounts: [],

  setAll: ({ products, tasks, tools, accounts }) =>
    set({
      products,
      tasks,
      tools,
      accounts,
    }),
}));
