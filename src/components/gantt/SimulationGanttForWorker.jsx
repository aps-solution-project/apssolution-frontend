import { Slider } from "@/components/ui/slider";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LeftPanelForWorker from "./LeftPanelForWoker";
import Timeline from "./Timeline";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 44;
const MINUTES_PER_DAY = 24 * 60; // 1440 minutes

export default function SimulationGanttForWorker({ products, scenarioStart }) {
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

  // 작업자별 open/close 상태 관리
  const [openWorkers, setOpenWorkers] = useState(() => {
    const list = Array.isArray(products) ? products : [];
    const workers = new Set();

    list.forEach((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];
      schedules.forEach((s) => {
        const workerId = s?.worker?.id || "unassigned";
        workers.add(workerId);
      });
    });

    return Object.fromEntries(Array.from(workers).map((w) => [w, true]));
  });

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    const workers = new Set();

    list.forEach((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];
      schedules.forEach((s) => {
        const workerId = s?.worker?.id || "unassigned";
        workers.add(workerId);
      });
    });

    setOpenWorkers((prev) => {
      const next = { ...prev };
      workers.forEach((w) => {
        if (next[w] === undefined) next[w] = true;
      });

      for (const k of Object.keys(next)) {
        if (!workers.has(k)) delete next[k];
      }
      return next;
    });
  }, [products]);

  const toggleWorker = (workerId) =>
    setOpenWorkers((p) => ({ ...p, [workerId]: !p[workerId] }));

  // 작업자 기준으로 rows 생성 (작업자 > 작업)
  const rows = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    let r = 0;

    // workerId -> { workerId, workerName, taskMap }
    const workerMap = new Map();

    list.forEach((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];

      schedules.forEach((s, idx) => {
        const workerId = s?.worker?.id || "unassigned";
        const workerName = s?.worker?.name || "미배정";
        const taskName = s?.scheduleTask?.name || "작업";

        if (!workerMap.has(workerId)) {
          workerMap.set(workerId, {
            workerId,
            workerName,
            taskMap: new Map(),
          });
        }

        const worker = workerMap.get(workerId);

        if (!worker.taskMap.has(taskName)) {
          worker.taskMap.set(taskName, {
            type: "task",
            key: `task:${workerId}:${taskName}`,
            row: -1,
            workerId,
            workerName,
            taskName,
            bars: [],
          });
        }

        const duration =
          Number(s?.scheduleTask?.duration) ||
          minutesBetween(s?.startAt, s?.endAt) ||
          0;

        worker.taskMap.get(taskName).bars.push({
          id: s?.id ?? `${workerId}-${idx}`,
          start: minutesFromStart(s?.startAt, scenarioStart),
          duration,
        });
      });
    });

    // worker 정렬
    const workers = Array.from(workerMap.values()).sort((a, b) => {
      if (a.workerId === "unassigned") return 1;
      if (b.workerId === "unassigned") return -1;
      return a.workerName.localeCompare(b.workerName);
    });

    const allRows = [];

    workers.forEach((worker) => {
      const { workerId, workerName, taskMap } = worker;

      allRows.push({
        type: "group",
        key: `group:${workerId}`,
        row: r++,
        workerId,
        workerName,
        count: taskMap.size,
        open: Boolean(openWorkers[workerId]),
      });

      if (!openWorkers[workerId]) return;

      Array.from(taskMap.values()).forEach((taskRow) => {
        // 🔥 겹침 방지 핵심 로직
        taskRow.bars.sort((a, b) => a.start - b.start);

        let lastEnd = -Infinity;
        taskRow.bars.forEach((bar) => {
          if (bar.start < lastEnd) {
            bar.start = lastEnd; // 뒤로 밀기
          }
          lastEnd = bar.start + bar.duration;
        });

        taskRow.row = r++;
        allRows.push(taskRow);
      });
    });

    return allRows;
  }, [products, openWorkers, scenarioStart]);

  const totalMinutes = useMemo(() => {
    let maxEnd = 0;
    for (const r of rows) {
      if (r.type !== "task") continue;
      const end = (r.start || 0) + (r.duration || 0);
      if (end > maxEnd) maxEnd = end;
    }
    return Math.max(0, maxEnd + 60);
  }, [rows]);

  // Calculate number of days needed
  const totalDays = Math.ceil(totalMinutes / MINUTES_PER_DAY);

  // Calculate date for each day
  const getDayDate = (dayIndex) => {
    if (!scenarioStart) return null;
    const date = new Date(scenarioStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const formatDayLabel = (dayIndex) => {
    const date = getDayDate(dayIndex);
    if (!date) return `Day ${dayIndex + 1}`;

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];

    return `${month}/${day} (${weekday})`;
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < totalDays - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-white h-14">
        <div className="flex items-center gap-4 flex-1">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3 min-w-[380px]">
            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
              타임라인 조절
            </span>
            <Slider
              value={[minuteWidth]}
              onValueChange={([v]) => setMinuteWidth(v)}
              min={4}
              max={12}
              step={0.5}
              className={["w-[300px]"].join(" ")}
            />

            <span className="text-xs text-slate-500 whitespace-nowrap w-16">
              {minuteWidth.toFixed(1)}x
            </span>
          </div>

          <div className="text-xs text-slate-500">
            {rows.filter((r) => r.type === "task").length} tasks ·{" "}
            {formatScenarioStart(scenarioStart)}
          </div>
        </div>

        {/* Day Navigation */}
        {totalDays > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-xs font-medium text-slate-700 whitespace-nowrap min-w-[100px] text-center">
              {formatDayLabel(currentDayIndex)}
            </span>
            <span className="text-[10px] text-slate-500">
              ({currentDayIndex + 1}/{totalDays})
            </span>
          </div>
        )}
      </div>

      <div className="h-[calc(100%-44px)] overflow-auto relative">
        <div className="flex w-full min-w-0">
          <div
            style={{ width: panelWidth, minWidth: panelWidth }}
            className="sticky left-0 z-30 relative shrink-0 border-r border-slate-200 bg-white"
          >
            <LeftPanelForWorker
              width={panelWidth}
              products={products}
              open={openWorkers}
              onToggle={toggleWorker}
              rows={rows}
              rowHeight={ROW_HEIGHT}
              headerHeight={HEADER_HEIGHT}
            />

            <div
              onMouseDown={startResize}
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-slate-200/60 hover:bg-slate-300"
            />
          </div>

          <div className="relative flex-1 min-w-0">
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

        {/* Day Navigation Buttons */}
        <button
          onClick={handlePrevDay}
          disabled={totalDays === 1 || currentDayIndex === 0}
          className="absolute top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-lg hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed transition-all flex items-center justify-center"
          style={{
            left: `${panelWidth + 16}px`,
            opacity: totalDays === 1 ? 0.3 : currentDayIndex === 0 ? 0.5 : 1,
          }}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNextDay}
          disabled={totalDays === 1 || currentDayIndex === totalDays - 1}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-10 w-10 rounded-full border border-slate-200 bg-white shadow-lg hover:bg-slate-50 hover:shadow-xl disabled:cursor-not-allowed transition-all flex items-center justify-center"
          style={{
            opacity:
              totalDays === 1
                ? 0.3
                : currentDayIndex === totalDays - 1
                  ? 0.5
                  : 1,
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function minutesFromStart(t, base) {
  if (!t || !base) return 0;
  return (new Date(t) - new Date(base)) / 60000;
}

function minutesBetween(a, b) {
  if (!a || !b) return 0;
  return (new Date(b) - new Date(a)) / 60000;
}

function formatScenarioStart(startAt) {
  if (!startAt) return "";
  const d = new Date(startAt);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}
