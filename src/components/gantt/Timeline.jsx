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
  rowHeight = 44,
  headerHeight = 44,
}) {
  const localScaleRef = useRef(null);
  const localBodyRef = useRef(null);

  const scaleElRef = scaleRef || localScaleRef;
  const bodyElRef = bodyRef || localBodyRef;

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

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

  const gridStyle = useMemo(() => {
    const x = minorStep * minuteWidth;
    const y = rowHeight;

    // SVG pattern (no CSS gradients) for crisp grid lines
    const stroke = "rgba(2,6,23,0.07)";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${x}" height="${y}" viewBox="0 0 ${x} ${y}">
  <path d="M ${x} 0 V ${y} M 0 ${y} H ${x}" fill="none" stroke="${stroke}" stroke-width="1"/>
</svg>`;

    return {
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
      backgroundRepeat: "repeat",
      backgroundPosition: "0 0",
    };
  }, [minorStep, minuteWidth, rowHeight]);

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

  return (
    <div className="flex-1 relative bg-white">
      <div
        ref={scaleElRef}
        onScroll={handleHeaderScroll}
        className="sticky top-0 z-30 overflow-x-hidden border-b border-slate-200 bg-white"
        style={{ height: 45 }}
      >
        <TimeScale
          minuteWidth={minuteWidth}
          totalMinutes={totalMinutes}
          scenarioStart={scenarioStart}
          minorStep={minorStep}
        />
      </div>

      <div
        ref={bodyElRef}
        onScroll={handleScroll}
        className="gantt-body overflow-x-auto overflow-y-hidden relative"
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
            className="absolute inset-0"
            style={{
              width: innerWidth,
              height: rows.length * rowHeight,
              ...gridStyle,
            }}
          />

          {visibleRows.map((r, i) => {
            const top = (start + i) * rowHeight;
            if (r.type !== "group") return null;

            return (
              <div
                key={`bg:${r.key}`}
                className="absolute left-0 right-0"
                style={{
                  top,
                  height: rowHeight,
                  backgroundColor: "rgba(2,6,23,0.035)",
                }}
              />
            );
          })}

          {visibleRows.map((r, i) => (
            <GanttBar
              key={r.key || start + i}
              row={r}
              minuteWidth={minuteWidth}
              rowHeight={rowHeight}
              scenarioStart={scenarioStart}
              totalMinutes={totalMinutes}
            />
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-0"
        style={{
          top: headerHeight,
          right: 0,
          height: 10,
          backgroundColor: "rgba(2,6,23,0.035)",
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
      `}</style>
    </div>
  );
}
