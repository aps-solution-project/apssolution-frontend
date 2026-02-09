import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ClockIcon,
  PackageIcon,
  LayoutGridIcon,
  RefreshCwIcon,
} from "lucide-react";

import SimulationGantt from "@/components/gantt/SimulationGantt";
import scenarioMock from "@/data/scenarioMock.json";

export default function SimulationPage() {
  const [data, setData] = useState(scenarioMock);

  const scenario = data?.scenario || {};
  const products = data?.scenarioProductList || [];

  const totalTasks = products.reduce(
    (sum, p) => sum + (p.scenarioSchedules?.length || 0),
    0,
  );

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = () => {
    console.log("Refreshing data...");
    setData({ ...scenarioMock });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-2">
                  <LayoutGridIcon className="w-4 h-4" />
                  대시보드
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/scenarios/create/form">
                  시나리오 관리
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>시뮬레이션</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Title & Actions */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {scenario.title || "시뮬레이션"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {scenario.description || "생산 일정 시뮬레이션 및 작업 관리"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCwIcon className="w-4 h-4" />
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-450 mx-auto px-6 py-6">
        <div className="flex gap-6 mb-6">
          <Card className="p-6">
            <div className="space-y-6">
              {/* 시뮬레이션 ID */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    시뮬레이션 ID
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {scenario.id || "-"}
                  </p>
                </div>
                <Badge variant="outline" className="h-fit">
                  Active
                </Badge>
              </div>

              {/* 시작 시간 */}
              <div className="pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  시작 시간
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1">
                  {formatDateTime(scenario.startAt)}
                </p>
              </div>

              {/* 총 소요시간 */}
              <div className="pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />총 소요시간
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {scenario.makespan || 0}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    분
                  </span>
                </p>
              </div>

              {/* 제품 / 작업 */}
              <div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <PackageIcon className="w-3 h-3" />
                  제품 / 작업
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {products.length}
                  <span className="text-sm font-normal text-slate-500 mx-1">
                    /
                  </span>
                  {totalTasks}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              제품 목록
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {product.name?.charAt(0) || "P"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900">
                          {product.name}
                        </h4>
                        <p className="text-sm text-slate-500 truncate">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">작업 수</p>
                      <p className="text-lg font-bold text-slate-900">
                        {product.scenarioSchedules?.length || 0}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card className="overflow-hidden">
          <SimulationGantt
            products={products}
            scenarioStart={scenario.startAt}
          />
        </Card>
      </div>
    </div>
  );
}
