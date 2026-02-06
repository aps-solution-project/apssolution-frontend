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

      const taskRows = schedules.map((s, idx) => {
        const duration =
          Number(s?.scheduleTask?.duration) ||
          minutesBetween(s?.startAt, s?.endAt) ||
          0;

        return {
          type: "task",
          key: `task:${p.id}:${s?.id ?? idx}`,
          row: r++,
          productId: p.id,
          productName: p.name || p.id,
          taskName: s?.scheduleTask?.name || "작업",
          workerName: s?.worker?.name || "미배정",
          toolId: s?.toolId || "미지정",
          startAt: s?.startAt,
          endAt: s?.endAt,
          start: minutesFromStart(s?.startAt, scenarioStart),
          duration,
          raw: s,
        };
      });

      return [groupRow, ...taskRows];
    });
  }, [products, openProducts, scenarioStart]);

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
    <div className="w-full h-[calc(100vh-140px)] rounded-xl border border-slate-200 bg-white overflow-hidden ">
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
