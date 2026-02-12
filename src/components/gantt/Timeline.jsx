import { useEffect, useMemo, useRef, useState } from "react";
import GanttBar from "./GanttBar";
import TimeScale from "./TimeScale";

const BUFFER = 6;

export default function Timeline({
  rows,
  minuteWidth,
  scaleRef,
  bodyRef,
  onBodyScroll,
  scenarioStart,
  totalMinutes = 24 * 60,
  dayOffset = 0,
  rowHeight = 44,
  headerHeight = 44,
  workers = [],
  tools = [],
  onBarSave,
  highlightRowKey = null,
}) {
  const localScaleRef = useRef(null);
  const localBodyRef = useRef(null);

  const scaleElRef = scaleRef || localScaleRef;
  const bodyElRef = bodyRef || localBodyRef;

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const [openPopoverKey, setOpenPopoverKey] = useState(null);

  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });

  useEffect(() => {
    const el = bodyElRef.current;
    if (!el) return;

    const measure = () => {
      setViewportHeight(el.clientHeight);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [bodyElRef]);

  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER);
  const end = Math.min(rows.length, start + visibleCount + BUFFER * 2);
  const visibleRows = rows.slice(start, end);

  const minorStep = 5;
  const innerWidth = Math.max(1, totalMinutes * minuteWidth);

  // ── 12:00 / 00:00 세로선 위치 계산 ──
  const specialLines = useMemo(() => {
    if (!scenarioStart) return [];
    const lines = [];
    const startDate = new Date(scenarioStart);
    const dayStartDate = new Date(startDate.getTime() + dayOffset * 60000);

    // 첫 정시까지의 오프셋부터 60분 간격으로 검사
    const startMins = dayStartDate.getMinutes();
    const firstHourOffset = startMins === 0 ? 0 : 60 - startMins;

    for (let m = firstHourOffset; m <= totalMinutes; m += 60) {
      const d = new Date(dayStartDate.getTime() + m * 60000);
      const hours = d.getHours();

      if (hours === 0) {
        lines.push({ m, type: "midnight" });
      } else if (hours === 12) {
        lines.push({ m, type: "noon" });
      }
    }
    return lines;
  }, [scenarioStart, dayOffset, totalMinutes]);

  // ── 배경 그리드를 실제 시각 기준 minorStep에 정렬 ──
  const gridStyle = useMemo(() => {
    const x = minorStep * minuteWidth;
    const y = rowHeight;

    // scenarioStart의 분에서 다음 minorStep 배수까지의 오프셋 계산
    let gridOffsetPx = 0;
    if (scenarioStart) {
      const startDate = new Date(scenarioStart);
      const dayStartDate = new Date(startDate.getTime() + dayOffset * 60000);
      const startMins = dayStartDate.getMinutes();
      const minorRemainder = startMins % minorStep;
      const firstMinorOffset =
        minorRemainder === 0 ? 0 : minorStep - minorRemainder;
      gridOffsetPx = firstMinorOffset * minuteWidth;
    }

    return {
      backgroundImage: [
        "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px)",
        "linear-gradient(to bottom, rgba(148,163,184,0.18) 1px, transparent 1px)",
      ].join(", "),
      backgroundSize: `${x}px ${y}px`,
      backgroundPosition: `${gridOffsetPx}px 0px`,
    };
  }, [minorStep, minuteWidth, rowHeight, scenarioStart, dayOffset]);

  const handleScroll = (e) => {
    const el = e.target;
    setScrollTop(el.scrollTop);

    const scaleEl = scaleElRef.current;
    if (scaleEl && scaleEl.scrollLeft !== el.scrollLeft) {
      scaleEl.scrollLeft = el.scrollLeft;
    }

    if (onBodyScroll) onBodyScroll(e);
  };

  const handleHeaderScroll = (e) => {
    const el = e.target;
    const bodyEl = bodyElRef.current;
    if (bodyEl && bodyEl.scrollLeft !== el.scrollLeft) {
      bodyEl.scrollLeft = el.scrollLeft;
    }
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;

    const el = bodyElRef.current;
    if (!el) return;

    dragRef.current.active = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startScrollLeft = el.scrollLeft;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}

    e.preventDefault();
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;

    const el = bodyElRef.current;
    if (!el) return;

    const dx = e.clientX - dragRef.current.startX;
    el.scrollLeft = dragRef.current.startScrollLeft - dx;
  };

  const onPointerUp = (e) => {
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <div className="flex-1 relative bg-white">
      <div
        ref={scaleElRef}
        onScroll={handleHeaderScroll}
        className="sticky top-0 z-30 overflow-x-hidden border-b bg-white "
        style={{ height: 45 }}
      >
        <TimeScale
          minuteWidth={minuteWidth}
          totalMinutes={totalMinutes}
          scenarioStart={scenarioStart}
          dayOffset={dayOffset}
          minorStep={minorStep}
        />
      </div>

      <div
        ref={bodyElRef}
        onScroll={handleScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="gantt-body overflow-x-auto overflow-y-auto relative cursor-grab active:cursor-grabbing select-none"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div
          style={{
            height: rows.length * rowHeight,
            minWidth: innerWidth,
            position: "relative",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: innerWidth,
              height: rows.length * rowHeight,
              ...gridStyle,
            }}
          />

          {/* 12:00 / 00:00 세로선 */}
          {specialLines.map(({ m, type }) => {
            const left = m * minuteWidth;
            const isMidnight = type === "midnight";
            return (
              <div
                key={`special-${type}-${m}`}
                className="absolute top-0 pointer-events-none z-[1]"
                style={{
                  left,
                  width: 1,
                  height: rows.length * rowHeight,
                  background: isMidnight
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(59, 130, 246, 0.25)",
                }}
              />
            );
          })}

          {visibleRows.map((r, i) => {
            const top = (start + i) * rowHeight;

            if (r.type === "workerGroup" || r.type === "group") {
              return (
                <div
                  key={`bg:${r.key}`}
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top,
                    height: rowHeight,
                    background:
                      "linear-gradient(to right, rgba(15,23,42,0.06), rgba(15,23,42,0))",
                  }}
                />
              );
            }

            if (r.type === "productGroup") {
              return (
                <div
                  key={`bg:${r.key}`}
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top,
                    height: rowHeight,
                    background:
                      "linear-gradient(to right, rgba(59,130,246,0.05), rgba(59,130,246,0))",
                  }}
                />
              );
            }

            return null;
          })}

          {visibleRows.map((r, i) => (
            <GanttBar
              key={r.key || start + i}
              row={r}
              minuteWidth={minuteWidth}
              rowHeight={rowHeight}
              scenarioStart={scenarioStart}
              totalMinutes={totalMinutes}
              dayOffset={dayOffset}
              workers={workers}
              tools={tools}
              openPopoverKey={openPopoverKey}
              setOpenPopoverKey={setOpenPopoverKey}
              onBarSave={onBarSave}
            />
          ))}

          {/* 하이라이트 오버레이 */}
          {highlightRowKey &&
            visibleRows.map((r, i) => {
              if (r.key !== highlightRowKey) return null;
              const top = (start + i) * rowHeight;
              return (
                <div
                  key={`highlight:${r.key}`}
                  className="absolute left-0 right-0 pointer-events-none z-10 gantt-row-highlight"
                  style={{
                    top,
                    height: rowHeight,
                    background: "rgba(251, 191, 36, 0.18)",
                    borderTop: "2px solid rgba(245, 158, 11, 0.5)",
                    borderBottom: "2px solid rgba(245, 158, 11, 0.5)",
                  }}
                />
              );
            })}
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-0"
        style={{
          top: headerHeight,
          right: 0,
          height: 12,
          background:
            "linear-gradient(to bottom, rgba(15,23,42,0.06), rgba(15,23,42,0))",
        }}
      />

      <style jsx global>{`
        .gantt-body::-webkit-scrollbar:vertical {
          width: 0px;
        }
        .gantt-body::-webkit-scrollbar:horizontal {
          height: 12px;
        }

        .gantt-body {
          scrollbar-width: thin;
        }

        @keyframes ganttRowFlash {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
        .gantt-row-highlight {
          animation: ganttRowFlash 0.8s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}
