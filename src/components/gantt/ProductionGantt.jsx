// 간트 UI를 위한 레이아웃/스크롤 동기화/타임라인 데이터 생성 Provider 삭제 금지

import { atom, useAtom } from "jotai";
import throttle from "lodash.throttle";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { getDaysInMonth } from "date-fns";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const draggingAtom = atom(false);
const scrollXAtom = atom(0);

export const useGanttDragging = () => useAtom(draggingAtom);
export const useGanttScrollX = () => useAtom(scrollXAtom);

const GanttContext = createContext({});

/* ---------------- PROVIDER ---------------- */

export function GanttProvider({
  zoom = 100,
  range = "monthly",
  onAddItem,
  children,
  className,
}) {
  const scrollRef = useRef(null);
  const [timelineData] = useState(() => createTimeline(new Date()));
  const [, setScrollX] = useGanttScrollX();
  const [sidebarWidth] = useState(300);

  const columnWidth =
    range === "monthly" ? 150 : range === "quarterly" ? 100 : 50;

  const cssVars = {
    "--gantt-column-width": `${(zoom / 100) * columnWidth}px`,
    "--gantt-row-height": "36px",
    "--gantt-header-height": "60px",
    "--gantt-sidebar-width": `${sidebarWidth}px`,
  };

  const handleScroll = useCallback(
    throttle(() => {
      const el = scrollRef.current;
      if (!el) return;
      setScrollX(el.scrollLeft);
    }, 100),
    [setScrollX],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <GanttContext.Provider
      value={{
        zoom,
        range,
        columnWidth,
        sidebarWidth,
        timelineData,
        ref: scrollRef,
        onAddItem,
      }}
    >
      <div
        ref={scrollRef}
        className={cn(
          "relative grid overflow-y-auto overflow-x-hidden",
          className,
        )}
        style={{
          ...cssVars,
          gridTemplateColumns: "var(--gantt-sidebar-width) 1fr",
        }}
      >
        {children}
      </div>
    </GanttContext.Provider>
  );
}

/* ---------------- SIDEBAR ---------------- */

export function GanttSidebar({ children }) {
  return <div className="sticky left-0 border-r bg-background">{children}</div>;
}

export function GanttSidebarItem({ feature }) {
  return (
    <div className="flex items-center gap-2 p-2 text-xs hover:bg-secondary">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: feature?.status?.color }}
      />
      <span className="truncate">{feature?.name}</span>
    </div>
  );
}

/* ---------------- TIMELINE ---------------- */

export function GanttTimeline({ children }) {
  return <div className="relative w-max">{children}</div>;
}

/* ---------------- FEATURE ---------------- */

export function GanttFeatureItem({ id, name, ..._rest }) {
  const [, setDragging] = useGanttDragging();

  useEffect(() => {
    setDragging(false);
  }, [setDragging]);

  return <Card className="p-2 text-xs">{name}</Card>;
}

/* ---------------- UTIL ---------------- */

function createTimeline(today) {
  const years = [
    today.getFullYear() - 1,
    today.getFullYear(),
    today.getFullYear() + 1,
  ];

  return years.map((year) => ({
    year,
    quarters: Array.from({ length: 4 }, (_, q) => ({
      months: Array.from({ length: 3 }, (_, m) => ({
        days: getDaysInMonth(new Date(year, q * 3 + m, 1)),
      })),
    })),
  }));
}
