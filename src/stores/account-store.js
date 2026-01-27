import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAccount = create(
  persist(
    (set) => ({
      account: null,
      role: null,
      accountName: null,
      flag: false,
      clearAccount: () =>
        set({
          account: null,
          role: null,
          accountName: null,
        }),

      setAccount: (newAccount) =>
        set({
          account: newAccount,
          role: newAccount?.role ?? null,
          accountName: newAccount?.accountName ?? null,
        }),
    }),
    {
      name: "account",
      onRehydrateStorage: () => () => {
        useAccount.setState({ flag: true });
      },
    },
  ),
);

export const useToken = create(
  persist(
    (set) => ({
      token: null,
      flag: false,
      clearToken: () => set({ token: null }),
      setToken: (newToken) => set({ token: newToken }),
    }),
    {
      name: "token",
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useToken.setState({ flag: true });
      },
    },
  ),
);
