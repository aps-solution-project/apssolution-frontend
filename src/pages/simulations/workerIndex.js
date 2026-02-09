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
  UsersIcon,
  LayoutGridIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
} from "lucide-react";

import WorkerGantt from "@/components/gantt/WorkerGantt";
import scenarioMock from "@/data/scenarioMock.json";

export default function WorkerIndex() {
  const [data, setData] = useState(scenarioMock);

  const scenario = data?.scenario || {};
  const products = data?.scenarioProductList || [];

  // 작업자별 작업 집계
  const workerMap = new Map();

  products.forEach((product) => {
    product.scenarioSchedules?.forEach((schedule) => {
      const workerId = schedule.workerId || schedule.worker?.id || "미할당";
      const workerName = schedule.worker?.name || `작업자 ${workerId}`;

      if (!workerMap.has(workerId)) {
        workerMap.set(workerId, {
          id: workerId,
          name: workerName,
          tasks: [],
          totalDuration: 0,
          completedTasks: 0,
        });
      }

      const worker = workerMap.get(workerId);
      worker.tasks.push({
        ...schedule,
        productName: product.name,
        productId: product.id,
      });
      worker.totalDuration += schedule.duration || 0;
      if (schedule.status === "completed") {
        worker.completedTasks += 1;
      }
    });
  });

  const workers = Array.from(workerMap.values());
  const totalTasks = workers.reduce((sum, w) => sum + w.tasks.length, 0);
  const totalCompletedTasks = workers.reduce(
    (sum, w) => sum + w.completedTasks,
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
                <BreadcrumbPage>작업자 관리</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Page Title & Actions */}
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">작업자 관리</h1>
              <p className="text-sm text-slate-500 mt-1">
                인원별 작업 할당 현황 및 일정 관리
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
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="flex gap-6 mb-6">
          {/* 통계 카드 */}
          <Card className="p-6">
            <div className="space-y-6">
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

              {/* 총 작업자 */}
              <div className="pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" />총 작업자
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {workers.length}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    명
                  </span>
                </p>
              </div>

              {/* 총 작업 수 */}
              <div className="pb-6 border-b border-slate-200">
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />총 작업 수
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {totalTasks}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    개
                  </span>
                </p>
              </div>

              {/* 완료된 작업 */}
              <div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <CheckCircle2Icon className="w-3 h-3" />
                  완료된 작업
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {totalCompletedTasks}
                  <span className="text-sm font-normal text-slate-500 mx-1">
                    /
                  </span>
                  {totalTasks}
                </p>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* 작업자 목록 */}
          <Card className="p-6 flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              작업자 목록
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {workers.map((worker) => (
                <div
                  key={worker.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {worker.name?.charAt(0) || "W"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-900">
                          {worker.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            ID: {worker.id}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            총 {worker.totalDuration}분
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">할당된 작업</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                        <p className="text-sm font-bold text-slate-900">
                          {worker.completedTasks}
                        </p>
                        <span className="text-slate-400">/</span>
                        <CircleDashedIcon className="w-4 h-4 text-slate-400" />
                        <p className="text-sm font-bold text-slate-900">
                          {worker.tasks.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Gantt Chart - 작업자별 */}
        <Card className="overflow-hidden">
          <WorkerGantt workers={workers} scenarioStart={scenario.startAt} />
        </Card>
      </div>
    </div>
  );
}
