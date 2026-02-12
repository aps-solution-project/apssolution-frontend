import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowDownRight,
  CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClockIcon,
  Hourglass,
  Package,
  PlayCircle,
  RefreshCwIcon,
  ScrollText,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

// ── 시간 포맷 헬퍼 ──
function fmtHM(totalSec) {
  const abs = Math.abs(Math.floor(totalSec));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function fmtTime(dateStr) {
  if (!dateStr) return "--:--";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtFullTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── 타이머 훅 (1초마다 갱신) ──
function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function DeploymentPage() {
  const { token } = useToken();
  const { account } = useAccount();

  const [scenario, setScenario] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // ── 제품 클릭 → 간트 이동 ──
  const ganttRef = useRef(null);
  const ganttSectionRef = useRef(null);

  const handleProductClick = useCallback((productName) => {
    // 1) 간트 영역으로 스크롤
    ganttSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // 2) 스크롤 후 간트 내부 이동 (스크롤 애니메이션 끝나고)
    setTimeout(() => {
      ganttRef.current?.scrollToProduct(productName);
    }, 400);
  }, []);

  const now = useNow();

  const totalTasks = products.reduce(
    (sum, p) => sum + (p.scenarioSchedules?.length || 0),
    0,
  );

  const PAGE_SIZE = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // ── 전체 스케줄 플랫 리스트 ──
  const allSchedules = useMemo(() => {
    const list = [];
    for (const p of products) {
      for (const s of p.scenarioSchedules || []) {
        list.push({
          ...s,
          productName: s.productName || p.name,
          taskName: s.originalTaskName || s.scheduleTask?.name || "작업",
        });
      }
    }
    return list.sort(
      (a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0),
    );
  }, [products]);

  // ── 상태별 분류 ──
  const { completed, inProgress, upcoming } = useMemo(() => {
    const completed = [];
    const inProgress = [];
    const upcoming = [];

    for (const s of allSchedules) {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);

      if (end <= now) {
        completed.push(s);
      } else if (start <= now && end > now) {
        inProgress.push(s);
      } else {
        upcoming.push(s);
      }
    }

    return { completed, inProgress, upcoming };
  }, [allSchedules, now]);

  const progressPct =
    totalTasks > 0 ? Math.round((completed.length / totalTasks) * 100) : 0;

  const lastEndTime = useMemo(() => {
    let max = 0;
    for (const s of allSchedules) {
      const t = new Date(s.endAt).getTime();
      if (t > max) max = t;
    }
    return max ? new Date(max) : null;
  }, [allSchedules]);

  const remainingSec = lastEndTime
    ? Math.max(0, (lastEndTime - now) / 1000)
    : 0;

  // 데이터 조회 (silent: true면 로딩 스피너 표시 안 함)
  const fetchData = (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    getTodaySchedules(token)
      .then((res) => {
        if (res?.scenario?.published) {
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
          setLastRefreshedAt(new Date());
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

  // ── 주기적 폴링 (30초) + 탭 복귀 시 재조회 ──
  useEffect(() => {
    if (!token) return;

    // 30초마다 폴링 (silent — 스피너 표시 안 함)
    const intervalId = setInterval(() => fetchData(true), 30_000);

    // 탭 복귀 시 즉시 재조회 (silent)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchData(true);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
              {/* 마지막 갱신 시각 */}
              {lastRefreshedAt && (
                <span className="text-[11px] text-slate-400">
                  마지막 갱신 {fmtFullTime(lastRefreshedAt)}
                </span>
              )}

              <Button
                onClick={() => fetchData(false)}
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
          {/* ━━━ 오늘 하루 요약 대시보드 ━━━ */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-emerald-700" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                오늘의 작업 현황
              </h2>
              <span className="text-xs text-slate-400 ml-auto">
                {now.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                기준
              </span>
            </div>

            <div className="flex items-center gap-6">
              {/* 진행률 원형 */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative h-20 w-20">
                  <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPct * 0.975} 100`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500">진행률</span>
              </div>

              {/* 상태별 카운트 */}
              <div className="flex gap-4 flex-1">
                <StatusCard
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="완료"
                  count={completed.length}
                  total={totalTasks}
                  color="emerald"
                />
                <StatusCard
                  icon={<CircleDot className="h-4 w-4" />}
                  label="진행 중"
                  count={inProgress.length}
                  total={totalTasks}
                  color="blue"
                />
                <StatusCard
                  icon={<Hourglass className="h-4 w-4" />}
                  label="대기"
                  count={upcoming.length}
                  total={totalTasks}
                  color="slate"
                />
              </div>

              {/* 프로그레스 바 + 남은 시간 */}
              <div className="w-[280px] shrink-0 space-y-2">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    {completed.length} / {totalTasks} 완료
                  </span>
                  <span>
                    {remainingSec > 0
                      ? `남은 시간 약 ${fmtHM(remainingSec)}`
                      : "모든 작업 완료"}
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {lastEndTime && (
                  <p className="text-[11px] text-slate-400 text-right">
                    예상 완료 {fmtTime(lastEndTime)}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* ━━━ 현재 / 다음 작업 타이머 ━━━ */}
          <div className="flex gap-4">
            {inProgress.length > 0 ? (
              inProgress.map((s) => (
                <TimerCard
                  key={s.id}
                  schedule={s}
                  now={now}
                  type="active"
                  onClick={() => handleProductClick(s.productName)}
                />
              ))
            ) : (
              <Card className="flex-1 p-4 border-dashed border-slate-200 bg-white/60">
                <div className="flex items-center gap-3 text-slate-400">
                  <CircleDot className="h-5 w-5" />
                  <span className="text-sm">
                    현재 진행 중인 작업이 없습니다
                  </span>
                </div>
              </Card>
            )}

            {upcoming.slice(0, 2).map((s) => (
              <TimerCard
                key={s.id}
                schedule={s}
                now={now}
                type="upcoming"
                onClick={() => handleProductClick(s.productName)}
              />
            ))}
          </div>

          {/* ━━━ 시나리오 정보 + 제품 목록 ━━━ */}
          <div className="flex gap-6 items-start">
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

              <div className="space-y-3 flex-1 min-h-0">
                {pageProducts.map((p, idx) => {
                  const globalIdx = (page - 1) * PAGE_SIZE + idx;
                  const scheduleCount = p.scenarioSchedules?.length || 0;
                  const colorClass =
                    PRODUCT_COLORS[globalIdx % PRODUCT_COLORS.length];
                  const initial = (p.name || p.id || "?").charAt(0);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.name || p.id)}
                      className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer group"
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
                      <div className="text-right shrink-0 pl-3 flex items-center gap-2">
                        <span className="text-sm text-slate-400 font-mono">
                          {p.id}
                        </span>
                        <ArrowDownRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            value={{ published: true, showProductName: true }}
          >
            <Card className="overflow-hidden">
              <SimulationGanttForWorker
                ref={ganttRef}
                products={products}
                scenarioStart={scenario.startAt}
                workers={[]}
                token={token}
              />
            </Card>
          </SimulationContext.Provider>
        </div>
      </div>
    </div>
  );
}

// ── 상태 카드 (완료 / 진행 / 대기) ──
function StatusCard({ icon, label, count, total, color }) {
  const styles = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: "text-emerald-600",
      count: "text-emerald-700",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: "text-blue-600",
      count: "text-blue-700",
    },
    slate: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: "text-slate-500",
      count: "text-slate-700",
    },
  };
  const s = styles[color] || styles.slate;

  return (
    <div className={`flex-1 rounded-xl border ${s.border} ${s.bg} p-4`}>
      <div className={`flex items-center gap-2 mb-2 ${s.icon}`}>
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${s.count}`}>{count}</span>
        <span className="text-xs text-slate-400">/ {total}</span>
      </div>
    </div>
  );
}

// ── 타이머 카드 (진행 중 / 다음 작업) ──
function TimerCard({ schedule, now, type, onClick }) {
  const start = new Date(schedule.startAt);
  const end = new Date(schedule.endAt);
  const isActive = type === "active";

  const remainSec = isActive
    ? Math.max(0, (end - now) / 1000)
    : Math.max(0, (start - now) / 1000);

  const totalDuration = (end - start) / 1000;
  const elapsed = isActive ? Math.max(0, (now - start) / 1000) : 0;
  const pct =
    isActive && totalDuration > 0
      ? Math.min(100, Math.round((elapsed / totalDuration) * 100))
      : 0;

  const isUrgent = isActive && remainSec <= 180 && remainSec > 0;

  return (
    <Card
      onClick={onClick}
      className={[
        "flex-1 p-4 transition-all cursor-pointer",
        isActive
          ? isUrgent
            ? "border-red-300 bg-red-50/50 shadow-sm shadow-red-100"
            : "border-blue-200 bg-blue-50/40 shadow-sm shadow-blue-100"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isActive ? (
              <Badge
                className={[
                  "rounded-full text-[10px] font-semibold px-2 py-0.5",
                  isUrgent
                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-100",
                ].join(" ")}
              >
                {isUrgent ? "곧 종료" : "진행 중"}
              </Badge>
            ) : (
              <Badge className="rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 hover:bg-slate-100">
                다음 작업
              </Badge>
            )}
            <span className="text-[11px] text-slate-400">
              {schedule.productName}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 truncate">
            {schedule.taskName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {fmtTime(schedule.startAt)} ~ {fmtTime(schedule.endAt)}
          </p>
        </div>

        <div className="text-right shrink-0 ml-3">
          <div
            className={[
              "text-xl font-bold tabular-nums tracking-tight",
              isActive
                ? isUrgent
                  ? "text-red-600"
                  : "text-blue-700"
                : "text-slate-700",
            ].join(" ")}
          >
            {fmtHM(remainSec)}
          </div>
          <div className="text-[10px] text-slate-400">
            {isActive ? "남은 시간" : "시작까지"}
          </div>
        </div>
      </div>

      {isActive && (
        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={[
              "h-full rounded-full transition-all duration-1000",
              isUrgent
                ? "bg-gradient-to-r from-red-400 to-red-500"
                : "bg-gradient-to-r from-blue-400 to-blue-500",
            ].join(" ")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </Card>
  );
}
