import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Package,
  Users,
  PlayCircle,
} from "lucide-react";

import SimulationGantt from "@/components/gantt/SimulationGantt";
import SimulationGanttForWorker from "@/components/gantt/SimulationGanttForWorker";
import scenarioMock from "@/data/scenarioMock.json";

export default function SimulationPage() {
  const [data, setData] = useState(scenarioMock);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 뷰 모드 읽기, 기본값은 "product"
  const [viewMode, setViewMode] = useState(
    searchParams.get("view") || "product",
  );

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

  // 뷰 모드 변경 핸들러 - URL도 함께 업데이트
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    router.push(`?view=${mode}`, { scroll: false });
  };

  // URL 변경 감지하여 뷰 모드 동기화
  useEffect(() => {
    const view = searchParams.get("view");
    if (view && (view === "product" || view === "worker")) {
      setViewMode(view);
    }
  }, [searchParams]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0 rounded-t-[32px]">
        <div className="mb-3">
          {/* <Breadcrumb>
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
          </Breadcrumb> */}

          {/* Page Title & Actions */}
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              {/* 공지사항의 Notice 뱃지 느낌을 Simulation으로 재해석 */}
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <PlayCircle size={20} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Simulation
                </span>
              </div>

              {/* 메인 타이틀: font-black & 3xl 적용 */}
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {scenario.title || "시뮬레이션"}
              </h1>

              {/* 설명 문구: 총 작업 수 등을 포함하여 디테일 추가 */}
              <p className="text-sm text-slate-400 font-medium">
                {scenario.description || "생산 일정 시뮬레이션 및 작업 관리"}{" "}
                (총{" "}
                <span className="text-slate-600 font-bold">{totalTasks}</span>
                개의 작업)
              </p>
            </div>

            {/* 액션 버튼: 공지 작성 버튼처럼 둥글고 존재감 있게 */}
            <div className="flex items-center gap-3 mb-5">
              <Button
                onClick={handleRefresh}
                className="h-11 px-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold shadow-sm hover:bg-slate-100 transition flex items-center gap-2"
              >
                <RefreshCwIcon size={16} className="text-slate-500" />
                <span>새로고침</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50/50 rounded-b-2xl">
        <div className="p-6 space-y-6 min-w-[1000px]">
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

        {/* Gantt Chart - 뷰 모드 전환 */}
        <Card className="overflow-hidden">
          {/* 뷰 모드 전환 버튼 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                <Button
                  variant={viewMode === "product" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("product")}
                  className="gap-2"
                >
                  <Package className="h-4 w-4" />
                  품목별
                </Button>
                <Button
                  variant={viewMode === "worker" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("worker")}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  작업자별
                </Button>
              </div>

              <div className="h-4 w-px bg-slate-200 mx-2" />

              <p className="text-xs text-slate-500">
                {viewMode === "product"
                  ? "품목별로 스케줄을 확인합니다"
                  : "작업자별로 스케줄을 확인합니다"}
              </p>
            </div>
          </div>

          {/* Gantt Chart */}
          {viewMode === "product" ? (
            <SimulationGantt
              key="product-gantt"
              products={products}
              scenarioStart={scenario.startAt}
            />
          ) : (
            <SimulationGanttForWorker
              key="worker-gantt"
              products={products}
              scenarioStart={scenario.startAt}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
