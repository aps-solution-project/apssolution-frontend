import { publishScenario, unpublishScenario } from "@/api/scenario-api";
import { useToken } from "@/stores/account-store";
import { useEffect, useState } from "react";
import Edit from "@/components/scenario/Edit";
import {
  Activity,
  Calendar,
  Users,
  Package,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  FileText,
  Send,
  Globe,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    return <Edit scenario={editScenario} onCancel={onCancelEdit} />;
  }

  function onTogglePublish() {
    if (selectedScenario.published) {
      unpublishScenario(token, selectedScenario.id).then(() => {
        window.alert("시나리오가 회수되었습니다.");
        window.location.reload();
      });
    } else {
      publishScenario(token, selectedScenario.id).then(() => {
        window.alert("시나리오가 배포되었습니다.");
        window.location.reload();
      });
    }
  }

  return (
    <section className="w-full h-full flex flex-col overflow-hidden">
      <div className="bg-white border-none rounded-[32px] h-full flex flex-col shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100 overflow-hidden">
        {/* 1. 고정 헤더 영역 (shrink-0) */}
        <div className="p-6 pb-4 shrink-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="p-3 py-1 rounded-[32px] bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">
                  Scenario ID
                </span>
                <span className="text-xs font-mono text-slate-400">
                  #{selectedScenario.id}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {selectedScenario.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium line-clamp-1">
                {selectedScenario.description || "등록된 설명이 없습니다."}
              </p>
            </div>

            <button
              onClick={() => onEdit?.(selectedScenario)}
              disabled={!isReady || selectedScenario.published}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isReady && !selectedScenario.published
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              수정
            </button>
          </div>
        </div>

        {/* 2. 스크롤 가능한 본문 영역 (flex-1 + ScrollArea) */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full w-full">
            <div className="px-4 pb-5 space-y-2">
              {/* 정보 카드 그리드 */}
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
                  value={`${selectedScenario.startAt?.slice(0, 10)} ${selectedScenario.startAt?.slice(11, 16)}`}
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
                    <div className="flex items-center justify-between w-full group/btn">
                      {/* 왼쪽: 상태 표시 */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${selectedScenario.published ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                        />
                        <span
                          className={`font-bold ${selectedScenario.published ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {selectedScenario.published ? "배포됨" : "미배포"}
                        </span>
                      </div>

                      {/* 오른쪽: 액션 버튼 (카드 안으로 쏙 들어감) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // 카드 클릭 이벤트와 겹치지 않게 방지
                          onTogglePublish();
                        }}
                        className="ml-4 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                      >
                        상태 변경
                      </button>
                    </div>
                  }
                />
              </div>

              {/* 생산 품목 리스트 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    생산 품목
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {selectedScenario.products?.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center bg-white border border-slate-50 px-6 py-1 rounded-xl shadow-sm"
                    >
                      <span className="w-70 text-center text-sm font-bold text-slate-700 truncate">
                        {p.product?.name}
                      </span>
                      <div className="flex items-center gap-2 border-l pl-4 border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Qty
                        </span>
                        <span className="font-mono font-black text-blue-600 text-sm">
                          {p.qty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 3. 고정 하단 영역 (shrink-0: 항상 바닥에 붙어 있음) */}
        <div className="p-8 pt-4 border-t border-slate-100 shrink-0 bg-white">
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
              className="h-full bg-blue-600 transition-all duration-700 shadow-[0_0_8px_rgba(37,99,235,0.3)]"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          <button
            onClick={onStart}
            disabled={running && isPending}
            className={`w-full py-3 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-[0.98] 
    flex items-center justify-center gap-2
    ${
      isOptimal || isFeasible
        ? "bg-indigo-600 text-white hover:bg-indigo-700"
        : isPending
          ? "bg-emerald-500 text-white cursor-wait"
          : running
            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
    }`}
          >
            {isOptimal || isFeasible ? (
              <>
                <FileText size={18} />
                결과 레포트 보기
              </>
            ) : isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />{" "}
                {/* 스피너 애니메이션 */}
                분석 진행 중...
              </>
            ) : running ? (
              <>
                <Send size={18} className="animate-pulse" />{" "}
                {/* 전송 중일 때 깜빡임 효과 */}
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
      </div>
    </section>
  );
}

/* 내부 카드 컴포넌트 */
function InfoCard({ icon, label, value, color = "text-slate-800" }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[22px] p-3 px-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
      </div>
      <div className={`text-sm font-bold truncate ${color}`}>
        {value || "-"}
      </div>
    </div>
  );
}
