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

export default function ScenarioRightPannel({
  selectedScenario,
  editScenario,
  progress,
  running,
  pending,
  onStart,
  onEdit,
  onCancelEdit,
  onRefreshDetail,
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
      setAnimatedProgress(0); // 데이터 없으면 0으로 초기화
      return;
    }
    let startTimestamp = null;
    const duration = 700;
    const startProgress = animatedProgress;
    const targetProgress = displayProgress;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progressRatio = Math.min(
        (timestamp - startTimestamp) / duration,
        1,
      );

      setAnimatedProgress(
        Math.floor(
          progressRatio * (targetProgress - startProgress) + startProgress,
        ),
      );

      if (progressRatio < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animationId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationId);
  }, [displayProgress, selectedScenario?.id]); // 시나리오 ID가 바뀔 때마다 초기화

  // 3. 훅 선언이 다 끝난 후에 "시나리오 선택 안됨" 화면을 보여줍니다.
  if (!selectedScenario) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-white rounded-[32px] border border-dashed border-slate-200">
        시나리오를 선택해주세요.
      </div>
    );
  }

  // 수정 모드 체크
  if (editScenario) {
    return (
      <Edit
        scenario={editScenario}
        onCancel={onCancelEdit}
        onRefreshDetail={onRefreshDetail}
      />
    );
  }

  function onTogglePublish() {
    const isPublishing = !selectedScenario.published;
    const action = isPublishing ? publishScenario : unpublishScenario;

    action(token, selectedScenario.id).then(() => {
      // ⭐ 새로고침 대신 부모에게 "이 아이디 데이터 좀 다시 가져와줘"라고 요청
      onRefreshDetail(selectedScenario.id);
      window.alert(isPublishing ? "배포되었습니다." : "회수되었습니다.");
    });
  }

  return (
    <section className="w-full h-full flex flex-col overflow-hidden bg-slate-50/40">
      <div className="border-none rounded-[32px] h-full flex flex-col shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 bg-white overflow-hidden">
        {/* 1. 고정 헤더 & 정보 카드 (절대 밀려나지 않음) */}
        <div className="p-6 pb-4 shrink-0 bg-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Scenario ID
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{selectedScenario.id}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {selectedScenario.title}
              </h1>
            </div>
            <button
              onClick={() => onEdit?.(selectedScenario)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-xs font-bold hover:bg-yellow-600 transition-all shadow-md"
            >
              수정
            </button>
          </div>

          {/* 정보 카드 그리드 (배포 상태 포함 5개 카드) */}
          <div className="grid grid-cols-2 gap-2">
            <InfoCard
              icon={<Activity size={14} />}
              label="Status"
              value={selectedScenario.status}
              color="text-blue-600"
            />
            <InfoCard
              icon={<Calendar size={14} />}
              label="Start Schedule"
              value={selectedScenario.startAt?.slice(0, 16).replace("T", " ")}
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
              value={`${selectedScenario.maxWorkerCount}명`}
            />

            {/* 배포 상태 카드 (가로 전체 차지) */}
            <div className="col-span-2">
              <InfoCard
                icon={
                  <Globe
                    size={16}
                    className={
                      selectedScenario.published
                        ? "text-emerald-500"
                        : "text-slate-400"
                    }
                  />
                }
                label="Publish Status"
                value={
                  <div className="flex items-center justify-between w-full mt-0.5">
                    {/* 상태 표시 (점 + 텍스트) */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          selectedScenario.published
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-rose-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-black ${
                          selectedScenario.published
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {selectedScenario.published ? "배포됨" : "미배포"}
                      </span>
                    </div>

                    {/* 상태 변경 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublish();
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                    >
                      상태 변경
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* 2. 생산 품목 영역 (남는 공간만 차지하고 내부 스크롤) */}
        <div className="flex-1 min-h-0 px-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <Package size={16} className="text-slate-400" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
              생산 품목
            </span>
          </div>

          {/* ⭐ 여기가 핵심입니다. flex-1 min-h-0이 없으면 뚫고 나갑니다. */}
          <div className="flex-1 min-h-0 border border-slate-100 rounded-2xl bg-slate-50/30 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="p-3 space-y-1.5 pr-4">
                {selectedScenario.products?.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-white border border-slate-100 px-6 py-1 rounded-xl shadow-sm"
                  >
                    <span className="flex-1 text-sm font-bold text-slate-700 truncate">
                      {p.product?.name}
                    </span>
                    <div className="flex items-center gap-2 border-l pl-4 border-slate-100 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400">
                        QTY
                      </span>
                      <span className="font-mono font-black text-blue-600 text-sm">
                        {p.qty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* 3. 고정 하단 영역 (절대 가려지지 않음) */}
        <div className="px-7 pb-3 border-t border-slate-100 shrink-0 bg-white">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Simulation Progress
            </span>
            <span className="text-sm font-black text-blue-600 font-mono">
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
            className="w-full py-4 rounded-2xl text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.95]"
          >
            <Play size={18} fill="currentColor" /> 시뮬레이션 시작
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value, color = "text-slate-800" }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[22px] p-3 px-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
    </div>
  );
}
