import scenarioMock from "@/data/scenarioMock.json";
import SimulationGantt from "@/components/gantt/SimulationGantt";

export default function SimulationsPage() {
  const products = scenarioMock?.scenarioProductList ?? [];
  const scenarioStart = scenarioMock?.scenario?.startAt;

  return (
    <div className="h-full w-full p-4 bg-slate-50">
      <SimulationGantt products={products} scenarioStart={scenarioStart} />
    </div>
  );
}
