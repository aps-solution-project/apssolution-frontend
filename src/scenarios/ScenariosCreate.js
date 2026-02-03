import { fetcher } from "@/api/fetcher.api";
import { useAuthGuard } from "@/hooks/use-authGuard";
import { useScenario } from "@/hooks/use-scenario";
import { useAccount } from "@/stores/account-store";
import { useEffect, useState } from "react";
import ScenarioResult from "./ScenarioResult";

export default function ScenarioCreate() {
  useAuthGuard();

  const { createScenario, runSimulation } = useScenario();
  const { account, setAccount } = useAccount();

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [title, setTitle] = useState("New Scenario");
  const [maxWorkerCount, setMaxWorkerCount] = useState(3);
  const [products, setProducts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tools, setTools] = useState([]);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const productsRes = await fetcher.getProducts();
        const tasksRes = await fetcher.getTasks();
        const toolsRes = await fetcher.getAllTools();

        setProducts(productsRes.products || productsRes.content || []);
        setTasks(tasksRes.tasks || tasksRes.content || []);
        setTools(toolsRes.tools || toolsRes.content || []);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    loadData();
  }, []);

  const buildScenarioProduct = () => {
    const relatedTasks = tasks
      .filter((t) => t.productId === productId)
      .sort((a, b) => a.seq - b.seq);

    return {
      productId,
      qty,
      tasks: relatedTasks.map((t) => ({
        taskId: t.id,
        seq: t.seq,
        duration: t.duration,
      })),
    };
  };

  const handleCreate = async () => {
    if (!productId) return alert("제품 선택하세요");

    const payload = {
      title,
      startAt: new Date().toISOString(),
      maxWorkerCount,
      scenarioProduct: [buildScenarioProduct()],
    };

    try {
      setLoading(true);
      setStatus("SIMULATING");

      const scenario = await createScenario(payload);
      const simulationResult = await runSimulation(scenario.id);

      setResult(simulationResult);
      setStatus("OPTIMAL");
      setLoading(false);
    } catch (e) {
      console.error(e);
      setStatus("ERROR");
      setLoading(false);
      alert("시나리오 생성 실패");
    }
  };

  return (
    <div>
      <h2>시나리오 생성</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="시나리오 제목"
      />

      <select value={productId} onChange={(e) => setProductId(e.target.value)}>
        <option value="">제품 선택</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      <input
        type="number"
        min="1"
        value={maxWorkerCount}
        onChange={(e) => setMaxWorkerCount(Number(e.target.value))}
      />

      <button onClick={handleCreate} disabled={loading}>
        {loading ? "처리 중..." : "시나리오 생성 + 시뮬레이션"}
      </button>

      <ScenarioResult
        result={result}
        status={status}
        tools={tools}
        accounts={account}
      />
    </div>
  );
}
