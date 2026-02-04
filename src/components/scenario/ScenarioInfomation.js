import { publishScenario, unpublishScenario } from "@/api/scenario-api";
import { useToken } from "@/stores/account-store";
import EditScenarioForm from "./EditScenarioForm";

export default function ScenariosInformation({
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
  if (!selectedScenario) return null;

  if (editScenario) {
    return <EditScenarioForm scenario={editScenario} onCancel={onCancelEdit} />;
  }

  const isReady = selectedScenario.status === "READY";
  const isOptimal = selectedScenario.status === "OPTIMAL";

  const displayProgress = isReady ? progress : 100;
  const ispending = isReady ? pending : true;

  function onTogglePublish() {
    if (selectedScenario.published) {
      unpublishScenario(token, selectedScenario.id).then((obj) => {
        window.alert("시나리오가 회수되었습니다.");
        window.location.reload();
      });
    } else {
      publishScenario(token, selectedScenario.id).then((obj) => {
        window.alert("시나리오가 배포되었습니다.");
        window.location.reload();
      });
    }
  }

  return (
    <section className="w-1/2 p-6 bg-gray-100">
      <div className="bg-white border p-6 h-full flex flex-col shadow-sm rounded-xl">
        {/* 🔹 상단 헤더 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-xs text-gray-400">Scenario ID</div>
            <div className="text-sm font-medium">{selectedScenario.id}</div>
          </div>

          {/* 🔥 수정 버튼 */}
          <button
            onClick={() => onEdit?.(selectedScenario)}
            disabled={!isReady || selectedScenario.published}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors
              ${
                isReady
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            수정
          </button>
        </div>

        {/* 🔹 제목 & 설명 */}
        <div className="mb-4">
          <div className="text-xl font-semibold text-blue-700">
            {selectedScenario.title}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {selectedScenario.description}
          </div>
        </div>

        {/* 🔹 정보 카드 영역 */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <Info label="상태" value={selectedScenario.status} />
          <Info label="시작 시간" value={selectedScenario.startAt} />
          <Info label="Makespan" value={selectedScenario.makespan ?? "-"} />
          <Info label="작업 인원" value={selectedScenario.maxWorkerCount} />
          <div className="bg-gray-50 border rounded-lg px-3 py-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">게시 상태</div>

              {selectedScenario.published ? (
                <span className="text-emerald-600 text-xs font-medium">
                  ● Published
                </span>
              ) : (
                <span className="text-rose-500 text-xs font-medium">
                  ● Unpublished
                </span>
              )}
            </div>

            <button
              onClick={() => onTogglePublish?.(selectedScenario)}
              className={`text-xs px-3 py-1 rounded-md border transition-colors
                ${
                  selectedScenario.published
                    ? "border-rose-300 text-rose-600 hover:bg-rose-50"
                    : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                }
            `}
            >
              {selectedScenario.published ? "회수" : "배포"}
            </button>
          </div>
        </div>

        {/* 🔹 생산 품목 */}
        <div className="mb-6">
          <div className="text-sm font-medium mb-2 text-gray-700">
            생산 품목
          </div>
          <div className="space-y-1">
            {selectedScenario.products?.map((p, i) => (
              <div
                key={i}
                className="text-sm bg-gray-50 px-3 py-1.5 rounded border"
              >
                {p.product.name} × {p.qty}
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 하단 진행바 + 버튼 */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">진행 상태</span>
            <span className="text-xs font-medium">{displayProgress}%</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${displayProgress}%` }}
            />
          </div>

          {/* 🔥 상태별 버튼 변화 */}
          <button
            onClick={isOptimal ? onStart : onStart}
            disabled={running && isReady}
            className={`w-full py-2 rounded-md text-sm font-medium transition-colors
              ${
                isOptimal
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : running
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : ispending
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            {isOptimal
              ? "시뮬레이션 결과 보러가기"
              : ispending
                ? "시뮬레이팅 중.."
                : running
                  ? "시나리오 데이터 전송 중..."
                  : "Start"}
          </button>
        </div>
      </div>
    </section>
  );
}

/* 🔹 작은 정보 표시 컴포넌트 */
function Info({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-lg px-3 py-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}
