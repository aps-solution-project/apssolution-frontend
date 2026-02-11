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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getTodaySchedules } from "@/api/scenario-api";
import SimulationGanttForWorker from "@/components/gantt/SimulationGanttForWorker";
import { SimulationContext } from "@/components/gantt/GanttBar";
import { useToken, useAccount } from "@/stores/account-store";

const PRODUCT_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

export default function DeploymentPage() {
  const { token } = useToken();
  const { account } = useAccount();

  const [scenario, setScenario] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const totalTasks = products.reduce(
    (sum, p) => sum + (p.scenarioSchedules?.length || 0),
    0,
  );

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // 데이터 조회
  const fetchData = () => {
    if (!token) return;
    setLoading(true);
    getTodaySchedules(token)
      .then((res) => {
        if (res?.scenario) {
          setScenario(res.scenario);
          const prods = (res.products || []).map((p) => ({
            ...p,
            scenarioSchedules: (p.scenarioSchedules || []).map((s) => ({
              ...s,
              productName: p.name,
              originalTaskName: s.scheduleTask?.name,
              scheduleTask: {
                ...s.scheduleTask,
                name: p.name,
              },
              worker: s.worker || { id: "self", name: account.name || "나" },
            })),
          }));
          setProducts(prods);
        } else {
          setScenario(null);
          setProducts([]);
        }
      })
      .catch(() => {
        setScenario(null);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [token]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500">시나리오를 불러오는 중...</p>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-400">배포된 시나리오가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0 rounded-t-[32px]">
        <div className="mb-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <PlayCircle size={20} />
                <span className="text-sm font-black uppercase tracking-widest">
                  Production Schedule
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                {scenario.title || "생산 일정"}
              </h1>

              <p className="text-sm text-slate-400 font-medium">
                {scenario.description || "배포된 생산 일정"} (총{" "}
                <span className="text-slate-600 font-bold">{totalTasks}</span>
                개)
              </p>
            </div>

            <div className="flex items-center gap-3 mb-3 mr-10">
              <Button
                onClick={fetchData}
                className="h-11 px-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-emerald-600 hover:text-white cursor-pointer"
              >
                <RefreshCwIcon size={16} />
                새로고침
              </Button>

              <Badge className="rounded-full bg-green-600 text-white px-3 py-2 text-[11px] font-semibold hover:bg-green-600">
                배포됨
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50/80 rounded-b-2xl">
        <div className="p-6 space-y-6 min-w-[1000px]">
          <div className="flex gap-6 items-start">
            {/* 시나리오 정보 */}
            <Card className="p-6 w-[380px] h-[420px] shrink-0">
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <p className="text-sm text-slate-500 mb-2">시뮬레이션 ID</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-sky-600">
                      {scenario.id}
                    </p>
                    <Badge className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-[11px] leading-none font-semibold">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                      Published
                    </Badge>
                  </div>
                </div>

                <div className="border-b pb-6">
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <CalendarIcon className="w-3 h-3" />
                    시작 시간
                  </p>
                  <p className="font-semibold ml-3">
                    {formatDateTime(scenario.startAt)}
                  </p>
                </div>

                <div className="border-b pb-6">
                  <p className="text-sm flex items-center gap-1 mb-2">
                    <ClockIcon className="w-3 h-3" />총 소요시간
                  </p>
                  <p className="text-lg font-bold ml-3">
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
                    <span className="text-lg font-normal text-slate-600">
                      / {totalTasks}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* 제품 목록 */}
            <Card className="p-6 flex-1 min-w-0 h-[420px] flex flex-col">
              <h2 className="flex items-center justify-between text-lg font-bold text-slate-900 mb-1">
                <span className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-slate-600" />
                  제품 목록
                </span>
                <span className="text-base font-medium text-slate-400 mr-2">
                  제품 ID
                </span>
              </h2>

              <div className="space-y-3">
                {pageProducts.map((p, idx) => {
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

        {/* 간트 차트 — popover 차단 */}
        <SimulationContext.Provider
          value={{ published: true, showProductName: true }}
        >
          <Card className="overflow-hidden">
            <SimulationGanttForWorker
              products={products}
              scenarioStart={scenario.startAt}
              workers={[]}
              token={token}
            />
          </Card>
        </SimulationContext.Provider>
      </div>
    </div>
  );
}
