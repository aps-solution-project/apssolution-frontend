import {
  postScenario,
  getScenarioResult,
  simulateScenario,
  getScenarios,
} from "@/api/scenario-api";

import { useScenarioStore } from "@/stores/scenario-store";

export function useScenario() {
  const {
    setScenarios,
    setCurrentScenario,
    startSimulation,
    setResult,
    setError,
  } = useScenarioStore();

  // 시나리오 목록 불러오기
  const loadScenarios = async (token) => {
    try {
      const data = await getScenarios(token);
      setScenarios(data);
    } catch (e) {
      console.error(e);
    }
  };

  // 시나리오 생성
  const createScenario = async (token, payload) => {
    try {
      const scenario = await postScenario(token, payload);
      setCurrentScenario(scenario);
      return scenario;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 엔진 실행
  const runSimulation = async (token, scenarioId) => {
    try {
      startSimulation();
      await simulateScenario(token, scenarioId);
      const result = await getScenarioResult(token, scenarioId);
      setResult(result);
    } catch (e) {
      console.error(e);
      setError();
    }
  };

  return {
    loadScenarios,
    createScenario,
    runSimulation,
  };
}
