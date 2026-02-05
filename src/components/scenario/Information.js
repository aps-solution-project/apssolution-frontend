import { publishScenario, unpublishScenario } from "@/api/scenario-api";
import { useToken } from "@/stores/account-store";
import Edit from "@/components/scenario/Edit";
import {
  Activity,
  Calendar,
  Users,
  Package,
  CheckCircle2,
  Clock,
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

  if (!selectedScenario) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 font-medium bg-white rounded-[32px] border border-dashed border-slate-200">
        시나리오를 선택해주세요.
      </div>
    );
  }

  if (editScenario) {
    return <Edit scenario={editScenario} onCancel={onCancelEdit} />;
  }

  const isReady = selectedScenario.status === "READY";
  const isOptimal = selectedScenario.status === "OPTIMAL";
  const displayProgress = isReady ? progress : 100;
  const ispending = isReady ? pending : true;

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
        <div className="p-5 pb-2 shrink-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-0.5 rounded-[32px] bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">
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
            <div className="px-4 pb-4 space-y-2">
              {/* 정보 카드 그리드 */}
              <div className="grid grid-cols-2 gap-1">
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
              </div>

              {/* 배포 섹션 */}
              <div className="bg-slate-50 rounded-2xl p-2 px-10 flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedScenario.published ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                  />
                  <div className="text-xs font-bold text-slate-700">
                    {selectedScenario.published
                      ? "현장에 배포됨"
                      : "미배포 상태"}
                  </div>
                </div>
                <button
                  onClick={onTogglePublish}
                  className="px-4 py-2 rounded-lg font-bold text-[11px] bg-white border border-slate-200"
                >
                  상태 변경
                </button>
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
                      className="flex justify-around items-center bg-white border border-slate-50 px-7 py-1 rounded-xl shadow-sm"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {p.product?.name}
                      </span>
                      <span className="font-mono font-bold text-blue-600 text-[11px]">
                        QTY: {p.qty}
                      </span>
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
              {displayProgress}%
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
            disabled={running && isReady}
            className={`w-full py-3 rounded-2xl text-sm font-black transition-all shadow-lg active:scale-[0.98] ${
              isOptimal
                ? "bg-indigo-600 text-white"
                : running
                  ? "bg-slate-100 text-slate-400"
                  : ispending
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-600 text-white"
            }`}
          >
            {isOptimal
              ? "결과 레포트 보기"
              : ispending
                ? "분석 진행 중..."
                : running
                  ? "전송 중..."
                  : "시뮬레이션 시작"}
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
