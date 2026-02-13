import { AIReportFloatingButton } from "@/components/scenario/AIReport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  Loader2,
  Package,
  PlayCircle,
  RefreshCwIcon,
  ScrollText,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getActiveAccounts } from "@/api/auth-api";
import { getScenarioResult } from "@/api/scenario-api";
import SimulationGantt from "@/components/gantt/SimulationGantt";
import SimulationGanttForWorker from "@/components/gantt/SimulationGanttForWorker";
import { SimulationContext } from "@/components/gantt/GanttBar";
import { publishScenario, unpublishScenario } from "@/api/scenario-api";
import { useAccount, useToken } from "@/stores/account-store";

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
  const [publishing, setPublishing] = useState(false);
  const [workers, setWorkers] = useState([]);
  const router = useRouter();
  const loginAccount = useAccount((state) => state.account);
  const params = useParams();
  const searchParams = useSearchParams();
  const { token } = useToken();

  const scenarioId = params.scenarioId;

  const [viewMode, setViewMode] = useState(
    searchParams.get("view") || "product",
  );

  // ── 제품 클릭 → 간트 이동 ──
  const ganttRef = useRef(null);
  const ganttWorkerRef = useRef(null);
  const ganttSectionRef = useRef(null);

  const handleProductClick = useCallback(
    (productName) => {
      ganttSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setTimeout(() => {
        const activeRef = viewMode === "product" ? ganttRef : ganttWorkerRef;
        activeRef.current?.scrollToProduct(productName);
      }, 400);
    },
    [viewMode],
  );

  const scenario = data?.scenario || {};
  const products = data?.scenarioProductList || [];

  const totalTasks = products.reduce(
    (sum, p) => sum + (p.scenarioSchedules?.length || 0),
    0,
  );

  const handlePublish = async () => {
    if (!token || !scenarioId) return;
    setPublishing(true);
    try {
      await publishScenario(token, scenarioId);
      fetchData();
    } catch (err) {
      alert(err.message || "배포에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!token || !scenarioId) return;
    setPublishing(true);
    try {
      await unpublishScenario(token, scenarioId);
      fetchData();
    } catch (err) {
      alert(err.message || "배포 해제에 실패했습니다.");
    } finally {
      setPublishing(false);
    }
  };

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
  const PAGE_SIZE = 4;
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
    router.replace(`/scenarios/${scenarioId}?${params.toString()}`, {
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
    if (!token || loginAccount?.role === "WORKER") return;
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
  }, [token, loginAccount?.role]);

  if (loginAccount?.role === "WORKER") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="p-4 bg-red-50 rounded-full">
          <X className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">접근 권한 제한</h2>
        <p className="text-slate-500 font-medium text-center">
          시뮬레이션 페이지는 관리자(ADMIN) 및 플래너 전용 구역입니다.
          <br />
          권한이 필요하시다면 관리자에게 문의하세요.
        </p>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          className="rounded-xl"
        >
          메인으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!data.scenario) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shrink-0 rounded-t-[32px]">
        <div className="mb-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-3">
                <PlayCircle size={20} />
                <span className="text-sm font-black uppercase tracking-widest">
                  Simulation
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                {scenario.title || "시뮬레이션"}
              </h1>

              <p className="text-sm text-slate-400 font-medium ">
                {scenario.description || "생산 일정 시뮬레이션"} (총{" "}
                <span className="text-slate-600 font-bold">{totalTasks}</span>
                개)
              </p>
            </div>

            <div className="flex items-center gap-3 mb-3 mr-10">
              <Badge
                className={
                  scenario.published
                    ? "rounded-full bg-green-600 text-white px-3 py-1 text-[13px] font-semibold hover:bg-green-600"
                    : "rounded-full bg-slate-200 text-slate-600 px-3 py-1 text-[13px] font-semibold hover:bg-slate-200"
                }
              >
                {scenario.published ? "배포됨" : "미배포"}
              </Badge>
              <Button
                onClick={fetchData}
                className="h-11 px-8 rounded-md bg-slate-50 border border-slate-200 text-slate-600 font-bold hover:bg-emerald-600 hover:text-white cursor-pointer "
              >
                <RefreshCwIcon size={16} />
                새로고침
              </Button>

              {scenario.published ? (
                <Button
                  onClick={handleUnpublish}
                  disabled={publishing}
                  className="h-11 px-5 rounded-md bg-red-50 border border-red-200 text-red-600 font-bold hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      해제 중...
                    </>
                  ) : (
                    "배포 해제"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="h-11 px-5 rounded-md bg-indigo-600 text-white font-bold hover:bg-indigo-400 cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      배포 중...
                    </>
                  ) : (
                    "배포하기"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-50/80 rounded-b-2xl">
        <div className="p-6 space-y-6 min-w-[1000px]">
          <div className="flex gap-6 items-start">
            <Card className="p-6 w-[380px] h-[420px] shrink-0">
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <p className="text-sm text-slate-500 mb-2">시뮬레이션 ID</p>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-sky-600 ">
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
              <h2 className="flex items-center justify-between text-lg font-bold text-slate-900 mb-1">
                <span className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-slate-600" />
                  제품 목록
                  {/* 페이지네이션 */}
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (num) => (
                        <Button
                          key={num}
                          size="sm"
                          variant={num === page ? "default" : "outline"}
                          onClick={() => setPage(num)}
                          className={[
                            "h-7 w-7 p-0 text-xs font-medium",
                            num === page
                              ? "bg-indigo-600 text-white hover:bg-indigo-500"
                              : "text-slate-600 hover:bg-slate-100",
                          ].join(" ")}
                        >
                          {num}
                        </Button>
                      ),
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </span>

                <span className="text-base font-medium text-slate-400 mr-2">
                  제품 ID
                </span>
              </h2>

              {/* ── 제품 리스트 (pageProducts 사용) ── */}
              <div className="space-y-3 flex-1 min-h-0">
                {pageProducts.map((p, idx) => {
                  // 전체 products 배열에서의 실제 인덱스를 계산하여 색상 유지
                  const globalIdx = (page - 1) * PAGE_SIZE + idx;
                  const scheduleCount = p.scenarioSchedules?.length || 0;
                  const colorClass =
                    PRODUCT_COLORS[globalIdx % PRODUCT_COLORS.length];
                  const initial = (p.name || p.id || "?").charAt(0);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.name || p.id)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer"
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
            </Card>
          </div>
        </div>

        {/* 간트 차트 */}
        <div ref={ganttSectionRef}>
          <SimulationContext.Provider
            value={{ published: !!scenario.published }}
          >
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
                  ref={ganttRef}
                  products={products}
                  scenarioStart={scenario.startAt}
                  workers={workers}
                  token={token}
                />
              ) : (
                <SimulationGanttForWorker
                  ref={ganttWorkerRef}
                  products={products}
                  scenarioStart={scenario.startAt}
                  workers={workers}
                  token={token}
                />
              )}
            </Card>
          </SimulationContext.Provider>
        </div>
      </div>

      {/* ai 레포트 */}
      <AIReportFloatingButton
        scenarioId={scenarioId}
        products={products}
        feedback={data.scenario.aiScheduleFeedback}
      />
    </div>
  );
}
