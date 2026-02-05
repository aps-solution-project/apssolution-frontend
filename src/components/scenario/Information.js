import { publishScenario, unpublishScenario } from "@/api/scenario-api";
import Edit from "@/components/scenario/Edit";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToken } from "@/stores/account-store";
import {
  Activity,
  Calendar,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  Package,
  Play,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function Information({
  selectedScenario,
  editScenario,
  progress,
  running,
  pending,
  onStart,
  onEdit,
  onCancelEdit,
}) {
  const { token } = useToken();

  const [animatedProgress, setAnimatedProgress] = useState(0);

  const isReady = selectedScenario?.status === "READY";
  const isOptimal = selectedScenario?.status === "OPTIMAL";
  const isFeasible = selectedScenario?.status === "FEASIBLE";
  const isPending = isReady ? pending : true;
  const displayProgress = isReady ? progress : 100;

  useEffect(() => {
    if (!selectedScenario) {
      setAnimatedProgress(0);
      return;
    }

    let startTimestamp = null;
    const duration = 700;
    const startProgress = animatedProgress;
    const targetProgress = displayProgress;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const ratio = Math.min((timestamp - startTimestamp) / duration, 1);

      setAnimatedProgress(
        Math.floor(ratio * (targetProgress - startProgress) + startProgress),
      );

      if (ratio < 1) window.requestAnimationFrame(step);
    };

    const id = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayProgress, selectedScenario?.id]);

  if (!selectedScenario) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
        시나리오를 선택해주세요.
      </div>
    );
  }

  if (editScenario) {
    return <Edit scenario={editScenario} onCancel={onCancelEdit} />;
  }

  function onTogglePublish() {
    const api = selectedScenario.published
      ? unpublishScenario
      : publishScenario;

    api(token, selectedScenario.id).then(() => {
      window.alert(
        selectedScenario.published
          ? "시나리오가 회수되었습니다."
          : "시나리오가 배포되었습니다.",
      );
      window.location.reload();
    });
  }

  return (
    <section className="w-full h-full min-h-0 flex flex-col overflow-hidden bg-transparent">
      {/* 상단 고정 */}
      <div className="shrink-0 px-8 py-3 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Scenario ID
              </span>
              <span className="text-xs font-mono text-slate-400">
                #{selectedScenario.id}
              </span>
            </div>

            <h1 className="text-[22px] leading-tight font-bold text-slate-900 tracking-tight truncate">
              {selectedScenario.title}
            </h1>
            <p className="text-[12px] text-slate-500 mt-1 font-normal line-clamp-1">
              {selectedScenario.description || "등록된 설명이 없습니다."}
            </p>
          </div>

          <button
            onClick={() => onEdit?.(selectedScenario)}
            disabled={!isReady || selectedScenario.published}
            className={[
              "shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition",
              isReady && !selectedScenario.published
                ? "bg-yellow-500 text-white hover:bg-yellow-600"
                : "bg-slate-100 text-slate-400 cursor-not-allowed",
            ].join(" ")}
          >
            수정
          </button>
        </div>
      </div>

      {/* 가운데 스크롤 */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="px-8 py-6 space-y-6">
            {/* 정보 카드 */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={<Activity size={14} />}
                label="Status"
                value={selectedScenario.status}
                valueClass="text-blue-700"
              />
              <InfoCard
                icon={<Calendar size={14} />}
                label="Start Schedule"
                value={`${selectedScenario.startAt?.slice(0, 10) || "-"} ${
                  selectedScenario.startAt?.slice(11, 16) || ""
                }`}
              />
              <InfoCard
                icon={<CheckCircle2 size={14} />}
                label="Makespan"
                value={
                  selectedScenario.makespan
                    ? `${selectedScenario.makespan}분`
                    : "-"
                }
              />
              <InfoCard
                icon={<Users size={14} />}
                label="Workforce"
                value={`${selectedScenario.maxWorkerCount ?? "-"}명`}
              />
              <InfoCard
                icon={
                  <Globe
                    size={14}
                    className={
                      selectedScenario.published
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }
                  />
                }
                label="Publish Status"
                value={
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className={[
                          "w-2 h-2 rounded-full",
                          selectedScenario.published
                            ? "bg-emerald-500"
                            : "bg-rose-500",
                        ].join(" ")}
                      />
                      <span
                        className={[
                          "font-semibold",
                          selectedScenario.published
                            ? "text-emerald-700"
                            : "text-rose-700",
                        ].join(" ")}
                      >
                        {selectedScenario.published ? "배포됨" : "미배포"}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublish();
                      }}
                      className="ml-4 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition"
                      type="button"
                    >
                      상태 변경
                    </button>
                  </div>
                }
              />
            </div>

            {/* 생산 품목 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  생산 품목
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {selectedScenario.products?.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white border border-slate-200/80 px-5 py-3 rounded-2xl"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {p.product?.name || "-"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        Qty
                      </span>
                      <span className="font-mono font-semibold text-blue-700 text-sm">
                        {p.qty ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-2" />
          </div>
        </ScrollArea>
      </div>

      {/* 하단 고정 */}
      <div className="shrink-0 px-8 py-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
            Simulation Progress
          </span>
          <span className="text-sm font-semibold text-blue-700 font-mono">
            {animatedProgress}%
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-blue-600 transition-all duration-700"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <button
          onClick={onStart}
          disabled={running && isPending}
          className={[
            "w-full py-3 rounded-2xl text-sm font-semibold transition shadow-sm active:scale-[0.98]",
            "flex items-center justify-center gap-2",
            isOptimal || isFeasible
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : isPending
                ? "bg-emerald-500 text-white cursor-wait"
                : running
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700",
          ].join(" ")}
          type="button"
        >
          {isOptimal || isFeasible ? (
            <>
              <FileText size={18} />
              결과 레포트 보기
            </>
          ) : isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              분석 진행 중...
            </>
          ) : running ? (
            <>
              <Send size={18} className="animate-pulse" />
              전송 중...
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              {selectedScenario.status === "FAIL"
                ? "재시뮬레이션 시작"
                : "시뮬레이션 시작"}
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value, valueClass = "text-slate-900" }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className={`mt-1 text-[14px] font-semibold truncate ${valueClass}`}>
        {value || "-"}
      </div>
    </div>
  );
}
