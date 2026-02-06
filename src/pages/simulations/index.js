import scenarioMock from "@/data/scenarioMock.json";
import SimulationGantt from "@/components/gantt/SimulationGantt";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function SimulationsPage() {
  const products = scenarioMock?.scenarioProductList ?? [];
  const scenarioStart = scenarioMock?.scenario?.startAt;

  return (
    <div className="h-full w-full p-4 bg-slate-50">
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>시뮬레이션</BreadcrumbPage>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/simulations/workerIndex">인원별 작업</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SimulationGantt products={products} scenarioStart={scenarioStart} />
    </div>
  );
}
