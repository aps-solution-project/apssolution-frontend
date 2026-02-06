import scenarioMock from "@/data/scenarioMock.json";
import SimulationGantt from "@/components/workerGantt/SimulationGantt";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function WorkerIndexPage() {
  const products = scenarioMock?.scenarioProductList ?? [];
  const scenarioStart = scenarioMock?.scenario?.startAt;
  return (
    <div className="h-full w-full p-4 bg-slate-50">
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/simulations">시뮬레이션</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>인원별 작업</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <SimulationGantt products={products} scenarioStart={scenarioStart} />
    </div>
  );
}
