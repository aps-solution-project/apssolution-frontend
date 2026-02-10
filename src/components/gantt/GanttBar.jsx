export default function GanttBar({
  row,
  minuteWidth,
  rowHeight,
  scenarioStart,
  totalMinutes,
  dayOffset = 0,
}) {
  if (!row || row.type !== "task" || !Array.isArray(row.bars)) {
    return null;
  }

  const barHeight = 28;
  const top = row.row * rowHeight + (rowHeight - barHeight) / 2;

  return (
    <>
      {row.bars.map((bar) => {
        const taskStart = bar.start || 0;
        const taskDuration = bar.duration || 0;
        const taskEnd = taskStart + taskDuration;

        const dayStart = dayOffset;
        const dayEnd = dayOffset + totalMinutes;

        // 현재 day 범위에 안 걸리면 렌더링 안 함
        if (taskEnd <= dayStart || taskStart >= dayEnd) {
          return null;
        }

        const visibleStart = Math.max(taskStart, dayStart);
        const visibleEnd = Math.min(taskEnd, dayEnd);
        const visibleDuration = visibleEnd - visibleStart;

        const relativeStart = visibleStart - dayStart;

        const left = clamp(
          relativeStart * minuteWidth,
          0,
          totalMinutes * minuteWidth,
        );
        const width = Math.max(2, visibleDuration * minuteWidth);

        const { bg, text, border } = toolColor(
          bar.toolId ?? row.toolId,
          row.taskName,
        );

        const startLabel = formatFromScenario(scenarioStart, visibleStart);

        const continuesFromPrev = taskStart < dayStart;
        const continuesToNext = taskEnd > dayEnd;

        const showText = width >= 90;

        return (
          <div
            key={bar.id}
            className="absolute cursor-default"
            style={{ left, top, width, height: barHeight }}
            title={`${row.productName}\n${row.taskName}\n${row.workerName} · ${
              bar.toolId ?? row.toolId
            }`}
          >
            <div
              className="h-full w-full flex items-center overflow-hidden border"
              style={{
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 1,
                borderRadius: continuesFromPrev
                  ? continuesToNext
                    ? 0
                    : "0 6px 6px 0"
                  : continuesToNext
                    ? "6px 0 0 6px"
                    : 6,
                borderLeftWidth: continuesFromPrev ? 0 : 1,
                borderRightWidth: continuesToNext ? 0 : 1,
              }}
            >
              <div
                style={{
                  width: continuesFromPrev ? 0 : 8,
                  height: "100%",
                  backgroundColor: border,
                  flexShrink: 0,
                }}
              />

              <div className="flex items-center gap-2 px-2 min-w-0">
                <span
                  className={`text-[10px] font-mono font-semibold tracking-tight opacity-70 shrink-0 ${text}`}
                >
                  {startLabel}
                </span>

                {showText ? (
                  <span
                    className={`text-[10px] font-medium opacity-55 truncate ${text}`}
                  >
                    {row.workerName}
                  </span>
                ) : (
                  <span className={`text-[11px] font-bold truncate ${text}`}>
                    {row.taskName?.charAt(0)}
                  </span>
                )}
              </div>

              {continuesToNext && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-1"
                  style={{
                    background: `linear-gradient(to right, transparent, ${border})`,
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function formatFromScenario(startAt, offsetMinutes) {
  if (!startAt) {
    return `${pad2(Math.floor(offsetMinutes / 60))}:${pad2(
      Math.floor(offsetMinutes % 60),
    )}`;
  }
  const d = new Date(startAt);
  const t = new Date(d.getTime() + offsetMinutes * 60000);
  return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// 색상 정의
const BASE = {
  NEUTRAL: { bg: "#ECFDF5", border: "#10B981", text: "text-emerald-900" },
  MIX: { bg: "#FFF1F2", border: "#FB7185", text: "text-yellow-900" },
  FORM: { bg: "#F5F3FF", border: "#A78BFA", text: "text-blue-900" },
  COOL: { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  HEAT: { bg: "#FFF7ED", border: "#FB923C", text: "text-rose-900" },
};

const TASK_TONE = {
  굽기: { bg: "#FFF7ED", border: "#F97316", text: "text-orange-900" },
  "스팀 굽기": { bg: "#FFEDD5", border: "#EA580C", text: "text-orange-900" },
  튀기기: { bg: "#FEF3C7", border: "#F59E0B", text: "text-amber-900" },
  "냉장 휴지": { bg: "#ECFEFF", border: "#06B6D4", text: "text-cyan-900" },
  "저온 휴지": { bg: "#E0F2FE", border: "#0EA5E9", text: "text-sky-900" },
  냉각: { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  "1차 냉각": { bg: "#ECFEFF", border: "#22D3EE", text: "text-cyan-900" },
  "최종 냉각": { bg: "#ECFEFF", border: "#06B6D4", text: "text-cyan-900" },
};

function categoryFromToolId(toolId = "") {
  const k = String(toolId).split("-")[1]?.toUpperCase();
  if (k === "MIX") return "MIX";
  if (k === "OVN" || k === "OVEN") return "HEAT";
  if (k === "FRY") return "HEAT";
  if (k === "DEP" || k === "TNK" || k === "PRF") return "FORM";
  return "NEUTRAL";
}

function toolColor(toolId = "", taskName = "") {
  if (TASK_TONE[taskName]) return TASK_TONE[taskName];
  const base = categoryFromToolId(toolId);
  return BASE[base] || BASE.NEUTRAL;
}
