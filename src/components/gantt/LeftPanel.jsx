import { useEffect, useMemo, useRef, useState } from "react";
import { Separator } from "@/components/ui/separator";

function Collapse({ open, duration = 260, children }) {
  const innerRef = useRef(null);
  const [render, setRender] = useState(open);
  const [height, setHeight] = useState(open ? "auto" : 0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (open) {
      setRender(true);
      setHeight(0);
      requestAnimationFrame(() => {
        const h = el.scrollHeight;
        setHeight(h);
      });
      const t = setTimeout(() => setHeight("auto"), duration);
      return () => clearTimeout(t);
    } else {
      const h = el.scrollHeight;
      setHeight(h);
      requestAnimationFrame(() => setHeight(0));
      const t = setTimeout(() => setRender(false), duration);
      return () => clearTimeout(t);
    }
  }, [open, duration]);

  if (!render && !open) return null;

  return (
    <div
      style={{
        height: height === "auto" ? "auto" : `${height}px`,
        overflow: "hidden",
        transition: `height ${duration}ms ease`,
      }}
    >
      <div
        ref={innerRef}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0px)" : "translateY(-2px)",
          transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function LeftPanel({
  products,
  open,
  onToggle,
  width,
  rows,
  rowHeight = 44,
  headerHeight = 44,
  scrollRef,
  onScroll,
}) {
  const containerRef = useRef(null);
  const innerRef = scrollRef || containerRef;

  const groups = useMemo(() => {
    if (Array.isArray(rows) && rows.length) {
      const out = [];
      let current = null;

      for (const r of rows) {
        if (r.type === "group") {
          current = {
            productId: r.productId,
            productName: r.productName,
            open: Boolean(r.open ?? open?.[r.productId]),
            tasks: [],
          };
          out.push(current);
        } else if (r.type === "task") {
          if (!current || current.productId !== r.productId) {
            current = {
              productId: r.productId,
              productName: r.productName || r.productId,
              open: Boolean(open?.[r.productId]),
              tasks: [],
            };
            out.push(current);
          }
          current.tasks.push(r);
        }
      }

      return out.map((g) => ({
        ...g,
        open: Boolean(open?.[g.productId] ?? g.open),
      }));
    }

    const list = Array.isArray(products) ? products : [];
    return list.map((p) => {
      const schedules = Array.isArray(p.scenarioSchedules)
        ? p.scenarioSchedules
        : [];

      const taskRows = schedules.map((s, idx) => ({
        type: "task",
        key: `task:${p.id}:${s?.id ?? idx}`,
        productId: p.id,
        productName: p.name || p.id,
        taskName: s?.scheduleTask?.name || "작업",
      }));

      return {
        productId: p.id,
        productName: p.name || p.id,
        open: Boolean(open?.[p.id]),
        tasks: taskRows,
      };
    });
  }, [rows, products, open]);

  const renderedRowCount = useMemo(() => {
    return groups.reduce((acc, g) => acc + 1 + g.tasks.length, 0);
  }, [groups]);

  return (
    <div className="h-full" style={{ width, minWidth: width, maxWidth: width }}>
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-3 border-b border-slate-200 bg-white"
        style={{ height: headerHeight }}
      >
        <div className="text-xs font-semibold text-slate-700">품목 / 작업</div>
        <div className="text-[11px] text-slate-500">
          {renderedRowCount} rows
        </div>
      </div>

      <div
        ref={innerRef}
        onScroll={onScroll}
        className="overflow-y-auto overflow-x-hidden"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div className="px-2">
          {groups.map((g) => {
            const isOpen = Boolean(g.open);

            return (
              <div key={`group:${g.productId}`}>
                <div
                  style={{ height: rowHeight }}
                  className="flex items-center"
                >
                  <button
                    onClick={() => onToggle?.(g.productId)}
                    className={[
                      "w-full h-full flex items-center justify-between rounded-xl px-3 transition",
                      isOpen
                        ? "bg-sky-50 text-sky-900"
                        : "bg-white text-slate-800 hover:bg-sky-50/50",
                      "border border-slate-200 shadow-[0_1px_2px_rgba(2,6,23,0.05)]",
                      "active:scale-[0.99]",
                    ].join(" ")}
                    title={g.productName}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sky-600">{isOpen ? "▾" : "▸"}</span>
                      <span className="truncate text-sm font-semibold">
                        {g.productName}
                      </span>
                    </span>

                    <span
                      className={[
                        "text-[11px] font-medium",
                        isOpen ? "text-sky-700" : "text-slate-500",
                      ].join(" ")}
                    >
                      {g.tasks.length}
                    </span>
                  </button>
                </div>

                <Collapse open={isOpen}>
                  <div>
                    {g.tasks.map((r, i) => {
                      const isFirst = i === 0;
                      const isLast = i === g.tasks.length - 1;

                      return (
                        <div
                          key={r.key}
                          className="relative"
                          style={{ height: rowHeight }}
                        >
                          {isFirst && (
                            <Separator className="absolute left-6 right-3 top-0" />
                          )}

                          <div className="h-full flex items-center">
                            <div className="pl-6 pr-3 min-w-0 w-full">
                              <div className="text-[13px] font-medium text-slate-800 truncate">
                                {r.taskName}
                              </div>
                            </div>
                          </div>

                          {!isLast && (
                            <Separator className="absolute left-6 right-3 bottom-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Collapse>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
