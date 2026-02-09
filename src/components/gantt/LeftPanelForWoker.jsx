import { useEffect, useMemo, useRef, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const wrapperStyle = {
    height: height === "auto" ? "auto" : `${height}px`,
    overflow: "hidden",
    transition: `height ${duration}ms ease`,
  };

  const innerStyle = {
    opacity: open ? 1 : 0,
    transform: open ? "translateY(0px)" : "translateY(-2px)",
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
  };

  return (
    <div style={wrapperStyle}>
      <div ref={innerRef} style={innerStyle}>
        {children}
      </div>
    </div>
  );
}

export default function LeftPanelForWorker({
  products,
  open,
  onToggle,
  width,
  rows,
  rowHeight = 44,
  headerHeight = 44,
  scrollRef,
  onScroll,

  workers = [],
  tools = [],
  onSaveAssignment,
}) {
  const containerRef = useRef(null);
  const innerRef = scrollRef || containerRef;

  const [activeKey, setActiveKey] = useState(null);
  const [overrides, setOverrides] = useState({});

  const [draft, setDraft] = useState({
    rowKey: null,
    scheduleId: null,
    productId: null,
    workerId: "",
    toolId: "",
  });

  const hasWorkerOptions = Array.isArray(workers) && workers.length > 0;
  const hasToolOptions = Array.isArray(tools) && tools.length > 0;

  const resolveWorkerName = (workerId) => {
    const w = (workers || []).find((x) => String(x.id) === String(workerId));
    return w?.name || (workerId ? String(workerId) : "미배정");
  };

  const openEditorForRow = (row) => {
    const ov = overrides[row.key];
    const initialWorkerId = ov?.workerId ?? row.workerId ?? "";
    const initialToolId = ov?.toolId ?? row.toolId ?? "";

    setDraft({
      rowKey: row.key,
      scheduleId: row.scheduleId ?? null,
      productId: row.productId,
      workerId: initialWorkerId,
      toolId: initialToolId,
    });
    setActiveKey(row.key);
  };

  const closeEditor = () => {
    setActiveKey(null);
    setDraft({
      rowKey: null,
      scheduleId: null,
      productId: null,
      workerId: "",
      toolId: "",
    });
  };

  const handleSave = async () => {
    const { rowKey, scheduleId, productId, workerId, toolId } = draft;
    if (!rowKey) return;

    setOverrides((prev) => ({
      ...prev,
      [rowKey]: {
        workerId,
        workerName: resolveWorkerName(workerId),
        toolId,
      },
    }));

    try {
      await onSaveAssignment?.({ scheduleId, productId, workerId, toolId });
    } finally {
      closeEditor();
    }
  };

  // 작업자별로 그룹화된 데이터 생성
  const groups = useMemo(() => {
    if (Array.isArray(rows) && rows.length) {
      const out = [];
      let current = null;

      for (const r of rows) {
        if (r.type === "group") {
          current = {
            workerId: r.workerId,
            workerName: r.workerName,
            open: Boolean(r.open ?? open?.[r.workerId]),
            tasks: [],
          };
          out.push(current);
        } else if (r.type === "task") {
          if (!current || current.workerId !== r.workerId) {
            current = {
              workerId: r.workerId,
              workerName: r.workerName || r.workerId,
              open: Boolean(open?.[r.workerId]),
              tasks: [],
            };
            out.push(current);
          }
          current.tasks.push(r);
        }
      }

      return out.map((g) => ({
        ...g,
        open: Boolean(open?.[g.workerId] ?? g.open),
      }));
    }

    return [];
  }, [rows, open]);

  const renderedRowCount = useMemo(() => {
    return groups.reduce(
      (acc, g) => acc + 1 + (g.open ? g.tasks.length : 0),
      0,
    );
  }, [groups]);

  const handleScroll = (e) => {
    if (onScroll) onScroll(e);
  };

  return (
    <div
      className="h-full"
      style={{
        width,
        minWidth: width,
        maxWidth: width,
      }}
    >
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-3 border-b border-slate-200 bg-white"
        style={{ height: headerHeight }}
      >
        <div className="text-xs font-semibold text-slate-700">
          작업자 / 작업
        </div>
        <div className="text-[11px] text-slate-500">
          {renderedRowCount} rows
        </div>
      </div>

      <div
        ref={innerRef}
        onScroll={handleScroll}
        className="overflow-y-auto overflow-x-hidden"
        style={{ height: `calc(100% - ${headerHeight}px)` }}
      >
        <div className="px-2">
          {groups.map((g) => {
            const isOpen = Boolean(g.open);

            return (
              <div key={`group:${g.workerId}`}>
                <div
                  style={{ height: rowHeight }}
                  className="flex items-center"
                >
                  <button
                    type="button"
                    onClick={() => onToggle?.(g.workerId)}
                    className={[
                      "w-full h-full flex items-center justify-between rounded-xl px-3 transition",
                      isOpen
                        ? "bg-sky-50 text-sky-900"
                        : "bg-white text-slate-800 hover:bg-sky-50/50",
                      "border border-slate-200 shadow-[0_1px_2px_rgba(2,6,23,0.05)]",
                      "active:scale-[0.99]",
                    ].join(" ")}
                    title={g.workerName}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="text-sky-600">{isOpen ? "▾" : "▸"}</span>
                      <span className="truncate text-sm font-semibold">
                        {g.workerName}
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
                      const ov = overrides[r.key];
                      const shownToolId = ov?.toolId ?? r.toolId;

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
                              <div className="text-sm font-medium text-slate-800 truncate leading-5">
                                {r.taskName}
                              </div>

                              <Popover
                                open={activeKey === r.key}
                                onOpenChange={(v) => {
                                  if (v) openEditorForRow(r);
                                  else if (activeKey === r.key) closeEditor();
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="mt-0.5 text-[11px] text-slate-500 hover:text-slate-700 truncate text-left leading-4"
                                    onClick={(e) => e.stopPropagation()}
                                    title="작업자/도구 변경"
                                  >
                                    {r.productName} · {shownToolId || "미지정"}
                                  </button>
                                </PopoverTrigger>

                                <PopoverContent
                                  align="start"
                                  side="bottom"
                                  className="w-72 p-3"
                                  onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                  <div className="text-sm font-semibold text-slate-800">
                                    작업자 / 도구 변경
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {r.productName} - {r.taskName}
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    <div className="space-y-1">
                                      <div className="text-[11px] font-medium text-slate-600">
                                        작업자(workerId)
                                      </div>

                                      {hasWorkerOptions ? (
                                        <Select
                                          value={
                                            draft.rowKey === r.key
                                              ? draft.workerId
                                              : ""
                                          }
                                          onValueChange={(v) =>
                                            setDraft((prev) => ({
                                              ...prev,
                                              workerId: v,
                                            }))
                                          }
                                        >
                                          <SelectTrigger className="h-9">
                                            <SelectValue placeholder="작업자 선택" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {workers.map((w) => (
                                              <SelectItem
                                                key={String(w.id)}
                                                value={String(w.id)}
                                              >
                                                {w.name} ({String(w.id)})
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          className="h-9"
                                          placeholder="workerId 입력"
                                          value={
                                            draft.rowKey === r.key
                                              ? draft.workerId
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setDraft((prev) => ({
                                              ...prev,
                                              workerId: e.target.value,
                                            }))
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <div className="text-[11px] font-medium text-slate-600">
                                        도구(toolId)
                                      </div>

                                      {hasToolOptions ? (
                                        <Select
                                          value={
                                            draft.rowKey === r.key
                                              ? draft.toolId
                                              : ""
                                          }
                                          onValueChange={(v) =>
                                            setDraft((prev) => ({
                                              ...prev,
                                              toolId: v,
                                            }))
                                          }
                                        >
                                          <SelectTrigger className="h-9">
                                            <SelectValue placeholder="도구 선택" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {tools.map((t) => (
                                              <SelectItem
                                                key={String(t.id)}
                                                value={String(t.id)}
                                              >
                                                {t.name
                                                  ? `${t.name} (${t.id})`
                                                  : String(t.id)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          className="h-9"
                                          placeholder="toolId 입력 (예: T-TBL-STS-001)"
                                          value={
                                            draft.rowKey === r.key
                                              ? draft.toolId
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setDraft((prev) => ({
                                              ...prev,
                                              toolId: e.target.value,
                                            }))
                                          }
                                        />
                                      )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          closeEditor();
                                        }}
                                      >
                                        취소
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleSave();
                                        }}
                                      >
                                        저장
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
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
