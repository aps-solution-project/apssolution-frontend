import { fetcher } from "@/api/fetcher.api";

export function useScenario() {
  // 시나리오 목록 로드
  const loadScenarios = async () => {
    try {
      const data = await fetcher.getScenarios();
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 시나리오 생성
  const createScenario = async (payload) => {
    try {
      const res = await fetcher.postScenario(payload);
      const scenario = res.data || res.scenario || res;
      return scenario;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 시뮬레이션 실행
  const runSimulation = async (scenarioId) => {
    try {
      await fetcher.simulateScenario(scenarioId);
      const result = await fetcher.getScenarioResult(scenarioId);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  return {
    loadScenarios,
    createScenario,
    runSimulation,
  };
}
