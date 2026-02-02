import { useEffect, useState } from "react";
import { useMasterStore } from "@/stores/master-store";
import { fetcher } from "@/api/fetcher.api";

export function useMasterData() {
  const setAll = useMasterStore((s) => s.setAll);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function load() {
      const productsRes = await fetcher.getProducts();
      const tasksRes = await fetcher.getTasks();
      const toolsRes = await fetcher.getAllTools();
      const accountsRes = await fetcher.getAllAccounts();

      setAll({
        products: productsRes.products || productsRes.content || productsRes,
        tasks: tasksRes.tasks || tasksRes.content || tasksRes,
        tools: toolsRes.tools || toolsRes.content || toolsRes,
        accounts: accountsRes.accounts || accountsRes.content || accountsRes,
      });

      setLoading(false);
    }

    load();
  }, []);

  return { loading };
}
