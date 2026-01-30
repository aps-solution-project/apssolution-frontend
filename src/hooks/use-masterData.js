import { useEffect, useState } from "react";
import { useMasterStore } from "@/stores/master-store";

export function useMasterData(loaders) {
  const setAll = useMasterStore((state) => state.setAll);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const [products, tasks, tools, accounts] = await Promise.all([
          loaders.getProducts(),
          loaders.getTasks(),
          loaders.getTools(),
          loaders.getAccounts(),
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
