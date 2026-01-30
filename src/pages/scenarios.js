import { useMasterData } from "@/hooks/use-masterData";
import ScenarioCreate from "@/scenarios/ScenariosCreate";

export default function ScenariosPage() {
  const { loading } = useMasterData();

  if (loading) return <div>Loading master data...</div>;

  return <ScenarioCreate />;
}
