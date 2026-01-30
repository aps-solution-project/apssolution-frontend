import { fetcher } from "@/api/fetcher.api";
import { useScenarioStore } from "@/stores/scenario-store";

export function useScenario() {
  const {
    setScenarios,
    setCurrentScenario,
    startSimulation,
    setResult,
    setError,
  } = useScenarioStore();

  // 시나리오 목록
  const loadScenarios = async () => {
    try {
      const data = await fetcher.getScenarios();
      setScenarios(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 시나리오 생성
  const createScenario = async (payload) => {
    try {
      const res = await fetcher.postScenario(payload);

      const scenario = res.data || res.scenario || res;

      console.log("created scenario 👉", scenario);

      setCurrentScenario(scenario);
      return scenario;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 시뮬레이션 실행
  const runSimulation = async (scenarioId) => {
    try {
      startSimulation();

      await fetcher.simulateScenario(scenarioId);

      const result = await fetcher.getScenarioResult(scenarioId);
      setResult(result);
    } catch (e) {
      console.error(e);
      setError(e);
    }
  };

  return {
    loadScenarios,
    createScenario,
    runSimulation,
  };
}
