import { useState } from "react";
import { useMasterStore } from "@/stores/master-store";
import { useScenario } from "@/hooks/use-scenario";

export default function ScenarioCreate() {
  const { createScenario, runSimulation } = useScenario();
  const { products = [], tasks = [] } = useMasterStore();

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [title, setTitle] = useState("New Scenario");
  const [maxWorkerCount, setMaxWorkerCount] = useState(3);

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

    const token = localStorage.getItem("token");

    const scenario = await createScenario(token, payload);
    await runSimulation(token, scenario.id);
  };

  return (
    <div>
      <h2>시나리오 생성</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="시나리오 제목"
      />

      <select onChange={(e) => setProductId(e.target.value)}>
        <option value="">제품 선택</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Number(e.target.value))}
      />

      <input
        type="number"
        value={maxWorkerCount}
        onChange={(e) => setMaxWorkerCount(Number(e.target.value))}
      />

      <button onClick={handleCreate}>시나리오 생성 + 시뮬레이션</button>
    </div>
  );
}
