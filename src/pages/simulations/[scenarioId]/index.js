"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  Package,
  PlayCircle,
  RefreshCwIcon,
  Users,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getScenarioResult } from "@/api/scenario-api";
import SimulationGantt from "@/components/gantt/SimulationGantt";
import SimulationGanttForWorker from "@/components/gantt/SimulationGanttForWorker";
import { useToken } from "@/stores/account-store";

export default function SimulationPage() {
  const [data, setData] = useState({});
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useToken();

  const scenarioId = params.scenarioId;

  // URL에서 뷰 모드 읽기
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

  // 뷰 모드 변경 → URL 동기화 (app router 방식)
  const handleViewModeChange = (mode) => {
    if (!scenarioId) return;

    setViewMode(mode);

    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);

    router.replace(`/simulations/${scenarioId}?${params.toString()}`, {
      scroll: false,
    });
  };

  // URL 변경 시 viewMode 동기화
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "product" || view === "worker") {
      setViewMode(view);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!token || !scenarioId) return;
    getScenarioResult(token, scenarioId).then((obj) => setData(obj));
  }, [scenarioId, token]);

  if (!data.scenario) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0 rounded-t-[32px]">
        <div className="mb-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <PlayCircle size={20} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Simulation
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {scenario.title || "시뮬레이션"}
              </h1>

              <p className="text-sm text-slate-400 font-medium">
                {scenario.description || "생산 일정 시뮬레이션"} (총{" "}
                <span className="text-slate-600 font-bold">{totalTasks}</span>
                개)
              </p>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <Button className="h-11 px-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold">
                <RefreshCwIcon size={16} />
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50/50 rounded-b-2xl">
        <div className="p-6 space-y-6 min-w-[1000px]">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between border-b pb-6">
                <div>
                  <p className="text-xs text-slate-500">시뮬레이션 ID</p>
                  <p className="text-lg font-bold">{scenario.id}</p>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="border-b pb-6">
                <p className="text-xs flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  시작 시간
                </p>
                <p className="font-semibold">
                  {formatDateTime(scenario.startAt)}
                </p>
              </div>

              <div>
                <p className="text-xs flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />총 소요시간
                </p>
                <p className="text-lg font-bold">{scenario.makespan || 0}분</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b">
            <Button
              size="sm"
              variant={viewMode === "product" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("product")}
            >
              <Package className="h-4 w-4" />
              품목별
            </Button>
            <Button
              size="sm"
              variant={viewMode === "worker" ? "default" : "ghost"}
              onClick={() => handleViewModeChange("worker")}
            >
              <Users className="h-4 w-4" />
              작업자별
            </Button>
          </div>

          {viewMode === "product" ? (
            <SimulationGantt
              products={products}
              scenarioStart={scenario.startAt}
            />
          ) : (
            <SimulationGanttForWorker
              products={products}
              scenarioStart={scenario.startAt}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
