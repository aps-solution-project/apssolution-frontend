import { useEffect, useState } from "react";
import { useMasterStore } from "@/stores/master-store";

import { getProducts } from "@/api/product-api";
import { getTasks } from "@/api/task-api";
import { getTools } from "@/api/tool-api";
import { getAccounts } from "@/api/auth-api";

export function useMasterData() {
  const setAll = useMasterStore((state) => state.setAll);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const [products, tasks, tools, accounts] = await Promise.all([
          getProducts(),
          getTasks(),
          getTools(),
          getAccounts(),
        ]);

        if (!mounted) return;

        setAll({ products, tasks, tools, accounts });
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { loading, error };
}
