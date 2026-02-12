import { editScenarioSchedule } from "@/api/scenario-api";
import { Slider } from "@/components/ui/slider";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import LeftPanelForWorker from "./LeftPanelForWoker";
import Timeline from "./Timeline";
import { getAllTools } from "@/api/tool-api";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 44;
const MINUTES_PER_DAY = 24 * 60;

export default forwardRef(function SimulationGanttForWorker(
  { products, scenarioStart, workers = [], token },
  ref,
) {
  const [tools, setTools] = useState([]);
  const [minuteWidth, setMinuteWidth] = useState(2);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const scaleRef = useRef(null);
  const bodyRef = useRef(null);

  const [panelWidth, setPanelWidth] = useState(320);
  const resizing = useRef(false);

  // barId → { workerId, workerName, toolId }
  const [barOverrides, setBarOverrides] = useState({});

  const handleBarSave = async (scheduleId, payload) => {
    const body = {};
    if (payload.workerId) body.workerId = payload.workerId;
    if (payload.toolId) body.toolId = payload.toolId;

    const result = await editScenarioSchedule(token, scheduleId, body);

    const sc = result?.scenarioSchedule;
    if (sc) {
      setBarOverrides((prev) => ({
        ...prev,
        [scheduleId]: {
          workerId: sc.worker?.id ?? prev[scheduleId]?.workerId,
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

  useEffect(() => {
    if (!token) return;
    getAllTools(token)
      .then((obj) => {
        setTools(() => obj.tools || []);
      })
      .catch(() => {
        // 권한 없는 작업자 계정 — 도구 목록 없이 진행
        setTools([]);
      });
  }, [token]);

  const [openWorkers, setOpenWorkers] = useState(() => {
    const list = Array.isArray(products) ? products : [];
    const ws = new Set();
    list.forEach((p) => {
      (p.scenarioSchedules || []).forEach((s) => {
        ws.add(s?.worker?.id || "unassigned");
      });
    });
    return Object.fromEntries(Array.from(ws).map((w) => [w, true]));
  });

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    const ws = new Set();
    list.forEach((p) => {
      (p.scenarioSchedules || []).forEach((s) => {
        const ov = barOverrides[s?.id];
        ws.add(ov?.workerId || s?.worker?.id || "unassigned");
      });
    });

    setOpenWorkers((prev) => {
      const next = { ...prev };
      ws.forEach((w) => {
        if (next[w] === undefined) next[w] = true;
      });
      return next;
    });
  }, [products, barOverrides]);

  const toggleWorker = (workerId) =>
    setOpenWorkers((p) => ({ ...p, [workerId]: !p[workerId] }));

  const rows = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    let r = 0;

    const workerMap = new Map();

    list.forEach((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];

      schedules.forEach((s, idx) => {
        const ov = barOverrides[s?.id];
        const workerId = ov?.workerId || s?.worker?.id || "unassigned";
        const workerName = ov?.workerName || s?.worker?.name || "미배정";
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
            productName: p.name || p.id,
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
          workerName,
          toolId: ov?.toolId || s?.toolId || "미지정",
          // 제품의 categoryId를 바에 포함시켜 GanttBar 등에서 사용 가능하게 함
          productCategoryId: p?.categoryId ?? p?.category?.id ?? null,
          raw: s,
        });
      });
    });

    const sortedWorkers = Array.from(workerMap.values()).sort((a, b) => {
      if (a.workerId === "unassigned") return 1;
      if (b.workerId === "unassigned") return -1;
      return a.workerName.localeCompare(b.workerName);
    });

    const allRows = [];

    sortedWorkers.forEach((worker) => {
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
        taskRow.bars.sort((a, b) => a.start - b.start);

        let lastEnd = -Infinity;
        taskRow.bars.forEach((bar) => {
          if (bar.start < lastEnd) bar.start = lastEnd;
          lastEnd = bar.start + bar.duration;
        });

        taskRow.row = r++;
        allRows.push(taskRow);
      });
    });

    return allRows;
  }, [products, openWorkers, scenarioStart, barOverrides]);

  // ── 제품 클릭 → 간트 스크롤 이동 ──
  const [highlightRowKey, setHighlightRowKey] = useState(null);
  const highlightTimer = useRef(null);
  const pendingScrollRef = useRef(null); // { productName }

  // scrollToProduct: 작업자 그룹 펼치고 pendingScroll 예약
  const scrollToProduct = useCallback(
    (productName) => {
      if (!productName) return;

      // 해당 제품이 소속된 작업자 그룹 모두 펼치기
      const list = Array.isArray(products) ? products : [];
      const workerIds = new Set();
      for (const p of list) {
        if ((p.name || p.id) !== productName) continue;
        for (const s of p.scenarioSchedules || []) {
          workerIds.add(s?.worker?.id || "unassigned");
        }
      }

      setOpenWorkers((prev) => {
        const next = { ...prev };
        workerIds.forEach((wId) => {
          next[wId] = true;
        });
        return next;
      });

      pendingScrollRef.current = { productName };
    },
    [products],
  );

  // rows가 갱신된 후 실제 스크롤 수행
  useEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending) return;
    pendingScrollRef.current = null;

    const { productName } = pending;

    // 1) 해당 제품의 첫 번째 task row 찾기
    let targetRow = null;
    let earliestBarStart = Infinity;

    for (const r of rows) {
      if (r.type !== "task") continue;
      if (r.productName !== productName) continue;
      if (!targetRow) targetRow = r;
      for (const b of r.bars || []) {
        if (b.start < earliestBarStart) {
          earliestBarStart = b.start;
          targetRow = r;
        }
      }
    }

    if (!targetRow) return;

    // 2) 해당 날짜로 전환
    const dayIdx =
      earliestBarStart !== Infinity
        ? Math.floor(earliestBarStart / MINUTES_PER_DAY)
        : 0;
    setCurrentDayIndex(dayIdx);

    // 3) 스크롤 (날짜 전환 후 다음 프레임)
    requestAnimationFrame(() => {
      const bodyEl = bodyRef.current;
      if (!bodyEl) return;

      // 세로 스크롤: 대상 row 위치
      const targetY = Math.max(0, targetRow.row * ROW_HEIGHT - ROW_HEIGHT * 2);
      bodyEl.scrollTop = targetY;

      // 가로 스크롤: 첫 bar 위치 (현재 day 기준)
      if (earliestBarStart !== Infinity) {
        const dayStart = dayIdx * MINUTES_PER_DAY;
        const barPosX = (earliestBarStart - dayStart) * minuteWidth;
        const scrollX = Math.max(0, barPosX - 120);
        bodyEl.scrollLeft = scrollX;

        const scaleEl = scaleRef.current;
        if (scaleEl) scaleEl.scrollLeft = scrollX;
      }
    });

    // 4) 하이라이트
    setHighlightRowKey(targetRow.key);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightRowKey(null), 2500);
  }, [rows, minuteWidth]);

  useImperativeHandle(
    ref,
    () => ({
      scrollToProduct,
    }),
    [scrollToProduct],
  );

  const totalMinutes = useMemo(() => {
    let maxEnd = 0;
    for (const r of rows) {
      if (r.type !== "task" || !Array.isArray(r.bars)) continue;
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
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevDay}
              disabled={currentDayIndex === 0}
              className="h-9 w-9 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 whitespace-nowrap min-w-[100px] text-center">
                {formatDayLabel(currentDayIndex)}
              </span>
              <span className="text-[10px] text-slate-500">
                ({currentDayIndex + 1}/{totalDays})
              </span>
            </div>

            <button
              onClick={handleNextDay}
              disabled={currentDayIndex === totalDays - 1}
              className="h-9 w-9 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
              workers={workers}
              tools={tools}
              onBarSave={handleBarSave}
              highlightRowKey={highlightRowKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

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
