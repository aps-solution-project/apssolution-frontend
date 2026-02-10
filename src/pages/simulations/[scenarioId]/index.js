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

import { getActiveAccounts } from "@/api/auth-api";
import { getScenarioResult } from "@/api/scenario-api";
import SimulationGantt from "@/components/gantt/SimulationGantt";
import SimulationGanttForWorker from "@/components/gantt/SimulationGanttForWorker";
import { useToken } from "@/stores/account-store";

const PRODUCT_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

export default function SimulationPage() {
  const [data, setData] = useState({});
  const [workers, setWorkers] = useState([]);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useToken();

  const scenarioId = params.scenarioId;

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

  const handleViewModeChange = (mode) => {
    if (!scenarioId) return;
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`/simulations/${scenarioId}?${params.toString()}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "product" || view === "worker") {
      setViewMode(view);
    }
  }, [searchParams]);

  const fetchData = () => {
    if (!token || !scenarioId) return;
    getScenarioResult(token, scenarioId).then((obj) => setData(obj));
  };

  useEffect(() => {
    fetchData();
  }, [scenarioId, token]);

  useEffect(() => {
    if (!token) return;
    getActiveAccounts(token)
      .then((res) => {
        // 응답이 배열이면 그대로, 아니면 내부 배열 필드 탐색
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && typeof res === "object") {
          // { data: [...] }, { accounts: [...] }, { content: [...] } 등 대응
          const arrField = Object.values(res).find((v) => Array.isArray(v));
          if (arrField) list = arrField;
        }
        setWorkers(list);
      })
      .catch((err) => {
        setWorkers([]);
      });
  }, [token]);

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
              <Button
                onClick={fetchData}
                className="h-11 px-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold"
              >
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
          {/* 시뮬레이션 ID 카드 + 제품 목록 카드 (가로 배치) */}
          <div className="flex gap-6 items-start">
            <Card className="p-6 w-[380px] shrink-0">
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

                <div className="border-b pb-6">
                  <p className="text-xs flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />총 소요시간
                  </p>
                  <p className="text-lg font-bold">
                    {scenario.makespan || 0}
                    <span className="text-sm font-medium text-slate-500 ml-1">
                      분
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-xs flex items-center gap-1">
                    <Package className="w-3 h-3" />총 제품 / 작업
                  </p>
                  <p className="text-lg font-bold">
                    {products.length}{" "}
                    <span className="text-sm font-normal text-slate-400">
                      / {totalTasks}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                제품 목록
              </h2>

              <div className="space-y-3">
                {products.map((p, idx) => {
                  const scheduleCount = p.scenarioSchedules?.length || 0;
                  const colorClass =
                    PRODUCT_COLORS[idx % PRODUCT_COLORS.length];
                  const initial = (p.name || p.id || "?").charAt(0);

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${colorClass}`}
                      >
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {p.name || p.id}
                        </p>
                        {p.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">작업 수</p>
                        <p className="text-lg font-bold text-slate-700 leading-tight">
                          {scheduleCount}
                        </p>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-xs text-slate-400 font-mono">
                          {p.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* 간트 차트 */}
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
              workers={workers}
              token={token}
            />
          ) : (
            <SimulationGanttForWorker
              products={products}
              scenarioStart={scenario.startAt}
              workers={workers}
              token={token}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
