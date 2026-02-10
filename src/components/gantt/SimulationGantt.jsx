import { Slider } from "@/components/ui/slider";
import { Calendar } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import Timeline from "./Timeline";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 44;
const MINUTES_PER_DAY = 24 * 60;

export default function SimulationGantt({ products, scenarioStart }) {
  const [minuteWidth, setMinuteWidth] = useState(2);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const scaleRef = useRef(null);
  const bodyRef = useRef(null);

  const [panelWidth, setPanelWidth] = useState(320);
  const resizing = useRef(false);

  const startResize = () => (resizing.current = true);
  const stopResize = () => (resizing.current = false);

  useEffect(() => {
    const resize = (e) => {
      if (!resizing.current) return;
      setPanelWidth((w) => Math.max(220, Math.min(520, w + e.movementX)));
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  const [openProducts, setOpenProducts] = useState(() => {
    const list = Array.isArray(products) ? products : [];
    return Object.fromEntries(list.map((p) => [p.id, true]));
  });

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    setOpenProducts((prev) => {
      const next = { ...prev };
      for (const p of list) if (next[p.id] === undefined) next[p.id] = true;
      for (const k of Object.keys(next)) {
        if (!list.find((p) => p.id === k)) delete next[k];
      }
      return next;
    });
  }, [products]);

  const toggleProduct = (id) =>
    setOpenProducts((p) => ({ ...p, [id]: !p[id] }));

  /**
   * ===============================
   * rows 생성 (작업 기준 그룹화)
   * ===============================
   */
  const rows = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    let r = 0;

    return list.flatMap((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];

      const groupRow = {
        type: "group",
        key: `group:${p.id}`,
        row: r++,
        productId: p.id,
        productName: p.name || p.id,
        count: schedules.length,
        open: Boolean(openProducts[p.id]),
      };

      if (!openProducts[p.id]) return [groupRow];

      // 🔹 작업 ID 기준으로 schedule 그룹화
      const taskMap = new Map();

      for (const s of schedules) {
        const taskId = s?.scheduleTask?.id || "UNKNOWN_TASK";

        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            taskId,
            taskName: s?.scheduleTask?.name || "작업",
            seq: s?.scheduleTask?.seq ?? 0,
            bars: [],
          });
        }

        const duration =
          Number(s?.scheduleTask?.duration) ||
          minutesBetween(s?.startAt, s?.endAt) ||
          0;

        taskMap.get(taskId).bars.push({
          id: s.id,
          start: minutesFromStart(s?.startAt, scenarioStart),
          duration,
          workerName: s?.worker?.name || "미배정",
          toolId: s?.toolId || "미지정",
          raw: s,
        });
      }

      // seq 기준 정렬
      const taskRows = [...taskMap.values()]
        .sort((a, b) => a.seq - b.seq)
        .map((task) => ({
          type: "task",
          key: `task:${p.id}:${task.taskId}`,
          row: r++,
          productId: p.id,
          productName: p.name || p.id,
          taskId: task.taskId,
          taskName: task.taskName,
          bars: task.bars,
        }));

      return [groupRow, ...taskRows];
    });
  }, [products, openProducts, scenarioStart]);

  /**
   * 전체 분 계산
   */
  const totalMinutes = useMemo(() => {
    let maxEnd = 0;
    for (const r of rows) {
      if (r.type !== "task") continue;
      for (const b of r.bars) {
        const end = (b.start || 0) + (b.duration || 0);
        if (end > maxEnd) maxEnd = end;
      }
    }
    return Math.max(0, maxEnd + 60);
  }, [rows]);

  const totalDays = Math.ceil(totalMinutes / MINUTES_PER_DAY);

  const getDayDate = (dayIndex) => {
    if (!scenarioStart) return null;
    const d = new Date(scenarioStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const formatDayLabel = (dayIndex) => {
    const d = getDayDate(dayIndex);
    if (!d) return `Day ${dayIndex + 1}`;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${mm}/${dd} (${w})`;
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b h-14">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-[380px]">
            <span className="text-xs text-slate-600">타임라인 조절</span>
            <Slider
              value={[minuteWidth]}
              onValueChange={([v]) => setMinuteWidth(v)}
              min={4}
              max={12}
              step={0.5}
              className="w-[300px]"
            />
            <span className="text-xs text-slate-500 w-16">
              {minuteWidth.toFixed(1)}x
            </span>
          </div>
        </div>

        {totalDays > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-medium">
              {formatDayLabel(currentDayIndex)}
            </span>
            <span className="text-[10px] text-slate-500">
              ({currentDayIndex + 1}/{totalDays})
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="h-[calc(100%-56px)] overflow-auto relative">
        <div className="flex">
          <div
            style={{ width: panelWidth, minWidth: panelWidth }}
            className="sticky left-0 z-30 border-r bg-white"
          >
            <LeftPanel
              width={panelWidth}
              products={products}
              open={openProducts}
              onToggle={toggleProduct}
              rows={rows}
              rowHeight={ROW_HEIGHT}
              headerHeight={HEADER_HEIGHT}
            />
            <div
              onMouseDown={startResize}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-slate-200"
            />
          </div>

          <div className="flex-1 relative">
            <Timeline
              rows={rows}
              minuteWidth={minuteWidth}
              scaleRef={scaleRef}
              bodyRef={bodyRef}
              scenarioStart={scenarioStart}
              totalMinutes={MINUTES_PER_DAY}
              dayOffset={currentDayIndex * MINUTES_PER_DAY}
              rowHeight={ROW_HEIGHT}
              headerHeight={HEADER_HEIGHT}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Util
 * ========================= */
function minutesFromStart(t, base) {
  if (!t || !base) return 0;
  return (new Date(t) - new Date(base)) / 60000;
}

function minutesBetween(a, b) {
  if (!a || !b) return 0;
  return (new Date(b) - new Date(a)) / 60000;
}
