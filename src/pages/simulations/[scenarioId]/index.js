import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarIcon,
  ClockIcon,
  Package,
  PlayCircle,
  RefreshCwIcon,
  ScrollText,
  Users,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

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

  //작업목록 페이징
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
                <span className="text-sm font-black uppercase tracking-widest">
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

            <div className="flex items-center gap-3 mb-3 mr-10">
              <Button
                onClick={fetchData}
                className="h-11 px-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-emerald-600 hover:text-white cursor-pointer "
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
            <Card className="p-6 w-[380px] h-[420px] shrink-0">
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <p className="text-sm text-slate-500 mb-2">시뮬레이션 ID</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-sky-500 ">
                      {scenario.id}
                    </p>

                    <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-[11px] leading-none font-semibold">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <CalendarIcon className="w-3 h-3 " />
                    시작 시간
                  </p>
                  <p className="font-semibold ml-3">
                    {formatDateTime(scenario.startAt)}
                  </p>
                </div>

                <div className="border-b pb-6 ">
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <ClockIcon className="w-3 h-3" />총 소요시간
                  </p>
                  <p className="text-lg font-bold  ml-3">
                    {scenario.makespan || 0}
                    <span className="text-lg font-medium text-slate-500 ml-1">
                      분
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <Package className="w-3 h-3" />총 제품 / 작업
                  </p>
                  <p className="text-lg font-bold ml-3">
                    {products.length}{" "}
                    <span className="text-lg font-normal text-slate-600 ">
                      / {totalTasks}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 flex-1 min-w-0 h-[420px] flex flex-col">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
                <ScrollText className="h-5 w-5 text-slate-600" />
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
                          <p className="text-sm text-slate-600 truncate mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0">
                        <div className="flex items-baseline justify-end gap-2 whitespace-nowrap">
                          <span className="text-[13px] text-slate-600">
                            작업 수
                          </span>
                          <span className="text-lg font-bold text-slate-700 leading-tight">
                            {scheduleCount}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-sm text-slate-400 font-mono">
                          {p.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <span className="text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* 간트 차트 */}
        <Card className="overflow-hidden">
          <div className="flex items-end gap-1 px-4 pt-3 border-b border-slate-200 bg-slate-50">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewModeChange("product")}
              className={[
                "h-9 px-4 rounded-b-none border border-b-0 text-sm font-medium",
                viewMode === "product"
                  ? "bg-white text-slate-900 border-slate-300 -mb-px"
                  : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200",
              ].join(" ")}
            >
              <Package className="h-4 w-4 mr-1" />
              품목별
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleViewModeChange("worker")}
              className={[
                "h-9 px-4 rounded-b-none border border-b-0 text-sm font-medium",
                viewMode === "worker"
                  ? "bg-white text-slate-900 border-slate-300 -mb-px"
                  : "bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200",
              ].join(" ")}
            >
              <Users className="h-4 w-4 mr-1" />
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
