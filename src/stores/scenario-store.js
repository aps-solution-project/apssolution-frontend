import { create } from "zustand";

export const useScenarioStore = create((set) => ({
  //  전체 시나리오 목록
  scenarios: [],

  //  현재 작업중인 시나리오
  currentScenario: null,

  //  시뮬레이션 결과
  result: null,

  // 흐름 상태
  status: "IDLE",

  loading: false,

  setScenarios: (scenarios) => set({ scenarios }),

  setCurrentScenario: (scenario) =>
    set({ currentScenario: scenario, status: "CREATED" }),

  startSimulation: () => set({ loading: true, status: "SIMULATING" }),

  setResult: (result) => set({ result, loading: false, status: "OPTIMAL" }),

  setError: () => set({ loading: false, status: "ERROR" }),

  reset: () =>
    set({
      currentScenario: null,
      result: null,
      status: "IDLE",
      loading: false,
    }),
}));
