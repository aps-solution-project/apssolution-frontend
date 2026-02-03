export default function ScenariosInformation({
  selectedScenario,
  progress,
  running,
  completed,
  onStart,
}) {
  if (!selectedScenario) return null;

  return (
    <section className="w-1/2 p-6 bg-gray-100">
      <div className="bg-white border p-6 h-full flex flex-col shadow-sm">
        <div className="space-y-2">
          <div className="text-lg font-semibold text-blue-700">
            {selectedScenario.title}
          </div>

          <div className="text-sm text-gray-600">
            {selectedScenario.description}
          </div>

          <div className="text-sm">시작: {selectedScenario.startAt}</div>

          <div className="text-sm">인원: {selectedScenario.maxWorkerCount}</div>

          {selectedScenario.scenarioProductList.map((p, i) => (
            <div key={i} className="text-sm">
              {p.productId} - {p.quantity}
            </div>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-end gap-3">
          <div className="w-48 h-2 bg-gray-200 overflow-hidden rounded-full">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-xs w-10 text-right">{progress}%</span>

          <button
            onClick={onStart}
            disabled={running}
            className={`px-4 py-1.5 rounded text-sm transition-colors ${
              running
                ? "bg-gray-400 text-white cursor-not-allowed"
                : completed
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {completed ? "완료" : running ? "실행중" : "Start"}
          </button>
        </div>
      </div>
    </section>
  );
}
