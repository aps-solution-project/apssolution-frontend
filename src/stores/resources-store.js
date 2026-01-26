import { getProducts } from "@/api/page-api";
import { useToken } from "@/stores/account-store";
import { create } from "zustand";

export const useResourcesStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    const token = useToken.getState().token;

    if (!token) {
      console.warn("fetchProducts blocked: no token");
      return;
    }

    set({ loading: true, error: null });

    try {
      const data = await getProducts(token);
      set({ products: data.products });
    } catch (err) {
      console.error(err);
      set({ error: "자료를 불러오지 못했습니다." });
    } finally {
      set({ loading: false });
    }
  },

  clearProducts: () => set({ products: [] }),
}));
