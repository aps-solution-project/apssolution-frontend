import { Slider } from "@/components/ui/slider";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import Timeline from "./Timeline";
import { editScenarioSchedule } from "@/api/scenario-api";
import { getAllTools } from "@/api/tool-api";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 44;
const MINUTES_PER_DAY = 24 * 60;

export default function SimulationGantt({
  products,
  scenarioStart,
  workers = [],
  token,
}) {
  const [tools, setTools] = useState([]);

  const [minuteWidth, setMinuteWidth] = useState(2);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const scaleRef = useRef(null);
  const bodyRef = useRef(null);

  const [panelWidth, setPanelWidth] = useState(320);
  const resizing = useRef(false);

  // barId → { workerName, toolId } (로컬 오버라이드 — API 응답으로 업데이트)
  const [barOverrides, setBarOverrides] = useState({});

  /**
   * 간트바 저장: PATCH API 호출 후 응답으로 로컬 상태 업데이트
   * @param {number|string} scheduleId  scenarioSchedule.id
   * @param {{ workerId?: string, toolId?: string }} payload
   */
  const handleBarSave = async (scheduleId, payload) => {
    const body = {};
    if (payload.workerId) body.workerId = payload.workerId;
    if (payload.toolId) body.toolId = payload.toolId;

    const result = await editScenarioSchedule(token, scheduleId, body);

    // 응답: { scenarioSchedule: { worker: { id, name, ... }, tool: { id, name, ... }, ... } }
    const sc = result?.scenarioSchedule;
    if (sc) {
      setBarOverrides((prev) => ({
        ...prev,
        [scheduleId]: {
          workerName: sc.worker?.name ?? prev[scheduleId]?.workerName,
          toolId: sc.tool?.id ?? prev[scheduleId]?.toolId,
        },
      }));
    }

    return result;
  };

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

  // 도구 목록 추출
  // const tools = useMemo(() => {
  //   const s = new Set();
  //   for (const p of Array.isArray(products) ? products : [])
  //     for (const sc of p.scenarioSchedules || [])
  //       if (sc.toolId) s.add(sc.toolId);
  //   return Array.from(s)
  //     .sort()
  //     .map((id) => ({ id, name: id }));
  // }, [products]);

  useEffect(() => {
    if (!token) return;
    getAllTools(token).then((obj) => {
      setTools(() => obj.tools);
    });
  }, [token]);

  // rows 생성
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

        const ov = barOverrides[s.id];

        taskMap.get(taskId).bars.push({
          id: s.id,
          start: minutesFromStart(s?.startAt, scenarioStart),
          duration,
          workerName: ov?.workerName || s?.worker?.name || "미배정",
          toolId: ov?.toolId || s?.toolId || "미지정",
          raw: s,
        });
      }

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
  }, [products, openProducts, scenarioStart, barOverrides]);

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

  const formatDayLabel = (dayIndex) => {
    if (!scenarioStart) return `Day ${dayIndex + 1}`;
    const d = new Date(scenarioStart);
    d.setDate(d.getDate() + dayIndex);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const w = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    return `${mm}/${dd} (${w})`;
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) setCurrentDayIndex(currentDayIndex - 1);
  };
  const handleNextDay = () => {
    if (currentDayIndex < totalDays - 1)
      setCurrentDayIndex(currentDayIndex + 1);
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-white h-14">
        <div className="flex items-center gap-4 flex-1">
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
              className="w-[300px]"
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

      <div className="h-[calc(100%-56px)] overflow-auto relative">
        <div className="flex w-full min-w-0">
          <div
            style={{ width: panelWidth, minWidth: panelWidth }}
            className="sticky left-0 z-30 relative shrink-0 border-r border-slate-200 bg-white"
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
              workers={workers}
              tools={tools}
              onBarSave={handleBarSave}
            />
          </div>
        </div>

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
