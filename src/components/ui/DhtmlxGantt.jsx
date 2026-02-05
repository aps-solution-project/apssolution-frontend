import { useEffect, useRef } from "react";
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "dhtmlx-gantt";

export default function DhtmlxGantt({ tasks, links, zoom }) {
  const ganttRef = useRef(null);

  useEffect(() => {
    gantt.config.date_format = "%Y-%m-%d %H:%i";
    gantt.config.scale_unit = "minute";

    if (zoom === 0) gantt.config.step = 5;
    if (zoom === 1) gantt.config.step = 15;
    if (zoom === 2) gantt.config.step = 30;

    gantt.config.subscales = [{ unit: "hour", step: 1, date: "%H:%i" }];
    gantt.config.row_height = 42;
    gantt.config.task_height = 26;

    gantt.init(ganttRef.current);

    gantt.clearAll();
    gantt.parse({ data: tasks, links });

    return () => gantt.clearAll();
  }, [tasks, links, zoom]);

  return (
    <div
      ref={ganttRef}
      className="w-full"
      style={{ height: "calc(100vh - 160px)" }}
    />
  );
}
