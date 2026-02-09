import React from "react";

export default function GanttBar({
  row,
  minuteWidth,
  rowHeight,
  scenarioStart,
  totalMinutes,
}) {
  if (!row || row.type !== "task") return null;

  const left = clamp(
    (row.start || 0) * minuteWidth,
    0,
    totalMinutes * minuteWidth,
  );
  const width = Math.max(2, (row.duration || 0) * minuteWidth);

  const barHeight = 28;
  const top = row.row * rowHeight + (rowHeight - barHeight) / 2;

  const { bg, text, border } = toolColor(row.toolId, row.taskName);

  // scenarioStart 기준 실제 시간으로 표시
  const startLabel = formatFromScenario(scenarioStart, row.start || 0);
  const showText = width >= 90;

  return (
    <div
      className="absolute cursor-default"
      style={{ left, top, width, height: barHeight }}
      title={`${row.productName}\n${row.taskName}\n${row.workerName} · ${row.toolId}`}
    >
      <div
        className="h-full w-full flex items-center overflow-hidden border"
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 8,
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
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`text-[10px] font-medium opacity-55 truncate ${text}`}
              >
                {row.workerName}
              </span>
            </div>
          ) : (
            <span className={`text-[11px] font-bold truncate ${text}`}>
              {row.taskName.charAt(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// scenarioStart 기준 실제 시간 포맷
function formatFromScenario(startAt, offsetMinutes) {
  if (!startAt) {
    // scenarioStart가 없으면 상대 시간
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

// NEUTRAL: 일반 작업 / MIX: 혼합 / FORM: 성형·가공 / COOL: 냉각·저온 / HEAT: 굽기·열처리
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
  if (k === "DEP") return "FORM";
  if (k === "TNK") return "FORM";
  if (k === "PRF") return "FORM";
  return "NEUTRAL";
}

function toolColor(toolId = "", taskName = "") {
  if (TASK_TONE[taskName]) return TASK_TONE[taskName];
  const base = categoryFromToolId(toolId);
  return BASE[base] || BASE.NEUTRAL;
}
