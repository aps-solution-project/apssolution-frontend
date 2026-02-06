import { useEffect, useMemo, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import Timeline from "./Timeline";

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 44;

export default function SimulationGantt({ products, scenarioStart }) {
  const [minuteWidth, setMinuteWidth] = useState(2);

  const scaleRef = useRef(null);
  const bodyRef = useRef(null);

  const [panelWidth, setPanelWidth] = useState(320);
  const resizing = useRef(false);

  const [assignmentOverrides, setAssignmentOverrides] = useState({});

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

  const [openWorkers, setOpenWorkers] = useState(() => {
    const list = Array.isArray(products) ? products : [];
    const next = {};

    for (const p of list) {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];
      for (const s of schedules) {
        const wid = s?.worker?.id;
        const wk = wid ? String(wid) : "unassigned";
        if (next[wk] === undefined) next[wk] = true;
      }
    }

    if (Object.keys(next).length === 0) next.unassigned = true;
    return next;
  });

  const toggleWorker = (workerKey) =>
    setOpenWorkers((p) => ({ ...p, [workerKey]: !p[workerKey] }));

  const tasks = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const out = [];

    for (const p of list) {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];

      for (let idx = 0; idx < schedules.length; idx++) {
        const s = schedules[idx];
        const rowKey = `task:${p.id}:${s?.id ?? idx}`;

        const ov = assignmentOverrides?.[rowKey];
        const baseWorkerId = s?.worker?.id ?? "";
        const baseWorkerName = s?.worker?.name || "미배정";
        const baseToolId = s?.toolId || "미지정";

        const workerId = ov?.workerId ?? baseWorkerId;
        const workerName =
          ov?.workerName ??
          baseWorkerName ??
          (workerId ? String(workerId) : "미배정");
        const toolId = ov?.toolId ?? baseToolId;

        const duration =
          Number(s?.scheduleTask?.duration) ||
          minutesBetween(s?.startAt, s?.endAt) ||
          0;

        out.push({
          type: "task",
          key: rowKey,
          scheduleId: s?.id ?? null,

          productId: p.id,
          productName: p.name || p.id,
          taskName: s?.scheduleTask?.name || "작업",

          workerId,
          workerName,
          toolId,

          startAt: s?.startAt,
          endAt: s?.endAt,
          start: minutesFromStart(s?.startAt, scenarioStart),
          duration,
          raw: s,
        });
      }
    }

    return out;
  }, [products, scenarioStart, assignmentOverrides]);

  const workerGroups = useMemo(() => {
    const map = new Map();
    const order = [];

    for (const t of tasks) {
      const wk = t.workerId ? String(t.workerId) : "unassigned";
      if (!map.has(wk)) {
        map.set(wk, {
          workerKey: wk,
          workerId: t.workerId || "",
          workerName: t.workerId ? t.workerName : "미배정",
          tasks: [],
        });
        order.push(wk);
      }
      map.get(wk).tasks.push(t);
    }

    return order.map((k) => map.get(k)).filter(Boolean);
  }, [tasks]);

  useEffect(() => {
    const keys = workerGroups.map((g) => g.workerKey);
    if (!keys.length) keys.push("unassigned");

    setOpenWorkers((prev) => {
      const next = { ...prev };

      for (const k of keys) if (next[k] === undefined) next[k] = true;

      for (const k of Object.keys(next)) {
        if (!keys.includes(k)) delete next[k];
      }

      return next;
    });
  }, [workerGroups]);

  const rows = useMemo(() => {
    let r = 0;

    return workerGroups.flatMap((g) => {
      const isOpen = Boolean(openWorkers[g.workerKey]);

      const groupRow = {
        type: "group",
        key: `group:worker:${g.workerKey}`,
        row: r++,

        workerKey: g.workerKey,
        workerId: g.workerId || "",
        workerName: g.workerName || "미배정",

        count: g.tasks.length,
        open: isOpen,
      };

      if (!isOpen) return [groupRow];

      const taskRows = g.tasks.map((t) => ({
        ...t,
        row: r++,
        workerKey: g.workerKey,
        workerName: t.workerName,
      }));

      return [groupRow, ...taskRows];
    });
  }, [workerGroups, openWorkers]);

  const totalMinutes = useMemo(() => {
    let maxEnd = 0;
    for (const r of rows) {
      if (r.type !== "task") continue;
      const end = (r.start || 0) + (r.duration || 0);
      if (end > maxEnd) maxEnd = end;
    }
    const padded = Math.max(0, maxEnd + 60);
    if (padded <= 24 * 60) return Math.ceil(padded / 60) * 60;
    return Math.ceil(padded / (6 * 60)) * 6 * 60;
  }, [rows]);

  const canvasWidth = useMemo(
    () => Math.max(1, totalMinutes * minuteWidth),
    [totalMinutes, minuteWidth],
  );

  return (
    <div className="w-full h-[calc(100vh-140px)] rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-white h-14">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {[
              { label: "5분", v: 5 },
              { label: "15분", v: 15 },
              { label: "30분", v: 30 },
            ].map(({ label, v }) => {
              const mw = 60 / v;
              const active = minuteWidth === mw;
              return (
                <button
                  key={v}
                  onClick={() => setMinuteWidth(mw)}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-medium transition",
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500">
            {rows.filter((r) => r.type === "task").length} tasks ·{" "}
            {formatScenarioStart(scenarioStart)}
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-44px)] overflow-auto">
        <div className="flex w-full min-w-0">
          <div
            style={{ width: panelWidth, minWidth: panelWidth }}
            className="sticky left-0 z-30 relative shrink-0 border-r border-slate-200 bg-white"
          >
            <LeftPanel
              width={panelWidth}
              products={products}
              open={openWorkers}
              onToggle={toggleWorker}
              rows={rows}
              rowHeight={ROW_HEIGHT}
              headerHeight={HEADER_HEIGHT}
              assignmentOverrides={assignmentOverrides}
              onChangeAssignmentOverrides={setAssignmentOverrides}
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
              totalMinutes={totalMinutes}
              rowHeight={ROW_HEIGHT}
              headerHeight={HEADER_HEIGHT}
            />
          </div>
        </div>
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
